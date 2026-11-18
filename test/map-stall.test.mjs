import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { registerHooks } from "node:module"
import test from "node:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"
import { setLocale } from "../src/paraglide/runtime.js"

const state = { role: "valet", disabled: false, edits: 0, trigger: null }
globalThis.mapStallTest = state
const mock = (source) => ({
  url: `data:text/javascript,${encodeURIComponent(source)}`,
  shortCircuit: true,
})
const root = new URL("../app/", import.meta.url)
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "react-router")
      return mock(
        `export const useLoaderData = () => ({token: 'test'}); export const useParams = () => ({aps: 'test'}); export const useOutletContext = () => ({user:{role:globalThis.mapStallTest.role}});`
      )
    if (specifier === "~/components/map-edit")
      return mock(
        `export const useEditStallDialog = () => ({ disabled: globalThis.mapStallTest.disabled, showEditDialog: () => globalThis.mapStallTest.edits++ });`
      )
    if (specifier === "~/hooks/use-plant-time-zone")
      return mock(`export const usePlantTimeZone = () => 'Asia/Dubai';`)
    if (specifier === "~/lib/action")
      return mock(`export const actionResponse = () => {};`)
    if (specifier === "~/components/ui/tooltip")
      return mock(`
      import {createElement, Fragment} from ${JSON.stringify(import.meta.resolve("react"))};
      export const Tooltip = ({children}) => createElement(Fragment, null, children);
      export const TooltipTrigger = ({render}) => { globalThis.mapStallTest.trigger = render; return render; };
      export const TooltipContent = props => createElement('div', props);
    `)
    if (specifier === "~/lib/date-time")
      return next(new URL("lib/date-time.ts", root).href, context)
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
const { Stall } = await import("../app/components/map-stall.tsx")
hooks.deregister()
const definitions = {
  cards: 999,
  stallStatus: { FREE: 0, LOCK: 1000, PAPA: 1001, RSVD: 1002 },
}
function render(status) {
  return renderToStaticMarkup(
    createElement(Stall, {
      definitions,
      stall: { nr: 12, date: "2026-11-18T09:00:00Z", size: 2, status },
      view: "view2",
    })
  )
}
for (const locale of ["en", "it"])
  test(`tooltip separates slot, state and plant date (${locale})`, () => {
    setLocale(locale, { reload: false })
    for (const [status, label] of [
      [0, locale === "it" ? "Libero" : "Vacant"],
      [1000, locale === "it" ? "Bloccato" : "Locked"],
      [123, locale === "it" ? "Tessera 123" : "Card 123"],
    ]) {
      const html = render(status)
      assert.match(
        html,
        new RegExp(`<p[^>]*>${locale === "it" ? "Stallo" : "Slot"} 12</p>`)
      )
      assert.match(html, new RegExp(`<p[^>]*>${label}</p>`))
      assert.match(html, /18\/11\/2026 13:00:00 \+04:00/)
    }
  })
test("read-only and disconnected users can inspect without opening edit", () => {
  for (const [role, disabled] of [
    ["valet", false],
    ["user", false],
    ["admin", true],
    ["service", true],
  ]) {
    Object.assign(state, { role, disabled, edits: 0 })
    const html = render(123)
    assert.match(html, /aria-disabled="true"/)
    assert.doesNotMatch(html, /pointer-events-none| disabled=""/)
    assert.match(html, /aria-label="[^"]+"/)
    state.trigger.props.onClick()
    assert.equal(state.edits, 0)
  }
})
test("connected admin and service retain stall editing", () => {
  for (const role of ["admin", "service"]) {
    Object.assign(state, { role, disabled: false, edits: 0 })
    assert.match(render(123), /aria-disabled="false"/)
    state.trigger.props.onClick()
    assert.equal(state.edits, 1)
  }
})
