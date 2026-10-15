import assert from "node:assert/strict"
import { randomBytes } from "node:crypto"
import { readFile } from "node:fs/promises"
import { createRequire, registerHooks } from "node:module"
import { once } from "node:events"
import { resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { parseEnv } from "node:util"
import test from "node:test"
import { MongoClient, ObjectId } from "mongodb"
import { customSession, twoFactor } from "better-auth/plugins"
import { base32 } from "@better-auth/utils/base32"

const appRoot = fileURLToPath(new URL("../", import.meta.url))
const apiRoot = resolve(appRoot, "../parkbot-api")
const prefix = "parkbot-auth-test-179-"
const password = "Mongo-test-password-8234!"

function mergeCookies(headers, responseHeaders) {
  const jar = new Map(
    (headers.get("cookie") ?? "")
      .split("; ")
      .filter(Boolean)
      .map((pair) => {
        const index = pair.indexOf("=")
        return [pair.slice(0, index), pair.slice(index + 1)]
      })
  )
  for (const cookie of responseHeaders.getSetCookie()) {
    const pair = cookie.split(";")[0]
    const index = pair.indexOf("=")
    if (pair.slice(index + 1))
      jar.set(pair.slice(0, index), pair.slice(index + 1))
    else jar.delete(pair.slice(0, index))
  }
  return new Headers({
    cookie: [...jar].map(([name, value]) => `${name}=${value}`).join("; "),
  })
}

const status = (expected) => (error) => {
  assert.equal(error.statusCode ?? error.status, expected)
  return true
}

test(
  "app/API authentication against an isolated MongoDB database",
  {
    skip: process.env.AUTH_MONGODB_INTEGRATION !== "1",
    timeout: 90_000,
  },
  async (t) => {
    assert.equal(
      process.env.NODE_ENV,
      "production",
      "Use npm run test:auth:mongodb to initialize production cookie defaults before imports"
    )
    const envFile = process.env.AUTH_TEST_ENV_FILE || resolve(apiRoot, ".env")
    const uri = parseEnv(await readFile(envFile, "utf8")).MONGODB_URI
    assert.ok(uri, "MONGODB_URI is missing from the selected env file")
    for (const root of [appRoot, apiRoot]) {
      const installed = JSON.parse(
        await readFile(
          resolve(root, "node_modules/better-auth/package.json"),
          "utf8"
        )
      )
      assert.equal(installed.version, "1.7.9")
    }
    const runId = `${Date.now()}-${randomBytes(6).toString("hex")}`
    const databaseName = prefix + runId
    const assertTestDatabase = () =>
      assert.match(databaseName, /^parkbot-auth-test-179-\d+-[a-f0-9]{12}$/)
    assertTestDatabase()
    const client = new MongoClient(uri, {
      appName: "parkbot-auth-validation-179",
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      maxPoolSize: 3,
      monitorCommands: true,
    })
    const db = client.db(databaseName)
    const databasesAccessed = new Set()
    client.on("commandStarted", (event) =>
      databasesAccessed.add(event.databaseName)
    )
    let owned = false
    let imports
    const savedEnv = Object.fromEntries(
      [
        "BETTER_AUTH_SECRET",
        "BETTER_AUTH_URL",
        "MONGODB_URI",
        "TWO_FACTOR",
      ].map((key) => [key, process.env[key]])
    )
    try {
      try {
        await client.connect()
        await db.command({ ping: 1 })
      } catch (error) {
        throw new Error(
          `Cannot connect to MongoDB for isolated validation (${error.name}); URI omitted`
        )
      }
      assert.equal(
        await db.listCollections().hasNext(),
        false,
        "Test database already exists; refusing to use it"
      )
      assertTestDatabase()
      await db.collection("__test_run").insertOne({
        _id: runId,
        purpose: "Better Auth 1.7.9 integration validation",
      })
      owned = true
      console.log(`Isolated database: ${databaseName}`)

      const emails = []
      globalThis.parkbotMongoIntegration = {
        db,
        emails,
        customSession,
        twoFactor,
      }
      process.env.BETTER_AUTH_SECRET =
        "isolated-mongo-test-secret-with-at-least-32-characters"
      process.env.BETTER_AUTH_URL = "https://sotefinservice.com"
      // Only this URI is inherited by the backend test import; its db() call is
      // redirected below before it can create any real client or use production.
      process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/unused-test-only"
      process.env.TWO_FACTOR = "disabled"
      const stubs = new Map([
        [
          "./db.server",
          "export const db = globalThis.parkbotMongoIntegration.db",
        ],
        [
          "./email.server",
          "export async function sendEmail(email) { globalThis.parkbotMongoIntegration.emails.push(email) }",
        ],
        [
          "@paraglide/messages.js",
          'export const m = new Proxy({}, { get: () => (params) => params?.url ?? "test" })',
        ],
        [
          "better-auth/plugins",
          'export const { customSession, twoFactor } = globalThis.parkbotMongoIntegration; export const haveIBeenPwned = () => ({ id: "pwned-test" })',
        ],
      ])
      imports = registerHooks({
        resolve(specifier, context, nextResolve) {
          if (context.parentURL?.includes("/parkbot-app/app/lib/")) {
            const source = stubs.get(specifier)
            if (source)
              return {
                url: `data:text/javascript,${encodeURIComponent(source)}`,
                shortCircuit: true,
              }
            if (specifier.startsWith("./") && !specifier.endsWith(".ts"))
              return nextResolve(`${specifier}.ts`, context)
          }
          if (
            context.parentURL ===
              pathToFileURL(resolve(apiRoot, "lib/auth.js")).href &&
            specifier === "mongodb"
          ) {
            const source =
              'export class MongoClient { db(name) { if (name !== "parkbot-auth") throw new Error("Unexpected database selector"); return globalThis.parkbotMongoIntegration.db } }'
            return {
              url: `data:text/javascript,${encodeURIComponent(source)}`,
              shortCircuit: true,
            }
          }
          return nextResolve(specifier, context)
        },
      })
      const { auth: appAuth } = await import("../app/lib/auth.server.ts")
      const api = await import(
        pathToFileURL(resolve(apiRoot, "lib/auth.js")).href
      )
      const { authenticatedWebSocket } = await import(
        pathToFileURL(resolve(apiRoot, "lib/websocket-auth.js")).href
      )
      imports.deregister()
      imports = undefined
      assert.equal(
        (await appAuth.$context).authCookies.sessionToken.name,
        (await api.auth.$context).authCookies.sessionToken.name,
        "App/API cookie security configuration must match in this HTTPS production test"
      )
      await db.collection("aps").insertOne({
        ns: "test-plant",
        name: "Synthetic test plant",
        timeZone: "Europe/Rome",
      })
      const signup = (email, extra = {}) =>
        appAuth.api.signUpEmail({
          body: { email, name: "Synthetic user", password, ...extra },
        })
      const signIn = (email) =>
        appAuth.api.signInEmail({
          body: { email, password },
          returnHeaders: true,
        })
      async function account(email) {
        await db.collection("subscription").insertOne({
          email,
          aps: ["test-plant"],
          role: "service",
          company: "Synthetic",
          subscribed: false,
        })
        await signup(email)
        await db
          .collection("user")
          .updateOne({ email }, { $set: { emailVerified: true } })
        const signed = await signIn(email)
        return {
          headers: mergeCookies(new Headers(), signed.headers),
          token: signed.response.token,
        }
      }

      await t.test(
        "signup, email verification and protected role/APS fields",
        async () => {
          await assert.rejects(
            signup("unassigned@example.test", { role: "admin" }),
            status(403)
          )
          const email = "signup@example.test"
          await db
            .collection("subscription")
            .insertOne({ email, aps: ["test-plant"], role: "service" })
          const registered = await signup(email, { role: "admin" })
          assert.equal(registered.user.role, "service")
          assert.equal(await db.collection("session").countDocuments({}), 0)
          await assert.rejects(signIn(email), status(403))
          const mail = emails.filter((mail) => mail.to === email).at(-1)
          const verification = new URL(mail.text)
          const verified = await appAuth.handler(new Request(verification))
          assert.ok(verified.status >= 200 && verified.status < 400)
          assert.equal(
            (await db.collection("user").findOne({ email })).emailVerified,
            true
          )
          const signed = await signIn(email)
          const headers = mergeCookies(new Headers(), signed.headers)
          await assert.rejects(
            appAuth.api.updateUser({ headers, body: { role: "admin" } }),
            status(400)
          )
          await assert.rejects(
            appAuth.api.updateUser({ headers, body: { aps: "not-assigned" } }),
            status(403)
          )
          await appAuth.api.updateUser({ headers, body: { aps: "test-plant" } })
          const session = await appAuth.api.getSession({ headers })
          assert.equal(session.aps.name, "Synthetic test plant")
          assert.deepEqual(session.assignedAps, ["test-plant"])
        }
      )

      await t.test(
        "shared app cookie and bearer sessions, current role and plant revocation",
        async () => {
          const email = "shared@example.test"
          const { headers, token } = await account(email)
          const bearer = { authorization: `Bearer ${token}` }
          assert.equal((await api.checkAuth(headers)).user.email, email)
          assert.equal((await api.checkAuth(bearer)).user.email, email)
          await db
            .collection("subscription")
            .updateOne({ email }, { $set: { role: "valet" } })
          assert.equal(
            (await appAuth.api.getSession({ headers })).user.role,
            "valet"
          )
          await api.authorize(bearer, "test-plant", "exit")
          await assert.rejects(
            api.authorize(bearer, "test-plant", "entry"),
            status(403)
          )
          await assert.rejects(
            api.authorize(bearer, "test-plant", "pp"),
            status(403)
          )
          await assert.rejects(
            api.authorize(bearer, "other-plant", "read"),
            status(403)
          )
          await db
            .collection("subscription")
            .updateOne({ email }, { $set: { aps: [] } })
          await assert.rejects(
            api.authorize(bearer, "test-plant", "read"),
            status(403)
          )
          await db.collection("subscription").deleteOne({ email })
          assert.equal(
            (await appAuth.api.getSession({ headers })).user.role,
            null
          )
          await assert.rejects(
            api.authorize(bearer, "test-plant", "read"),
            status(403)
          )
          await appAuth.api.signOut({ headers })
          await assert.rejects(
            api.authorize(bearer, "test-plant", "read"),
            status(401)
          )
        }
      )

      await t.test(
        "expired sessions clear cookies and are rejected by both repos",
        async () => {
          const { headers, token } = await account("expiry@example.test")
          await db
            .collection("session")
            .updateOne(
              { token },
              { $set: { expiresAt: new Date(Date.now() - 1000) } }
            )
          const expired = await appAuth.api.getSession({
            headers,
            returnHeaders: true,
          })
          assert.equal(expired.response, null)
          assert.ok(
            expired.headers
              .getSetCookie()
              .some((cookie) => /max-age=0/i.test(cookie))
          )
          assert.equal(
            await api.checkAuth({ authorization: `Bearer ${token}` }),
            null
          )
        }
      )

      await t.test(
        "password reset consumes its token and revokes sessions in both repos",
        async () => {
          const email = "reset@example.test"
          const { headers, token } = await account(email)
          await appAuth.api.requestPasswordReset({ body: { email } })
          const mail = emails.filter((mail) => mail.to === email).at(-1)
          const resetToken = new URL(mail.text).pathname.split("/").at(-1)
          const newPassword = "New-Mongo-test-password-9345!"
          await appAuth.api.resetPassword({
            body: { token: resetToken, newPassword },
          })
          assert.equal(await appAuth.api.getSession({ headers }), null)
          assert.equal(
            await api.checkAuth({ authorization: `Bearer ${token}` }),
            null
          )
          await assert.rejects(signIn(email), status(401))
          assert.ok(
            (
              await appAuth.api.signInEmail({
                body: { email, password: newPassword },
              })
            ).token
          )
          await assert.rejects(
            appAuth.api.resetPassword({
              body: { token: resetToken, newPassword },
            })
          )
        }
      )

      await t.test(
        "TOTP enrollment and challenge use real MongoDB records",
        async () => {
          const email = "totp@example.test"
          let { headers } = await account(email)
          const enabled = await appAuth.api.enableTwoFactor({
            headers,
            body: { password },
            returnHeaders: true,
          })
          headers = mergeCookies(headers, enabled.headers)
          const encoded = new URL(enabled.response.totpURI).searchParams.get(
            "secret"
          )
          const secret = new TextDecoder().decode(base32.decode(encoded))
          const { code } = await appAuth.api.generateTOTP({ body: { secret } })
          const enrolled = await appAuth.api.verifyTOTP({
            headers,
            body: { code },
            returnHeaders: true,
          })
          headers = mergeCookies(headers, enrolled.headers)
          assert.equal(
            (await appAuth.api.getSession({ headers })).user.twoFactorEnabled,
            true
          )
          await appAuth.api.signOut({ headers })
          const challenge = await signIn(email)
          assert.equal(challenge.response.twoFactorRedirect, true)
          headers = mergeCookies(new Headers(), challenge.headers)
          assert.equal(await appAuth.api.getSession({ headers }), null)
          await assert.rejects(
            appAuth.api.verifyTOTP({ headers, body: { code: "invalid" } })
          )
          const current = await appAuth.api.generateTOTP({ body: { secret } })
          const verified = await appAuth.api.verifyTOTP({
            headers,
            body: { code: current.code },
            returnHeaders: true,
          })
          headers = mergeCookies(headers, verified.headers)
          assert.equal(
            (await api.checkAuth(headers)).user.twoFactorEnabled,
            true
          )
        }
      )

      await t.test(
        "real WebSocket handshake and session revocation over loopback",
        { timeout: 25000 },
        async () => {
          const { headers, token } = await account("websocket@example.test")
          const requireApi = createRequire(resolve(apiRoot, "package.json"))
          const uWS = requireApi("uWebSockets.js")
          const WebSocket = requireApi("ws")
          const behavior = authenticatedWebSocket({
            authorize: api.authorize,
            aps: "test-plant",
            permission: "read",
            topic: "aps/info",
          })
          const server = uWS.App().ws("/info", {
            ...behavior,
            open(ws) {
              behavior.open(ws)
              ws.send("authenticated")
            },
          })
          let listener
          let socket
          try {
            listener = await new Promise((resolve) =>
              server.listen("127.0.0.1", 0, resolve)
            )
            assert.ok(listener, "Cannot open loopback WebSocket listener")
            const port = uWS.us_socket_local_port(listener)
            socket = new WebSocket(
              `ws://127.0.0.1:${port}/info`,
              ["parkbot", `parkbot-session.${token}`],
              { headers: { origin: "https://sotefinservice.com" } }
            )
            const [message] = await once(socket, "message", {
              signal: AbortSignal.timeout(5000),
            })
            assert.equal(message.toString(), "authenticated")
            assert.equal(socket.protocol, "parkbot")
            const closed = once(socket, "close", {
              signal: AbortSignal.timeout(20000),
            })
            await appAuth.api.signOut({ headers })
            const [code] = await closed
            assert.equal(code, 1008)
          } finally {
            socket?.terminate()
            if (listener) uWS.us_listen_socket_close(listener)
          }
        }
      )

      // MongoDB's native ObjectIds must be usable across the two installations.
      const stored = await db
        .collection("user")
        .findOne({ email: "shared@example.test" })
      assert.ok(stored._id instanceof ObjectId)
      assert.deepEqual(
        [...databasesAccessed],
        [databaseName],
        "A command selected a database outside the isolated test database"
      )
    } finally {
      imports?.deregister()
      try {
        if (owned) {
          assertTestDatabase()
          assert.equal(
            (await db.collection("__test_run").findOne({ _id: runId }))
              ?.purpose,
            "Better Auth 1.7.9 integration validation"
          )
          await db.dropDatabase()
          console.log(`Removed isolated database: ${databaseName}`)
        }
      } finally {
        await client.close()
        delete globalThis.parkbotMongoIntegration
        for (const [key, value] of Object.entries(savedEnv)) {
          if (value === undefined) delete process.env[key]
          else process.env[key] = value
        }
      }
    }
  }
)
