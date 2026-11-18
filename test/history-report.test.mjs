import assert from "node:assert/strict"
import { readFileSync, writeFileSync } from "node:fs"
import { registerHooks } from "node:module"
import test from "node:test"
import ts from "typescript"
import { inflateSync } from "node:zlib"
const root = new URL("../app/", import.meta.url)
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "~/lib/authorization.server")
      return {
        url: "data:text/javascript,export const requireAps = (...args) => globalThis.pdfAuth(...args)",
        shortCircuit: true,
      }
    if (specifier === "~/lib/cookie.server")
      return {
        url: "data:text/javascript,export const getToken = () => 'test-token'",
        shortCircuit: true,
      }
    if (specifier.startsWith("~/"))
      return next(new URL(specifier.slice(2) + ".ts", root).href, context)
    if (specifier.startsWith("@paraglide/"))
      return next(
        new URL("../src/paraglide/" + specifier.slice(11), import.meta.url)
          .href,
        context
      )
    if (
      specifier.startsWith(".") &&
      context.parentURL?.startsWith(root.href) &&
      !specifier.endsWith(".ts")
    )
      return next(new URL(specifier + ".ts", context.parentURL).href, context)
    return next(specifier, context)
  },
  load(url, context, next) {
    if (url.startsWith(root.href) && url.endsWith(".ts"))
      return {
        format: "module",
        source: ts.transpileModule(readFileSync(new URL(url), "utf8"), {
          compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2022,
          },
        }).outputText,
        shortCircuit: true,
      }
    return next(url, context)
  },
})
const { reportParameters } = await import("../app/lib/history-query.ts")
const { createHistoryReport } =
  await import("../app/lib/history-report.server.ts")
const { loader } = await import("../app/routes/aps/history-report.ts")
hooks.deregister()
const search = new URLSearchParams({
  from: "2026-10-25",
  to: "2026-10-25",
  card: "0",
  device: "0",
  stall: "0",
})
const parsed = reportParameters(search, "Europe/Rome")
test("report query preserves a 25-hour DST day and rejects malformed filters", () => {
  assert.equal(parsed.parameters.dateFrom, "2026-10-24T22:00:00.000Z")
  assert.equal(parsed.parameters.dateTo, "2026-10-25T23:00:00.000Z")
  for (const [key, value] of [
    ["from", "2026-02-30"],
    ["to", "2026-10-24"],
    ["card", "-1"],
    ["device", "1x"],
    ["stall", "9007199254740992"],
  ]) {
    const invalid = new URLSearchParams(search)
    invalid.set(key, value)
    assert.throws(() => reportParameters(invalid, "Europe/Rome"), RangeError)
  }
  const duplicate = new URLSearchParams(search)
  duplicate.append("card", "12")
  assert.throws(() => reportParameters(duplicate, "Europe/Rome"), RangeError)
})
const base = {
  plant: "Test plant",
  timeZone: "Europe/Rome",
  range: parsed.range,
  filters: parsed.parameters,
  now: new Date("2026-10-25T12:00:00Z"),
}
const row = {
  date: "2026-10-25T02:00:00Z",
  device: { id: 1, key: "EL1" },
  mode: { id: 8, key: "mode-auto" },
  operation: { id: 3, key: "op-entry" },
  card: 123,
  stall: 4,
  size: 2,
}
for (const locale of ["it", "en"])
  test(`generates a valid multipage PDF (${locale})`, async () => {
    const pdf = await createHistoryReport({
      ...base,
      locale,
      records: Array(200).fill(row),
    })
    assert.equal(pdf.subarray(0, 5).toString(), "%PDF-")
    assert.match(pdf.toString("latin1"), /%%EOF/)
    assert.ok(
      (pdf.toString("latin1").match(/\/Type \/Page\b/g) || []).length > 1
    )
    const source = pdf.toString("latin1")
    const content = [...source.matchAll(/stream\r?\n([\s\S]*?)\nendstream/g)]
      .flatMap((match) => {
        try {
          return [
            ...inflateSync(Buffer.from(match[1], "latin1"))
              .toString("latin1")
              .matchAll(/<([a-f0-9]+)>/gi),
          ].map((part) => Buffer.from(part[1], "hex").toString("latin1"))
        } catch {
          return []
        }
      })
      .join("")
    assert.ok(
      content.includes(
        locale === "it" ? "Cronologia delle operazioni" : "Operations History"
      )
    )
    assert.ok(content.includes("123"))
    assert.ok(content.includes("+01:00"))
    writeFileSync(`/tmp/parkbot-history-${locale}.pdf`, pdf)
  })
test("handles empty reports and exceptionally long descriptions", async () => {
  for (const records of [
    [],
    [{ ...row, device: { id: 0, key: "" }, user: "x".repeat(20000) }],
  ]) {
    const pdf = await createHistoryReport({ ...base, locale: "it", records })
    assert.match(pdf.subarray(0, 8).toString(), /%PDF-/)
  }
})

test("download route validates authorization and filters before fetching", async () => {
  const originalFetch = globalThis.fetch
  let calls = 0
  globalThis.fetch = async () => {
    calls++
    throw new Error("Unexpected fetch")
  }
  const request = new Request(
    `https://example.test/aps/test/history/report.pdf?${search}&locale=it`
  )
  try {
    globalThis.pdfAuth = async (...args) => {
      assert.equal(args[1], "test")
      assert.equal(args[2], "read")
      throw new Response(null, { status: 403 })
    }
    await assert.rejects(
      loader({ request, params: { aps: "test" } }),
      (error) => error.status === 403
    )
    globalThis.pdfAuth = async () => ({
      aps: { name: "Test", timeZone: "Europe/Rome" },
    })
    assert.equal(
      (
        await loader({
          request: new Request(
            "https://example.test/aps/test/history/report.pdf"
          ),
          params: { aps: "test" },
        })
      ).status,
      400
    )
    assert.equal(calls, 0)
    globalThis.fetch = async (url, options) => {
      calls++
      assert.ok(url.includes("/test/history/export?"))
      assert.equal(options.headers.Authorization, "Bearer test-token")
      assert.equal(
        new URL(url).searchParams.get("dateFrom"),
        parsed.parameters.dateFrom
      )
      return Response.json({ query: [row] })
    }
    process.env.BACKEND_URL = "https://backend.test"
    const response = await loader({ request, params: { aps: "test" } })
    assert.equal(response.status, 200)
    assert.equal(response.headers.get("Content-Type"), "application/pdf")
    assert.equal(response.headers.get("Cache-Control"), "private, no-store")
    assert.match(response.headers.get("Content-Disposition"), /attachment/)
    assert.equal(
      Buffer.from(await response.arrayBuffer())
        .subarray(0, 5)
        .toString(),
      "%PDF-"
    )
    globalThis.fetch = async () => new Response(null, { status: 413 })
    assert.equal(
      (await loader({ request, params: { aps: "test" } })).status,
      413
    )
  } finally {
    globalThis.fetch = originalFetch
  }
})

test("limits concurrent exports and releases capacity afterward", async () => {
  const originalFetch = globalThis.fetch
  const pending = []
  globalThis.pdfAuth = async () => ({
    aps: { name: "Test", timeZone: "Europe/Rome" },
  })
  globalThis.fetch = () => new Promise((resolve) => pending.push(resolve))
  const args = {
    request: new Request(
      `https://example.test/aps/test/history/report.pdf?${search}`
    ),
    params: { aps: "test" },
  }
  try {
    const first = loader(args),
      second = loader(args)
    await new Promise((resolve) => setImmediate(resolve))
    assert.equal(pending.length, 2)
    assert.equal((await loader(args)).status, 429)
    pending.forEach((resolve) => resolve(Response.json({ query: [] })))
    assert.equal((await first).status, 200)
    assert.equal((await second).status, 200)
    globalThis.fetch = async () => Response.json({ query: [] })
    assert.equal((await loader(args)).status, 200)
  } finally {
    globalThis.fetch = originalFetch
  }
})
test("generates a complete document at the 5000-record limit", async () => {
  const records = Array.from({ length: 5000 }, (_, index) => ({
    ...row,
    card: index + 1,
  }))
  const started = performance.now()
  const pdf = await createHistoryReport({ ...base, locale: "it", records })
  assert.ok(
    (pdf.toString("latin1").match(/\/Type \/Page\b/g) || []).length > 100
  )
  assert.match(pdf.toString("latin1"), /%%EOF/)
  writeFileSync("/tmp/parkbot-history-5000.pdf", pdf)
  console.log(
    `5000-record report: ${Math.round(performance.now() - started)} ms, ${pdf.length} bytes`
  )
})

function pageTexts(pdf) {
  return [
    ...pdf.toString("latin1").matchAll(/stream\r?\n([\s\S]*?)\nendstream/g),
  ].flatMap((match) => {
    try {
      const content = inflateSync(Buffer.from(match[1], "latin1")).toString(
        "latin1"
      )
      return [
        [...content.matchAll(/<([a-f0-9]+)>/gi)]
          .map((part) => Buffer.from(part[1], "hex").toString("latin1"))
          .join(""),
      ]
    } catch {
      return []
    }
  })
}

test("keeps header, table and footer on the same physical page", async () => {
  for (const count of [0, 1, 200]) {
    const pdf = await createHistoryReport({
      ...base,
      locale: "it",
      records: Array(count).fill(row),
    })
    const pages = pageTexts(pdf)
    assert.equal(
      pages.length,
      [...pdf.toString("latin1").matchAll(/\/Type \/Page\b/g)].length
    )
    if (count <= 1)
      assert.equal(pages.length, 1, `${count} records should fit on one page`)
    pages.forEach((content, index) => {
      assert.ok(
        content.includes("Cronologia delle operazioni"),
        `page ${index + 1}: header missing`
      )
      assert.ok(
        content.includes(`Pagina ${index + 1}`),
        `page ${index + 1}: footer missing`
      )
      assert.ok(
        content.includes(count ? "EL1" : "Nessun record trovato."),
        `page ${index + 1}: records missing`
      )
    })
  }
})
