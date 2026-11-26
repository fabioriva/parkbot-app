import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { registerHooks } from "node:module"
import test from "node:test"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"
import { setLocale } from "../src/paraglide/runtime.js"
import { ALL_COMPANIES, filterAps } from "../app/lib/aps-filter.ts"

const root = new URL("../app/", import.meta.url)
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith("~/")) {
      const path = specifier.slice(2)
      return next(
        new URL(
          path + (existsSync(new URL(path + ".tsx", root)) ? ".tsx" : ".ts"),
          root
        ).href,
        context
      )
    }
    if (specifier.startsWith("@paraglide/"))
      return next(
        new URL("../src/paraglide/" + specifier.slice(11), import.meta.url)
          .href,
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
const { CompanySelect } = await import("../app/components/company-select.tsx")
hooks.deregister()
const plants = Object.freeze([
  Object.freeze({
    name: "Menlo Park",
    ns: "menloa",
    city: "São Paulo",
    company: "Sotefin",
    parkingSpaces: 150,
  }),
  Object.freeze({
    name: "North Lot",
    ns: "daman-n",
    city: "Dubai",
    company: "Prime",
    parkingSpaces: 200,
  }),
  Object.freeze({
    name: "Workshop",
    ns: "lab",
    city: "Rome",
    company: "Sotefin",
    parkingSpaces: 10,
  }),
])
test("all companies and Sotefin are distinct filters", () => {
  assert.deepEqual(filterAps(plants, ALL_COMPANIES, ""), plants)
  assert.deepEqual(filterAps(plants, "Sotefin", ""), [plants[0], plants[2]])
  assert.deepEqual(filterAps(plants, "Prime", ""), [plants[1]])
  assert.deepEqual(filterAps(plants, "Unknown", ""), [])
})
test("search matches names, namespaces and cities ignoring accents, case and surrounding spaces", () => {
  for (const query of ["MENLO", " menloa ", "sao paulo", "SÃO PAULO"])
    assert.deepEqual(filterAps(plants, ALL_COMPANIES, query), [plants[0]])
  assert.deepEqual(filterAps(plants, ALL_COMPANIES, "daman-n"), [plants[1]])
  assert.deepEqual(filterAps(plants, ALL_COMPANIES, "Prime"), [])
})
test("search and company combine and feed the matching totals", () => {
  assert.deepEqual(filterAps(plants, "Sotefin", "Dubai"), [])
  assert.deepEqual(filterAps(plants, "Prime", "Dubai"), [plants[1]])
  const selected = filterAps(plants, "Sotefin", "   ")
  assert.equal(selected.length, 2)
  assert.equal(
    selected.reduce((sum, item) => sum + item.parkingSpaces, 0),
    160
  )
  assert.deepEqual(filterAps([], ALL_COMPANIES, ""), [])
})
test("filtering and sorting the result do not mutate the source list", () => {
  const result = filterAps(plants, ALL_COMPANIES, "")
  assert.notEqual(result, plants)
  result.sort((a, b) => a.ns.localeCompare(b.ns))
  assert.equal(plants[0].ns, "menloa")
})
for (const locale of ["en", "it"])
  test(`company selector labels all companies and keeps unique options (${locale})`, () => {
    setLocale(locale, { reload: false })
    const element = CompanySelect({
      allCompanies: true,
      companies: ["Prime", "Sotefin", "Sotefin"],
      company: ALL_COMPANIES,
      setCompany() {},
      id: "company-filter",
    })
    assert.deepEqual(
      element.props.items.map((item) => item.value),
      [ALL_COMPANIES, "Prime", "Sotefin"]
    )
    const html = renderToStaticMarkup(element)
    assert.ok(
      html.includes(locale === "it" ? "Tutte le aziende" : "All companies")
    )
    assert.match(html, /id="company-filter"/)
  })
test("existing selector users retain Sotefin as the initial special choice", () => {
  const element = CompanySelect({
    companies: ["Prime", "Sotefin", "Sotefin"],
    company: "Sotefin",
    setCompany() {},
  })
  assert.equal(element.props.value, "Sotefin")
  assert.deepEqual(
    element.props.items.map((item) => item.value),
    ["Sotefin", "Prime"]
  )
  assert.equal(
    element.props.items.some((item) => item.value === ALL_COMPANIES),
    false
  )
})
