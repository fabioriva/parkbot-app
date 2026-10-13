import assert from "node:assert/strict"
import { registerHooks } from "node:module"
import { test } from "node:test"
import { memoryAdapter } from "better-auth/adapters/memory"
import { customSession, twoFactor } from "better-auth/plugins"

const database = {
  user: [],
  session: [],
  account: [],
  verification: [],
  twoFactor: [],
}
const state = {
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
  ["./email.server", "export async function sendEmail() {}"],
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
    'export const m = new Proxy({}, { get: () => () => "test" })',
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
