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
  import { createElement, cloneElement, Fragment } from ${JSON.stringify(import.meta.resolve("react"))};
  export const Tooltip = ({ children }) => createElement(Fragment, null, children);
  export const TooltipTrigger = ({ render, ...props }) => cloneElement(render, props);
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
    if (specifier === "~/components/ui/badge")
      return {
        url: new URL("components/ui/badge.tsx", appRoot).href,
        shortCircuit: true,
      }
    if (specifier === "~/lib/utils")
      return { url: new URL("lib/utils.ts", appRoot).href, shortCircuit: true }
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
const { ParkInfo } = await import("../app/components/park-info.tsx")
hooks.deregister()

const render = (occupancy) =>
  renderToStaticMarkup(
    createElement(ParkInfo, { occupancy, user: { aps: "test-plant" } })
  )
const counts = (html) =>
  [...html.matchAll(/<dd[^>]*>([^<]*)<\/dd>/g)].map((match) => match[1])
const normal = [
  { id: "busy", value: 2 },
  { id: "free", value: 7 },
  { id: "lock", value: 1 },
]

test("occupancy counts are matched by ID even when the payload is reordered", () => {
  setLocale("en", { reload: false })
  for (const occupancy of [normal, [normal[2], normal[0], normal[1]]]) {
    const html = render(occupancy)
    assert.deepEqual(counts(html), ["2", "7", "1", "10"])
    assert.match(html, /aria-label="Parked cars: 2. Open the map"/)
    assert.match(html, /href="\/aps\/test-plant\/map"/)
    assert.match(html, /lucide-car-front/)
  }
})

test("a genuinely empty parking system retains its valid zero counts", () => {
  setLocale("en", { reload: false })
  const html = render(normal.map((item) => ({ ...item, value: 0 })))
  assert.deepEqual(counts(html), ["0", "0", "0", "0"])
  assert.match(html, /Parked cars: 0/)
})

for (const occupancy of [[], null, undefined]) {
  test(`missing occupancy ${JSON.stringify(occupancy)} is not displayed as zero`, () => {
    setLocale("en", { reload: false })
    const html = render(occupancy)
    assert.deepEqual(counts(html), ["—", "—", "—", "—"])
    assert.match(html, /Occupancy unavailable. Open the map/)
  })
}

test("a partial payload never produces a misleading total", () => {
  setLocale("en", { reload: false })
  assert.deepEqual(counts(render(normal.slice(0, 2))), ["2", "7", "—", "—"])
})

for (const value of [-1, 1.5, NaN, Infinity]) {
  test(`invalid occupancy count ${value} is marked unavailable`, () => {
    setLocale("en", { reload: false })
    const html = render(
      normal.map((item) => (item.id === "busy" ? { ...item, value } : item))
    )
    assert.deepEqual(counts(html), ["—", "7", "1", "—"])
    assert.match(html, /Occupancy unavailable/)
  })
}

test("occupancy labels and the accessible map link are localized", () => {
  setLocale("it", { reload: false })
  const html = render(normal)
  assert.match(html, /Vetture parcheggiate: 2. Apri la mappa/)
  for (const id of ["busy", "free", "lock"])
    assert.ok(html.includes(m[`occupancy.${id}`]()))
  assert.match(html, /Totale posti/)
  assert.doesNotMatch(html, /Missing translation/)
})
