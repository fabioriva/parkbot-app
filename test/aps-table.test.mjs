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
    if (specifier.startsWith("~/")) {
      const path = specifier.slice(2)
      return next(
        new URL(
          path + (existsSync(new URL(path + ".tsx", root)) ? ".tsx" : ".ts"),
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
const { ApsTable } = await import("../app/components/aps-table.tsx")
hooks.deregister()
const one = Object.freeze({
  ns: "zeta",
  name: "North system",
  company: "Prime",
  city: "Dubai",
  country: "UAE",
  flag: "🇦🇪",
  parkingSpaces: 1250,
  timeZone: "Asia/Dubai",
  notifications: true,
})
const two = Object.freeze({
  ns: "alpha",
  name: "Lab system",
  company: "Sotefin",
  city: "Rome",
  country: "Italy",
  flag: "🇮🇹",
  parkingSpaces: 0,
  notifications: false,
})
const plants = Object.freeze([one, two])
const render = (aps) =>
  renderToStaticMarkup(
    createElement(ApsTable, { aps, busy: false, onUpdate() {}, onDelete() {} })
  )
for (const locale of ["en", "it"])
  test(`responsive table retains all fields and translated statuses (${locale})`, () => {
    setLocale(locale, { reload: false })
    const html = render(plants)
    assert.match(html, /lg:hidden/)
    assert.match(html, /lg:block/)
    assert.equal([...html.matchAll(/scope="col"/g)].length, 7)
    for (const value of [
      "North system",
      "zeta",
      "Prime",
      "Dubai",
      "UAE",
      "🇦🇪",
      "Asia/Dubai",
      "Lab system",
      "Rome",
    ])
      assert.ok(html.includes(value), value)
    assert.ok(html.includes(new Intl.NumberFormat(locale).format(1250)))
    assert.ok(html.includes(locale === "it" ? "Abilitate" : "Enabled"))
    assert.ok(html.includes(locale === "it" ? "Disabilitate" : "Disabled"))
    assert.ok(
      html.includes(
        locale === "it"
          ? "Azioni per North system (zeta)"
          : "Actions for North system (zeta)"
      )
    )
    assert.doesNotMatch(html, />TRUE<|>FALSE<|Open menu/)
    assert.match(html, />—</)
  })
test("sorts each responsive view by namespace without mutating its source", () => {
  setLocale("en", { reload: false })
  const html = render(plants)
  const mobile = html.slice(html.indexOf("<ul"), html.indexOf("</ul>"))
  const desktop = html.slice(html.indexOf("<table"))
  for (const view of [mobile, desktop])
    assert.ok(view.indexOf("Lab system") < view.indexOf("North system"))
  assert.equal(plants[0].ns, "zeta")
  assert.match(html, />0</)
})
test("long or markup-like names are preserved as escaped text", () => {
  const name = "<script>alert(1)</script>" + "Long name ".repeat(30)
  const html = render([{ ...one, name }])
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/)
  assert.doesNotMatch(html, /<script>/)
  assert.match(html, /break-words/)
})
