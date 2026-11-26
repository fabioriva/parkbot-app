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
    if (specifier === "~/components/ui/dialog")
      return {
        url: `data:text/javascript,${encodeURIComponent(`import {createElement,cloneElement} from ${JSON.stringify(import.meta.resolve("react"))};export const Dialog=({children,open})=>open?createElement('div',null,children):null;export const DialogContent=({showCloseButton,...props})=>createElement('div',props);export const DialogHeader=DialogContent;export const DialogFooter=DialogContent;export const DialogTitle=props=>createElement('h2',props);export const DialogDescription=props=>createElement('p',props);export const DialogClose=({render})=>cloneElement(render,{type:'button'});`)}`,
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
const { ApsForm } = await import("../app/components/aps-form.tsx")
hooks.deregister()
const plant = {
  ns: "daman-n",
  name: "North system",
  company: "Prime",
  city: "Dubai",
  country: "UAE",
  flag: "🇦🇪",
  timeZone: "Asia/Dubai",
  parkingSpaces: 0,
  notifications: true,
}
const fetcher = { state: "idle", Form: (props) => createElement("form", props) }
const render = (action = "create") =>
  renderToStaticMarkup(
    createElement(ApsForm, {
      action,
      fetcher,
      open: true,
      setOpen() {},
      selectedAps: action === "update" ? plant : undefined,
    })
  )
for (const locale of ["it", "en"])
  test(`form sections and controls are localized (${locale})`, () => {
    setLocale(locale, { reload: false })
    const html = render()
    for (const text of locale === "it"
      ? [
          "Identità dell’impianto",
          "Località",
          "Configurazione",
          "Annulla",
          "Salva",
        ]
      : ["System identity", "Location", "Configuration", "Cancel", "Save"])
      assert.ok(html.includes(text), text)
    assert.match(html, /sm:max-w-xl/)
    assert.match(html, /grid-cols-1/)
    assert.match(html, /sm:grid-cols-2/)
    assert.match(html, /overflow-y-auto/)
    assert.doesNotMatch(html, /Save changes|grid-cols-3/)
  })
test("all fields have associated labels and IDs are unique across forms", () => {
  const html = render("update")
  const labels = [...html.matchAll(/<label[^>]*for="([^"]+)"/g)].map(
    (match) => match[1]
  )
  assert.equal(labels.length, 9)
  for (const id of labels) assert.ok(html.includes(`id="${id}"`), id)
  assert.equal(new Set(labels).size, 9)
  const together = renderToStaticMarkup(
    createElement(
      "div",
      null,
      createElement(ApsForm, {
        action: "create",
        fetcher,
        open: true,
        setOpen() {},
      }),
      createElement(ApsForm, {
        action: "update",
        fetcher,
        open: true,
        setOpen() {},
        selectedAps: plant,
      })
    )
  )
  const ids = [...together.matchAll(/<label[^>]*for="([^"]+)"/g)].map(
    (match) => match[1]
  )
  assert.equal(new Set(ids).size, 18)
})
test("namespace remains enabled and submitted when read-only in update", () => {
  const html = render("update")
  const input = html.match(/<input\b(?=[^>]*name="ns")[^>]*>/)[0]
  assert.match(input, /readonly=""/i)
  assert.match(input, /value="daman-n"/)
  assert.doesNotMatch(input, /disabled=""/)
  assert.match(html, /name="action"[^>]*value="update"/)
  const create = render().match(/<input\b(?=[^>]*name="ns")[^>]*>/)[0]
  assert.doesNotMatch(create, /readonly/i)
  assert.match(create, /required=""/)
})
test("existing location, zero capacity and notification settings are preserved", () => {
  const html = render("update")
  for (const [name, value] of [
    ["country", "UAE"],
    ["city", "Dubai"],
    ["timeZone", "Asia/Dubai"],
    ["parkingSpaces", "0"],
  ]) {
    const input = html.match(
      new RegExp(`<input\\b(?=[^>]*name="${name}")[^>]*>`)
    )[0]
    assert.ok(input.includes(`value="${value}"`), name)
  }
  assert.match(html, /<input\b(?=[^>]*name="notifications")(?=[^>]*checked="")/)
})
