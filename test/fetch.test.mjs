import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { registerHooks } from "node:module"
import { test } from "node:test"
import { ModuleKind, transpileModule } from "typescript"

const fetchUrl = new URL("../app/lib/fetch.ts", import.meta.url)
const imports = registerHooks({
  load(url, context, nextLoad) {
    if (url !== fetchUrl.href) return nextLoad(url, context)
    return {
      format: "module",
      shortCircuit: true,
      source: transpileModule(readFileSync(fetchUrl, "utf8"), {
        compilerOptions: { module: ModuleKind.ESNext },
      }).outputText,
    }
  },
})
const { default: fetcher, HttpError } = await import(fetchUrl.href)
imports.deregister()

const url = "https://example.test/api/aps/sotefin/dashboard"

function setup(t, browser) {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window")
  if (browser) {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {},
    })
  } else {
    delete globalThis.window
  }
  t.after(() => {
    if (originalWindow) {
      Object.defineProperty(globalThis, "window", originalWindow)
    } else {
      delete globalThis.window
    }
  })
  t.mock.timers.enable({ apis: ["setTimeout"] })
}

function waitForAbort(signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason)
    signal.addEventListener("abort", () => reject(signal.reason), {
      once: true,
    })
  })
}

async function expectStatus(pending, status, browser, message) {
  const error = await pending.then(
    () => assert.fail("Expected the request to fail"),
    (error) => error
  )
  assert.equal(error.status, status)
  if (browser) {
    assert.ok(error instanceof HttpError)
    assert.equal(error.message, message)
  } else {
    assert.ok(error instanceof Response)
    assert.equal(await error.text(), message)
  }
}

for (const browser of [false, true]) {
  const runtime = browser ? "browser" : "server"

  test(`${runtime}: successful GET preserves authorization and clears the deadline`, async (t) => {
    setup(t, browser)
    let requestSignal
    const mock = t.mock.method(globalThis, "fetch", async (input, options) => {
      assert.equal(input, url)
      assert.equal(options.headers.Authorization, "Bearer test-token")
      requestSignal = options.signal
      return Response.json({ value: 42 })
    })

    assert.deepEqual(
      await fetcher(url, { headers: { Authorization: "Bearer test-token" } }),
      { value: 42 }
    )
    t.mock.timers.tick(10_000)
    assert.equal(requestSignal.aborted, false)
    assert.equal(mock.mock.callCount(), 1)
  })

  for (const [status, statusText] of [
    [401, "Unauthorized"],
    [403, "Forbidden"],
    [500, "Internal Server Error"],
  ]) {
    test(`${runtime}: HTTP ${status} retains its status`, async (t) => {
      setup(t, browser)
      const mock = t.mock.method(
        globalThis,
        "fetch",
        async () => new Response(null, { status, statusText })
      )
      await expectStatus(
        fetcher(url),
        status,
        browser,
        `${status} ${statusText}`
      )
      assert.equal(mock.mock.callCount(), 1)
    })
  }

  test(`${runtime}: a broken connection becomes 503 without retrying`, async (t) => {
    setup(t, browser)
    const mock = t.mock.method(globalThis, "fetch", async () => {
      throw new TypeError("fetch failed", {
        cause: new Error("Simulated closed socket"),
      })
    })
    await expectStatus(
      fetcher(url),
      503,
      browser,
      "503 API connection unavailable"
    )
    assert.equal(mock.mock.callCount(), 1)
  })

  test(`${runtime}: a stalled GET becomes 504 after ten seconds`, async (t) => {
    setup(t, browser)
    const mock = t.mock.method(globalThis, "fetch", (input, options) =>
      waitForAbort(options.signal)
    )
    const result = expectStatus(
      fetcher(url),
      504,
      browser,
      "504 API request timed out"
    )
    t.mock.timers.tick(9_999)
    assert.equal(mock.mock.calls[0].arguments[1].signal.aborted, false)
    t.mock.timers.tick(1)
    await result
    assert.equal(mock.mock.callCount(), 1)
  })

  test(`${runtime}: the deadline also covers a stalled response body`, async (t) => {
    setup(t, browser)
    t.mock.method(globalThis, "fetch", async (input, options) => {
      const body = new ReadableStream({
        start(controller) {
          options.signal.addEventListener("abort", () => {
            controller.error(options.signal.reason)
          })
        },
      })
      return new Response(body)
    })
    const result = expectStatus(
      fetcher(url),
      504,
      browser,
      "504 API request timed out"
    )
    t.mock.timers.tick(10_000)
    await result
  })

  test(`${runtime}: caller cancellation is preserved for Request inputs`, async (t) => {
    setup(t, browser)
    let requestSignal
    t.mock.method(globalThis, "fetch", (input, options) => {
      requestSignal = options.signal
      return waitForAbort(options.signal)
    })
    const controller = new AbortController()
    const request = new Request(url, { signal: controller.signal })
    const pending = fetcher(request)
    const cancellation = new DOMException("Navigation cancelled", "AbortError")
    const result = assert.rejects(pending, (error) => error === cancellation)
    controller.abort(cancellation)
    await result
    assert.equal(requestSignal.aborted, true)
  })

  test(`${runtime}: invalid JSON is not reported as a connection failure`, async (t) => {
    setup(t, browser)
    t.mock.method(globalThis, "fetch", async () => new Response("not JSON"))
    await assert.rejects(fetcher(url), SyntaxError)
  })
}

test("POST requests have no new deadline or automatic retries", async (t) => {
  setup(t, false)
  let finish
  const mock = t.mock.method(globalThis, "fetch", (input, options) => {
    assert.equal(options.method, "POST")
    assert.equal(options.signal, undefined)
    return new Promise((resolve) => {
      finish = resolve
    })
  })
  const pending = fetcher(url, { method: "POST", body: "test-body" })
  t.mock.timers.tick(20_000)
  finish(Response.json({ acknowledged: true }))
  assert.deepEqual(await pending, { acknowledged: true })
  assert.equal(mock.mock.callCount(), 1)
})

test("POST connection errors retain their original identity", async (t) => {
  setup(t, false)
  const original = new TypeError("fetch failed")
  const mock = t.mock.method(globalThis, "fetch", async () => {
    throw original
  })
  const request = new Request(url, { method: "POST", body: "test-body" })
  await assert.rejects(fetcher(request), (error) => error === original)
  assert.equal(mock.mock.callCount(), 1)
})
