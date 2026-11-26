import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { registerHooks } from "node:module"
import test from "node:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"
import { setLocale } from "../src/paraglide/runtime.js"
const root = new URL("../app/", import.meta.url)
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "~/components/ui/popover")
      return {
        url: `data:text/javascript,${encodeURIComponent(`import {createElement,Fragment} from ${JSON.stringify(import.meta.resolve("react"))};export const Popover=({children})=>createElement(Fragment,null,children);export const PopoverTrigger=({render})=>render;export const PopoverContent=({align,...props})=>createElement('div',props);export const PopoverTitle=props=>createElement('h3',props);export const PopoverDescription=props=>createElement('p',props);`)}`,
        shortCircuit: true,
      }
    if (specifier.startsWith("~/")) {
      const p = specifier.slice(2)
      return next(
        new URL(
          p + (existsSync(new URL(p + ".tsx", root)) ? ".tsx" : ".ts"),
          root
        ).href,
        context
      )
    }
    if (specifier.startsWith("@paraglide/"))
      return next(
        new URL("../src/paraglide/" + specifier.slice(11), import.meta.url)
          .href,
        context
      )
    return next(specifier, context)
  },
  load(url, context, next) {
    if (url.startsWith(root.href) && /\.tsx?$/.test(url))
      return {
        format: "module",
        source: ts.transpileModule(readFileSync(new URL(url), "utf8"), {
          compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2022,
            jsx: ts.JsxEmit.ReactJSX,
          },
        }).outputText,
        shortCircuit: true,
      }
    return next(url, context)
  },
})
const { SubscriptionTable } =
  await import("../app/components/subscription-table.tsx")
hooks.deregister()
const aps = Object.freeze(
  ["one", "two", "four", "five", "unassigned"].map((ns) =>
    Object.freeze({ ns, name: `System ${ns}`, company: "Prime" })
  )
)
const assigned = Object.freeze(["one", "two", "legacy", "four", "five"])
const first = Object.freeze({
  email: "zeta@example.test",
  company: "Prime",
  role: "service",
  subscribed: true,
  aps: assigned,
})
const second = Object.freeze({
  email: "alpha@example.test",
  company: "Sotefin",
  role: "valet",
  subscribed: false,
  aps: Object.freeze([]),
})
const subscriptions = Object.freeze([first, second])
const render = (items = subscriptions) =>
  renderToStaticMarkup(
    createElement(SubscriptionTable, {
      aps,
      busy: false,
      onUpdate() {},
      onDelete() {},
      subscriptions: items,
    })
  )
for (const locale of ["en", "it"])
  test(`responsive views preserve fields and localized registration statuses (${locale})`, () => {
    setLocale(locale, { reload: false })
    const html = render()
    assert.match(html, /lg:hidden/)
    assert.match(html, /lg:block/)
    assert.equal([...html.matchAll(/scope="col"/g)].length, 6)
    for (const text of [
      "zeta@example.test",
      "Prime",
      "service",
      "valet",
      "Sotefin",
    ])
      assert.ok(html.includes(text), text)
    for (const text of locale === "it"
      ? [
          "Registrato",
          "Da registrare",
          "Nessun impianto",
          "Azioni per zeta@example.test",
        ]
      : [
          "Registered",
          "Pending registration",
          "No systems",
          "Actions for zeta@example.test",
        ])
      assert.ok(html.includes(text), text)
    assert.doesNotMatch(html, />TRUE<|>FALSE<|Open menu/)
  })
test("assignment preview shows +N only for overflow; full list retains every assigned system", () => {
  setLocale("en", { reload: false })
  for (const length of [0, 1, 3, 5]) {
    const html = render([{ ...first, aps: assigned.slice(0, length) }])
    if (length <= 3) assert.doesNotMatch(html, />\+\d+</)
    else assert.match(html, />\+2</)
    if (length)
      assert.ok(
        html.includes(
          `View all ${length} systems assigned to zeta@example.test`
        )
      )
    for (const ns of assigned.slice(0, length)) assert.ok(html.includes(ns), ns)
    assert.ok(!html.includes("System unassigned"))
    assert.doesNotMatch(html, /\] \.\.\./)
  }
  const html = render([first])
  for (const text of [
    "System one",
    "System two",
    "System four",
    "System five",
    "legacy",
  ])
    assert.ok(html.includes(text), text)
})
test("email sorting does not mutate subscriptions or their assignments", () => {
  const html = render()
  const mobile = html.slice(html.indexOf("<ul"), html.indexOf("</ul>"))
  const desktop = html.slice(html.indexOf("<table"))
  for (const view of [mobile, desktop])
    assert.ok(
      view.indexOf("alpha@example.test") < view.indexOf("zeta@example.test")
    )
  assert.equal(subscriptions[0].email, "zeta@example.test")
  assert.deepEqual(assigned, ["one", "two", "legacy", "four", "five"])
})
test("long registration labels and identifiers can wrap; markup is escaped", () => {
  const html = render([
    {
      ...second,
      email: "<script>alert(1)</script>@example.test",
      company: "Company ".repeat(40),
    },
  ])
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/)
  assert.doesNotMatch(html, /<script>/)
  assert.match(html, /whitespace-normal/)
  assert.match(html, /break-all/)
})
