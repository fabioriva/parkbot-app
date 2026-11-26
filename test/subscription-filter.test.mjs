import assert from "node:assert/strict"
import { registerHooks } from "node:module"
import test from "node:test"
import { ALL_COMPANIES } from "../app/lib/aps-filter.ts"
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (
      specifier === "./aps-filter" &&
      context.parentURL?.endsWith("/subscription-filter.ts")
    )
      return next("./aps-filter.ts", context)
    return next(specifier, context)
  },
})
const { filterSubscriptions, subscriptionCompanies } =
  await import("../app/lib/subscription-filter.ts")
hooks.deregister()
const aps = Object.freeze([
  Object.freeze({ ns: "menloa", name: "Menlo Park" }),
  Object.freeze({ ns: "daman-n", name: "North system" }),
  Object.freeze({ ns: "sao", name: "São Paulo" }),
  Object.freeze({ ns: "unassigned", name: "Unassigned site" }),
])
const subscriptions = Object.freeze([
  Object.freeze({
    email: "first@example.test",
    company: "Sotefin",
    aps: Object.freeze(["menloa"]),
    subscribed: true,
  }),
  Object.freeze({
    email: "second@example.test",
    company: "Sotefin",
    aps: Object.freeze(["sao"]),
    subscribed: false,
  }),
  Object.freeze({
    email: "third@example.test",
    company: "Prime",
    aps: Object.freeze(["daman-n", "legacy-aps"]),
    subscribed: false,
  }),
  Object.freeze({
    email: "fourth@example.test",
    company: "Subscription only",
    aps: Object.freeze([]),
    subscribed: true,
  }),
])
const filter = (company = ALL_COMPANIES, query = "") =>
  filterSubscriptions(subscriptions, aps, company, query)
test("all companies and Sotefin are distinct and companies with subscriptions only remain available", () => {
  assert.deepEqual(filter(), subscriptions)
  assert.deepEqual(filter("Sotefin"), [subscriptions[0], subscriptions[1]])
  assert.deepEqual(filter("Subscription only"), [subscriptions[3]])
  assert.deepEqual(
    subscriptionCompanies(subscriptions, [
      "Sotefin",
      "Prime",
      "Prime",
      "",
      "Plant only",
    ]),
    ["Plant only", "Prime", "Sotefin", "Subscription only"]
  )
})
test("email search ignores case and surrounding spaces", () => {
  assert.deepEqual(filter(ALL_COMPANIES, " FIRST@EXAMPLE.TEST "), [
    subscriptions[0],
  ])
  assert.equal(filter(ALL_COMPANIES, "example.test").length, 4)
})
test("search finds assigned namespaces and full system names", () => {
  for (const query of ["menloa", "Menlo Park"])
    assert.deepEqual(filter(ALL_COMPANIES, query), [subscriptions[0]])
  for (const query of ["daman-n", "North system"])
    assert.deepEqual(filter(ALL_COMPANIES, query), [subscriptions[2]])
  assert.deepEqual(filter(ALL_COMPANIES, "SAO PAULO"), [subscriptions[1]])
})
test("unassigned systems do not match and missing system definitions remain searchable by namespace", () => {
  assert.deepEqual(filter(ALL_COMPANIES, "Unassigned site"), [])
  assert.deepEqual(filter(ALL_COMPANIES, "legacy-aps"), [subscriptions[2]])
})
test("company and search combine and pending counts follow the results", () => {
  assert.deepEqual(filter("Sotefin", "North system"), [])
  const selected = filter("Prime", "North system")
  assert.deepEqual(selected, [subscriptions[2]])
  assert.equal(selected.filter((item) => item.subscribed === false).length, 1)
  assert.equal(
    filter("Sotefin").filter((item) => item.subscribed === false).length,
    1
  )
})
test("empty input, whitespace and unmatched filters are handled", () => {
  assert.deepEqual(filter(ALL_COMPANIES, "   "), subscriptions)
  assert.deepEqual(filter("Unknown"), [])
  assert.deepEqual(filterSubscriptions([], aps, ALL_COMPANIES, ""), [])
  assert.deepEqual(
    filterSubscriptions(subscriptions, [], ALL_COMPANIES, "menloa"),
    [subscriptions[0]]
  )
  assert.deepEqual(subscriptionCompanies([], []), [])
})
test("filtering and sorting results do not mutate subscriptions or assignments", () => {
  const selected = filter()
  assert.notEqual(selected, subscriptions)
  selected.sort((a, b) => b.email.localeCompare(a.email))
  assert.equal(subscriptions[0].email, "first@example.test")
  assert.deepEqual(subscriptions[2].aps, ["daman-n", "legacy-aps"])
})
