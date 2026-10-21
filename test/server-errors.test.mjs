import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { registerHooks } from "node:module"
import { test } from "node:test"
import { createStaticHandler } from "react-router"
import ts from "typescript"

// Node does not load TSX directly. Compile the real server entry without Vite
// and keep the tests independent of local dotenv configuration.
const entryURL = new URL("../app/entry.server.tsx", import.meta.url).href
const imports = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL === entryURL && specifier === "dotenv") {
      return {
        url: "data:text/javascript,export default { config() {} }",
        shortCircuit: true,
      }
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (url === entryURL) {
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
const { handleError } = await import(entryURL)
imports.deregister()

const router = createStaticHandler([
  { id: "root", path: "*", loader: () => null },
])

function logs(t) {
  return {
    warn: t.mock.method(console, "warn", () => {}),
    error: t.mock.method(console, "error", () => {}),
  }
}

test("POST / retains HTTP 405 and logs one concise line", async (t) => {
  const output = logs(t)
  const request = new Request("https://example.test/?probe=1", {
    method: "POST",
  })
  const result = await router.query(request)

  assert.equal(result.statusCode, 405)
  assert.equal(handleError(result.errors.root, { request }), undefined)
  assert.equal(result.statusCode, 405)
  assert.equal(output.warn.mock.callCount(), 1)
  assert.deepEqual(output.warn.mock.calls[0].arguments, [
    "POST / -> 405 Method Not Allowed",
  ])
  assert.equal(output.error.mock.callCount(), 0)
})

for (const [method, path] of [
  ["POST", "/signin"],
  ["PUT", "/"],
]) {
  test(`${method} ${path} retains the full framework error`, async (t) => {
    const output = logs(t)
    const request = new Request(`https://example.test${path}`, { method })
    const result = await router.query(request)
    const error = result.errors.root

    handleError(error, { request })

    assert.equal(result.statusCode, 405)
    assert.equal(output.warn.mock.callCount(), 0)
    assert.equal(output.error.mock.callCount(), 1)
    assert.equal(output.error.mock.calls[0].arguments[0], error.error)
    assert.ok(error.error.stack)
  })
}

test("an unexpected error on POST / retains its original stack", (t) => {
  const output = logs(t)
  const error = new Error("Unexpected server failure")
  const request = new Request("https://example.test/", { method: "POST" })

  handleError(error, { request })

  assert.equal(output.warn.mock.callCount(), 0)
  assert.equal(output.error.mock.callCount(), 1)
  assert.equal(output.error.mock.calls[0].arguments[0], error)
  assert.ok(error.stack)
})

test("aborted requests retain the framework's silent logging behavior", async (t) => {
  const output = logs(t)
  const request = new Request("https://example.test/", { method: "POST" })
  const result = await router.query(request)
  const controller = new AbortController()
  const aborted = new Request(request, { signal: controller.signal })
  controller.abort()

  handleError(result.errors.root, { request: aborted })
  handleError(new Error("Cancelled request"), { request: aborted })

  assert.equal(output.warn.mock.callCount(), 0)
  assert.equal(output.error.mock.callCount(), 0)
})
