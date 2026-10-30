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
const { CommInfo } = await import("../app/components/comm-info.tsx")
hooks.deregister()

for (const locale of ["en", "it"]) {
  for (const status of [true, false]) {
    test(`${locale}: PLC ${status ? "online" : "offline"} is an accessible full-badge link`, () => {
      setLocale(locale, { reload: false })
      const html = renderToStaticMarkup(
        createElement(CommInfo, { status, user: { aps: "test-plant" } })
      )
      const statusText = status ? m.comm_info_online() : m.comm_info_offline()
      const anchors = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)]
      assert.equal(anchors.length, 1)
      assert.match(anchors[0][1], /href="\/aps\/test-plant\/racks"/)
      assert.match(anchors[0][1], /data-slot="badge"/)
      assert.ok(
        anchors[0][1].includes(
          `aria-label="${m.comm_info_link_label({ status: statusText })}"`
        )
      )
      assert.match(anchors[0][2], /class="comm-info-dot" aria-hidden="true"/)
      assert.match(anchors[0][2], /PLC/)
      assert.match(html, new RegExp(`data-online="${status}"`))
      assert.ok(html.includes(m.comm_info_title()))
      assert.ok(html.includes(m.comm_info_hint()))
      assert.ok(html.includes(`>${statusText}</span>`))
      assert.doesNotMatch(html, /<button|Missing translation/)
    })
  }
}
