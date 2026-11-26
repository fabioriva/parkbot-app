import assert from "node:assert/strict"
import test from "node:test"
import { ALL_USER_ROLES, filterUsers } from "../app/lib/user-filter.ts"

const users = Object.freeze([
  Object.freeze({
    name: "José Rossi",
    email: "jose@example.test",
    role: "admin",
    emailVerified: true,
    twoFactorEnabled: true,
  }),
  Object.freeze({
    name: "Anna Bianchi",
    email: "anna@example.test",
    role: "service",
    emailVerified: false,
    twoFactorEnabled: false,
  }),
  Object.freeze({
    name: "Marco Verdi",
    email: "marco@example.test",
    role: "valet",
    emailVerified: true,
  }),
  Object.freeze({
    name: "Alessia Rossi",
    email: "alessia@example.test",
    role: "—",
    emailVerified: false,
    twoFactorEnabled: true,
  }),
])

test("defaults show every user, including users without a valid subscription role", () => {
  assert.deepEqual(filterUsers(users), users)
  assert.deepEqual(filterUsers(users, { role: ALL_USER_ROLES }), users)
  assert.deepEqual(filterUsers(users, { role: "—" }), [users[3]])
})

test("name and email search ignores case, accents and surrounding whitespace", () => {
  assert.deepEqual(filterUsers(users, { search: " JOSE " }), [users[0]])
  assert.deepEqual(filterUsers(users, { search: "ANNA@EXAMPLE.TEST" }), [
    users[1],
  ])
  assert.deepEqual(filterUsers(users, { search: "rossi" }), [
    users[0],
    users[3],
  ])
})

test("role selection matches exactly without changing the role stored on users", () => {
  for (const user of users)
    assert.deepEqual(filterUsers(users, { role: user.role }), [user])
  assert.deepEqual(filterUsers(users, { role: "unknown" }), [])
})

test("email verification filters distinguish verified and pending accounts", () => {
  assert.deepEqual(filterUsers(users, { emailVerified: "yes" }), [
    users[0],
    users[2],
  ])
  assert.deepEqual(filterUsers(users, { emailVerified: "no" }), [
    users[1],
    users[3],
  ])
})

test("2FA filters treat an absent flag as not enabled, consistently with the table", () => {
  assert.deepEqual(filterUsers(users, { twoFactor: "yes" }), [
    users[0],
    users[3],
  ])
  assert.deepEqual(filterUsers(users, { twoFactor: "no" }), [
    users[1],
    users[2],
  ])
})

test("search and all filters combine with AND, including contradictory selections", () => {
  assert.deepEqual(
    filterUsers(users, {
      search: "example.test",
      role: "service",
      emailVerified: "no",
      twoFactor: "no",
    }),
    [users[1]]
  )
  assert.deepEqual(
    filterUsers(users, {
      role: "admin",
      emailVerified: "no",
      twoFactor: "yes",
    }),
    []
  )
})

test("empty input and no matches are handled without mutating source data", () => {
  assert.deepEqual(filterUsers([]), [])
  assert.deepEqual(filterUsers(users, { search: "   " }), users)
  assert.deepEqual(filterUsers(users, { search: "missing" }), [])
  const results = filterUsers(users)
  assert.notEqual(results, users)
  results.reverse()
  assert.equal(users[0].email, "jose@example.test")
  assert.equal(users[2].twoFactorEnabled, undefined)
})
