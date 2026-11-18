import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { registerHooks } from "node:module"
import test from "node:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"
import { setLocale } from "../src/paraglide/runtime.js"
const root = new URL("../app/", import.meta.url)
globalThis.apsSelectNavigation = { state: "idle" }
const mock = (source) => ({
  url: `data:text/javascript,${encodeURIComponent(source)}`,
  shortCircuit: true,
})
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier.endsWith(".css")) return mock("export {}")
    if (specifier === "react-router")
      return mock(
        `import {createElement} from ${JSON.stringify(import.meta.resolve("react"))}; export const Form = props => createElement('form', props); export const useNavigation = () => globalThis.apsSelectNavigation; export const data = x => x; export const redirect = x => x;`
      )
    if (specifier === "~/lib/auth.server") return mock("export const auth = {}")
    if (specifier === "~/lib/authorization.server")
      return mock("export const requireSession = () => {}")
    if (specifier === "~/lib/aps.server")
      return mock("export const findSubscribedApsList = () => {}")
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
    if (specifier === "@paraglide/messages.js")
      return next(
        new URL("../src/paraglide/messages.js", import.meta.url).href,
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
const { default: ApsSelect } = await import("../app/routes/auth/aps-select.tsx")
hooks.deregister()
const plant = {
  ns: "test",
  name: "Test plant",
  city: "Lugano",
  country: "Switzerland",
  flag: "",
  parkingSpaces: 123,
}
const render = (plants) =>
  renderToStaticMarkup(createElement(ApsSelect, { loaderData: plants }))
for (const locale of ["it", "en"])
  test(`empty state is localized and retains signout intent (${locale})`, () => {
    setLocale(locale, { reload: false })
    globalThis.apsSelectNavigation = { state: "idle" }
    const html = render([])
    assert.match(
      html,
      new RegExp(
        locale === "it" ? "Nessun impianto assegnato" : "No systems assigned"
      )
    )
    assert.match(html, new RegExp(locale === "it" ? "Contatta" : "Contact"))
    assert.match(
      html,
      /<button\b(?=[^>]*name="intent")(?=[^>]*value="signout")/
    )
    assert.doesNotMatch(html, /No Aps assigned| disabled=""/)
  })
test("pending signout has a disabled button and localized progress", () => {
  setLocale("it", { reload: false })
  globalThis.apsSelectNavigation = {
    state: "submitting",
    formAction: "/aps-select",
  }
  const html = render([])
  assert.match(html, /Disconnessione…/)
  assert.match(html, /disabled=""/)
  assert.match(html, /aria-busy="true"/)
})
test("selection is locked during submission and progress continues while loading", () => {
  setLocale("en", { reload: false })
  for (const state of ["submitting", "loading"]) {
    globalThis.apsSelectNavigation = { state, formAction: "/aps-select" }
    const html = render([plant])
    assert.match(html, /Opening system…/)
    assert.match(html, /aria-busy="true"/)
    assert.match(html, /data-disabled/)
  }
  globalThis.apsSelectNavigation = { state: "idle", formAction: "/aps-select" }
  assert.doesNotMatch(
    render([plant]),
    /Opening system…|aria-busy="true"|disabled=""/
  )
})
