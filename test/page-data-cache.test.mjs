import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { registerHooks } from "node:module"
import { test } from "node:test"
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import useSWR, { unstable_serialize, useSWRConfig } from "swr"
import { JsxEmit, ModuleKind, transpileModule } from "typescript"

const componentUrl = new URL(
  "../app/components/page-data-cache.tsx",
  import.meta.url
)
const hooks = registerHooks({
  load(url, context, nextLoad) {
    if (url !== componentUrl.href) return nextLoad(url, context)
    return {
      format: "module",
      shortCircuit: true,
      source: transpileModule(readFileSync(componentUrl, "utf8"), {
        compilerOptions: { module: ModuleKind.ESNext, jsx: JsxEmit.ReactJSX },
      }).outputText,
    }
  },
})
const { PageDataCache } = await import(componentUrl.href)
hooks.deregister()

const key = ["https://example.test/api/aps/sotefin/map", "test-token"]

function openPage(initialData) {
  let config
  function Snapshot() {
    config = useSWRConfig()
    const { data } = useSWR(key, null, { fallbackData: initialData })
    return JSON.stringify(data)
  }
  const html = renderToString(
    createElement(PageDataCache, null, createElement(Snapshot))
  )
  return { ...config, html }
}

test("reopening a page uses the new server snapshot rather than a previous visit's cache", async () => {
  const first = openPage({ version: "first-server" })
  await first.mutate(key, { version: "old-visit" }, { revalidate: false })

  const reopened = openPage({ version: "fresh-server" })
  assert.notEqual(reopened.cache, first.cache)
  assert.match(reopened.html, /fresh-server/)
  assert.doesNotMatch(reopened.html, /old-visit/)
  assert.equal(reopened.cache.get(unstable_serialize(key))?.data, undefined)
})

test("discarding one page's snapshot does not clear another page's data", async () => {
  const first = openPage(null)
  const second = openPage(null)
  await first.mutate(key, { version: "first" }, { revalidate: false })
  await second.mutate(key, { version: "second" }, { revalidate: false })

  first.unload({ revalidate: false })
  assert.equal(first.cache.get(unstable_serialize(key))?.data, undefined)
  assert.equal(second.cache.get(unstable_serialize(key)).data.version, "second")
})

test("repeated outages retain at most the current snapshot", async () => {
  const page = openPage(null)
  for (let cycle = 0; cycle < 50; cycle++) {
    await page.mutate(key, { version: cycle }, { revalidate: false })
    assert.equal([...page.cache.keys()].length, 1)
    page.unload({ revalidate: false })
    assert.equal([...page.cache.keys()].length, 0)
  }
})

test("a response started before an outage cannot replace recovered data", async () => {
  const page = openPage(null)
  let resolveOldResponse
  const oldResponse = new Promise((resolve) => {
    resolveOldResponse = resolve
  })
  const pending = page.mutate(key, oldResponse, { revalidate: false })

  page.unload({ revalidate: false })
  await page.mutate(key, { version: "recovered" }, { revalidate: false })
  resolveOldResponse({ version: "before-outage" })
  await pending

  assert.equal(
    page.cache.get(unstable_serialize(key)).data.version,
    "recovered"
  )
  assert.equal([...page.cache.keys()].length, 1)
})
