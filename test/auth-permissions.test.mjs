import assert from "node:assert/strict"
import { registerHooks } from "node:module"
import { test } from "node:test"
import { memoryAdapter } from "better-auth/adapters/memory"
import { customSession, twoFactor } from "better-auth/plugins"
import { base32 } from "@better-auth/utils/base32"

const database = {
  user: [],
  session: [],
  account: [],
  verification: [],
  twoFactor: [],
}
const state = {
  emails: [],
  subscription: {
    email: "assigned@example.test",
    aps: ["avigail"],
    role: "service",
  },
}
globalThis.authTest = {
  memoryAdapter,
  customSession,
  twoFactor,
  database,
  state,
}
const dependencies = new Map([
  [
    "better-auth/adapters/mongodb",
    "export const mongodbAdapter = () => globalThis.authTest.memoryAdapter(globalThis.authTest.database)",
  ],
  [
    "better-auth/plugins",
    'export const { customSession, twoFactor } = globalThis.authTest; export const haveIBeenPwned = () => ({ id: "pwned-test" })',
  ],
  ["./db.server", "export const db = {}"],
  [
    "./email.server",
    "export async function sendEmail(email) { globalThis.authTest.state.emails.push(email) }",
  ],
  [
    "./aps.server",
    'export async function findApsByNs(ns) { return ns === "avigail" ? { name: "Avigail" } : null }',
  ],
  [
    "./subscription.server",
    "export async function findSubscriptionByEmail(email) { const s = globalThis.authTest.state.subscription; return s?.email === email.toLowerCase() ? s : null }",
  ],
  [
    "@paraglide/messages.js",
    'export const m = new Proxy({}, { get: () => (params) => params?.url ?? "test" })',
  ],
])
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    const source = dependencies.get(specifier)
    if (
      source !== undefined &&
      (context.parentURL?.includes("/app/lib/") ||
        specifier === "better-auth/plugins")
    )
      return {
        url: `data:text/javascript,${encodeURIComponent(source)}`,
        shortCircuit: true,
      }
    if (
      context.parentURL?.includes("/app/lib/") &&
      specifier.startsWith("./") &&
      !specifier.endsWith(".ts")
    )
      return nextResolve(`${specifier}.ts`, context)
    return nextResolve(specifier, context)
  },
})
process.env.BETTER_AUTH_SECRET = "auth-test-secret-with-at-least-32-characters"
const { auth } = await import("../app/lib/auth.server.ts")
hooks.deregister()

const signup = (email, extra = {}) =>
  auth.api.signUpEmail({
    body: { email, name: "Test", password: "Test-password-8234!", ...extra },
  })
const status = (expected) => (error) => {
  assert.equal(error.statusCode, expected)
  return true
}

test("Better Auth endpoints enforce subscription and server-assigned roles", async () => {
  await assert.rejects(
    signup("unassigned@example.test", { role: "admin" }),
    status(403)
  )
  const registered = await signup("assigned@example.test", { role: "admin" })
  assert.equal(registered.user.role, "service")
  assert.equal(database.user[0].role, "service")
  assert.equal(
    database.session.length,
    0,
    "unverified signup must not create a session"
  )
  await assert.rejects(
    auth.api.signInEmail({
      body: { email: "assigned@example.test", password: "Test-password-8234!" },
    }),
    status(403)
  )

  database.user[0].emailVerified = true
  const signedIn = await auth.api.signInEmail({
    body: { email: "assigned@example.test", password: "Test-password-8234!" },
    returnHeaders: true,
  })
  const cookie = signedIn.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ")
  const headers = new Headers({ cookie })
  await assert.rejects(
    auth.api.updateUser({ headers, body: { role: "admin" } }),
    status(400)
  )
  await assert.rejects(
    auth.api.updateUser({ headers, body: { aps: "menloa" } }),
    status(403)
  )
  await auth.api.updateUser({ headers, body: { aps: "avigail" } })
  state.subscription.role = "valet"
  let session = await auth.api.getSession({ headers })
  assert.equal(
    session.user.role,
    "valet",
    "live subscription overrides stale stored role"
  )
  assert.deepEqual(session.assignedAps, ["avigail"])
  state.subscription.aps = []
  session = await auth.api.getSession({ headers })
  assert.deepEqual(session.assignedAps, [])
  assert.equal(session.aps, null)
  await assert.rejects(
    auth.api.updateUser({ headers, body: { aps: "avigail" } }),
    status(403)
  )
  state.subscription = null
  session = await auth.api.getSession({ headers })
  assert.equal(session.user.role, null)
})

const password = "Test-password-8234!"

function mergeCookies(headers, responseHeaders) {
  const jar = new Map(
    (headers.get("cookie") ?? "")
      .split("; ")
      .filter(Boolean)
      .map((pair) => {
        const separator = pair.indexOf("=")
        return [pair.slice(0, separator), pair.slice(separator + 1)]
      })
  )
  for (const cookie of responseHeaders.getSetCookie()) {
    const pair = cookie.split(";")[0]
    const separator = pair.indexOf("=")
    const name = pair.slice(0, separator)
    const value = pair.slice(separator + 1)
    if (!value) jar.delete(name)
    else jar.set(name, value)
  }
  return new Headers({
    cookie: [...jar].map(([name, value]) => `${name}=${value}`).join("; "),
  })
}

async function verifiedAccount(email) {
  state.subscription = { email, aps: ["avigail"], role: "service" }
  await signup(email)
  database.user.find((user) => user.email === email).emailVerified = true
  const signedIn = await auth.api.signInEmail({
    body: { email, password },
    returnHeaders: true,
  })
  return mergeCookies(new Headers(), signedIn.headers)
}

test("logout and expired sessions are rejected and stale cookies are cleared", async () => {
  const headers = await verifiedAccount("logout@example.test")
  assert.ok(await auth.api.getSession({ headers }))
  await auth.api.signOut({ headers })
  assert.equal(await auth.api.getSession({ headers }), null)

  const expiredHeaders = await verifiedAccount("expired@example.test")
  const user = database.user.find(
    (user) => user.email === "expired@example.test"
  )
  database.session.find((session) => session.userId === user.id).expiresAt =
    new Date(Date.now() - 1000)
  const expired = await auth.api.getSession({
    headers: expiredHeaders,
    returnHeaders: true,
  })
  assert.equal(expired.response, null)
  assert.ok(
    expired.headers
      .getSetCookie()
      .some(
        (cookie) =>
          cookie.includes("parkbot.session_token=") && /max-age=0/i.test(cookie)
      )
  )
})

test("password reset changes the credential, revokes sessions and consumes the token", async () => {
  const email = "reset@example.test"
  const headers = await verifiedAccount(email)
  await auth.api.requestPasswordReset({ body: { email } })
  const message = state.emails.filter((message) => message.to === email).at(-1)
  const token = new URL(message.text).pathname.split("/").at(-1)
  assert.ok(token)
  const newPassword = "Replacement-password-9345!"
  await auth.api.resetPassword({ body: { token, newPassword } })
  assert.equal(await auth.api.getSession({ headers }), null)
  await assert.rejects(
    auth.api.signInEmail({ body: { email, password } }),
    status(401)
  )
  const signedIn = await auth.api.signInEmail({
    body: { email, password: newPassword },
  })
  assert.ok(signedIn.token)
  await assert.rejects(auth.api.resetPassword({ body: { token, newPassword } }))
})

test("TOTP enrollment and sign-in require the second factor", async () => {
  const email = "totp@example.test"
  let headers = await verifiedAccount(email)
  const enabled = await auth.api.enableTwoFactor({
    headers,
    body: { password },
    returnHeaders: true,
  })
  headers = mergeCookies(headers, enabled.headers)
  const encodedSecret = new URL(enabled.response.totpURI).searchParams.get(
    "secret"
  )
  assert.ok(encodedSecret)
  const secret = new TextDecoder().decode(base32.decode(encodedSecret))
  const { code } = await auth.api.generateTOTP({ body: { secret } })
  const enrolled = await auth.api.verifyTOTP({
    headers,
    body: { code },
    returnHeaders: true,
  })
  headers = mergeCookies(headers, enrolled.headers)
  assert.equal(
    (await auth.api.getSession({ headers })).user.twoFactorEnabled,
    true
  )
  await auth.api.signOut({ headers })

  const challenge = await auth.api.signInEmail({
    body: { email, password },
    returnHeaders: true,
  })
  assert.equal(challenge.response.twoFactorRedirect, true)
  headers = mergeCookies(new Headers(), challenge.headers)
  assert.equal(await auth.api.getSession({ headers }), null)
  await assert.rejects(
    auth.api.verifyTOTP({ headers, body: { code: "invalid" } })
  )
  const current = await auth.api.generateTOTP({ body: { secret } })
  const verified = await auth.api.verifyTOTP({
    headers,
    body: { code: current.code },
    returnHeaders: true,
  })
  headers = mergeCookies(headers, verified.headers)
  const session = await auth.api.getSession({ headers })
  assert.equal(session.user.email, email)
  assert.equal(session.user.twoFactorEnabled, true)
})

test("customSession propagates storage failures instead of returning a signed-out session", async () => {
  const headers = await verifiedAccount("lookup-error@example.test")
  const sessions = database.session
  Object.defineProperty(database, "session", {
    configurable: true,
    get() {
      throw new Error("Simulated session storage failure")
    },
  })
  try {
    await assert.rejects(auth.api.getSession({ headers }), status(500))
  } finally {
    Object.defineProperty(database, "session", {
      configurable: true,
      writable: true,
      value: sessions,
    })
  }
  assert.ok(await auth.api.getSession({ headers }))
})
