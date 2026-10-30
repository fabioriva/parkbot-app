import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { registerHooks } from "node:module"
import test from "node:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"
import { setLocale } from "../src/paraglide/runtime.js"
import { m } from "../src/paraglide/messages.js"

// Render the tooltip body without its portal, so content can be checked in Node.
const tooltipModule = `
  import { createElement, Fragment } from ${JSON.stringify(import.meta.resolve("react"))};
  export const Tooltip = ({ children }) => createElement(Fragment, null, children);
  export const TooltipTrigger = props => createElement('button', { type: 'button', ...props });
  export const TooltipContent = props => createElement('div', props);
`
const appRoot = new URL("../app/", import.meta.url)
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.endsWith(".css"))
      return { url: "data:text/javascript,export {}", shortCircuit: true }
    if (specifier === "~/components/ui/tooltip")
      return {
        url: `data:text/javascript,${encodeURIComponent(tooltipModule)}`,
        shortCircuit: true,
      }
    if (specifier === "~/lib/trans")
      return { url: new URL("lib/trans.ts", appRoot).href, shortCircuit: true }
    if (specifier === "@paraglide/messages.js")
      return nextResolve(
        new URL("../src/paraglide/messages.js", import.meta.url).href,
        context
      )
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (url.startsWith(appRoot.href) && /\.tsx?$/.test(url)) {
      const { outputText } = ts.transpileModule(
        readFileSync(new URL(url), "utf8"),
        {
          compilerOptions: {
            module: ts.ModuleKind.ESNext,
            jsx: ts.JsxEmit.ReactJSX,
          },
        }
      )
      return { format: "module", source: outputText, shortCircuit: true }
    }
    return nextLoad(url, context)
  },
})
const { IoTooltip } = await import("../app/components/io-tooltip.tsx")
hooks.deregister()

const render = (io) =>
  renderToStaticMarkup(createElement(IoTooltip, { io }, createElement("span")))

for (const [status, expected] of [
  [true, "TRUE"],
  [1, "TRUE"],
  [false, "FALSE"],
  [0, "FALSE"],
]) {
  test(`status ${status} has an explicit ${expected} label`, () => {
    setLocale("en", { reload: false })
    const html = render({ label: "DB32", addr: "DB1.DBX0.0", status })
    assert.match(html, new RegExp(`data-status="${expected}"`))
    assert.match(html, new RegExp(`aria-label="DB32, status: ${expected}"`))
    assert.match(html, /DB1.DBX0.0/)
  })
}

for (const io of [null, undefined]) {
  test(`missing signal ${io} is unavailable rather than FALSE`, () => {
    setLocale("en", { reload: false })
    const html = render(io)
    assert.match(html, /data-status="—"/)
    assert.match(html, /Data unavailable/)
    assert.match(html, /Description unavailable/)
    assert.doesNotMatch(html, /FALSE/)
  })
}

test("an unavailable status on an existing signal is not treated as FALSE", () => {
  setLocale("en", { reload: false })
  const html = render({ label: "DB32", addr: "DB1.DBX0.0" })
  assert.match(html, /data-status="—"/)
  assert.doesNotMatch(html, /FALSE/)
})

test("special signal names retain their exact translation", () => {
  setLocale("en", { reload: false })
  assert.ok(render({ label: "DB32", status: 0 }).includes(m["io.DB32"]()))
})

test("numbered and suffixed signals retain their numbered description", () => {
  setLocale("en", { reload: false })
  for (const label of ["AMM2", "AMM2-A"])
    assert.ok(render({ label, status: 1 }).includes(m["io.AMMx"]({ nr: 2 })))
})

test("unknown descriptions use a readable fallback", () => {
  setLocale("en", { reload: false })
  const html = render({ label: "UNKNOWN", status: false })
  assert.match(html, /Description unavailable/)
  assert.doesNotMatch(html, /Missing translation/)
})

test("Italian labels and accessible trigger names are localized", () => {
  setLocale("it", { reload: false })
  const html = render({ label: "DB32", addr: "DB1.DBX0.0", status: 1 })
  assert.match(html, /Indirizzo/)
  assert.match(html, /aria-label="DB32, stato: TRUE"/)
  assert.ok(html.includes(m["io.DB32"]()))
})
