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
const fetchUrl = new URL("../app/lib/fetch.ts", import.meta.url)
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "~/lib/fetch") {
      return { url: fetchUrl.href, shortCircuit: true }
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (url !== componentUrl.href && url !== fetchUrl.href) {
      return nextLoad(url, context)
    }
    return {
      format: "module",
      shortCircuit: true,
      source: transpileModule(readFileSync(new URL(url), "utf8"), {
        compilerOptions: { module: ModuleKind.ESNext, jsx: JsxEmit.ReactJSX },
      }).outputText,
    }
  },
})
const { PageDataCache } = await import(componentUrl.href)
const { HttpError } = await import(fetchUrl.href)
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

for (const status of [401, 403, 404]) {
  test(`page configuration disables error retries for HTTP ${status}`, () => {
    const page = openPage(null)
    assert.equal(
      page.shouldRetryOnError(new HttpError(status, "Test error")),
      false
    )
  })
}

for (const status of [500, 502, 503, 504]) {
  test(`page configuration allows recovery from HTTP ${status}`, () => {
    const page = openPage(null)
    assert.equal(
      page.shouldRetryOnError(new HttpError(status, "Test error")),
      true
    )
  })
}

test("other errors retain SWR's existing retry behavior", () => {
  const page = openPage(null)
  assert.equal(page.shouldRetryOnError(new Error("Test error")), true)
})

test("temporary error retries retain SWR's progressive delays", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] })
  t.mock.method(Math, "random", () => 0.5)
  const page = openPage(null)
  const retries = []
  const retry = () => retries.push("retry")
  const error = new HttpError(503, "503 API connection unavailable")

  page.onErrorRetry(error, "test-resource", page, retry, { retryCount: 1 })
  t.mock.timers.tick(page.errorRetryInterval * 2 - 1)
  assert.equal(retries.length, 0)
  t.mock.timers.tick(1)
  assert.equal(retries.length, 1)

  page.onErrorRetry(error, "test-resource", page, retry, { retryCount: 2 })
  t.mock.timers.tick(page.errorRetryInterval * 4 - 1)
  assert.equal(retries.length, 1)
  t.mock.timers.tick(1)
  assert.equal(retries.length, 2)
})
