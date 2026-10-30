import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { registerHooks } from "node:module"
import test from "node:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"
import { setLocale } from "../src/paraglide/runtime.js"

const appRoot = new URL("../app/", import.meta.url)
globalThis.historyTableTestTimeZone = "Europe/Rome"
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.endsWith(".css"))
      return { url: "data:text/javascript,export {}", shortCircuit: true }
    if (specifier === "~/hooks/use-plant-time-zone")
      return {
        url: "data:text/javascript,export const usePlantTimeZone = () => globalThis.historyTableTestTimeZone",
        shortCircuit: true,
      }
    if (specifier.startsWith("~/")) {
      for (const extension of [".tsx", ".ts", ".js"]) {
        const url = new URL(specifier.slice(2) + extension, appRoot)
        if (existsSync(url)) return { url: url.href, shortCircuit: true }
      }
    }
    if (specifier.startsWith("@paraglide/"))
      return nextResolve(
        new URL("../src/paraglide/" + specifier.slice(11), import.meta.url)
          .href,
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
const { HistoryTable } = await import("../app/components/history-table.tsx")
hooks.deregister()

const entry = {
  date: "2026-10-29T23:30:00Z",
  device: { id: 2, key: "Lift 2" },
  mode: { id: 8, key: "mode-auto" },
  operation: { id: 5, key: "op-stall-in" },
  card: 183,
  stall: 201,
  size: 2,
}
function render(currentPage = 1, pages = 3) {
  return renderToStaticMarkup(
    createElement(HistoryTable, {
      currentPage,
      pages,
      paginate: () => {},
      query: [entry],
      rowsPerPage: 15,
    })
  )
}

for (const [name, page, pages, expected] of [
  ["first page", 1, 3, [true, true, false, false]],
  ["middle page", 2, 3, [false, false, false, false]],
  ["last page", 3, 3, [false, false, true, true]],
  ["single page", 1, 1, [true, true, true, true]],
  ["no pages", 1, 0, [true, true, true, true]],
]) {
  test(`pagination uses native disabled buttons on ${name}`, () => {
    setLocale("en", { reload: false })
    const html = render(page, pages)
    const buttons = [...html.matchAll(/<button\b[^>]*>/g)].map(
      (match) => match[0]
    )
    assert.equal(buttons.length, 4)
    assert.deepEqual(
      buttons.map((button) => /\sdisabled(?:=|\s|>)/.test(button)),
      expected
    )
    assert.ok(buttons.every((button) => button.includes('type="button"')))
    assert.doesNotMatch(html, /href="#"/)
  })
}

test("timestamps retain the plant time zone across a UTC date boundary", () => {
  globalThis.historyTableTestTimeZone = "Europe/Rome"
  const html = render()
  assert.match(html, /00:30:00/)
  assert.match(html, /\+01:00/)
  assert.match(html, /30\/10\/2026/)
  assert.match(html, /datetime="2026-10-29T23:30:00Z"/i)
})

test("a missing plant time zone never falls back to the browser time zone", () => {
  globalThis.historyTableTestTimeZone = null
  try {
    const html = render()
    assert.doesNotMatch(html, /00:30:00|23:30:00<|30\/10\/2026|29\/10\/2026/)
    assert.match(html, /—/)
  } finally {
    globalThis.historyTableTestTimeZone = "Europe/Rome"
  }
})

test("pagination labels and history entries render in Italian", () => {
  setLocale("it", { reload: false })
  const html = render()
  assert.match(html, /aria-label="Prima pagina"/)
  assert.match(html, /aria-label="Ultima pagina"/)
  assert.match(html, /Precedente/)
  assert.match(html, /Successiva/)
  assert.match(html, /Stallo occupato/)
  assert.doesNotMatch(html, /Missing translation/)
})
