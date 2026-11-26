import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { registerHooks } from "node:module"
import test, { beforeEach } from "node:test"
import { Children, isValidElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"
import { setLocale } from "../src/paraglide/runtime.js"

const root = new URL("../app/", import.meta.url)
const state = { values: [], index: 0, id: 0, navigation: { state: "idle" } }
globalThis.apsSelectSearchTest = state
const mock = (source) => ({
  url: `data:text/javascript,${encodeURIComponent(source)}`,
  shortCircuit: true,
})
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier.endsWith(".css")) return mock("")
    if (
      specifier === "react" &&
      context.parentURL?.endsWith("/auth/aps-select.tsx")
    )
      return mock(
        "export const useId=()=> 'aps-select-search-'+globalThis.apsSelectSearchTest.id++;export const useState=initial=>{const s=globalThis.apsSelectSearchTest;const i=s.index++;if(i===s.values.length)s.values.push(typeof initial==='function'?initial():initial);return[s.values[i],value=>{s.values[i]=typeof value==='function'?value(s.values[i]):value}];};"
      )
    if (specifier === "react-router")
      return mock(
        `import {createElement} from ${JSON.stringify(import.meta.resolve("react"))};export const Form=props=>createElement('form',props);export const useNavigation=()=>globalThis.apsSelectSearchTest.navigation;export const data=()=>{};export const redirect=()=>{};`
      )
    if (specifier === "~/lib/auth.server")
      return mock("export const auth={api:{}};")
    if (specifier === "~/lib/aps.server")
      return mock(
        "export const findSubscribedApsList=()=>{throw new Error('Unexpected server query');};"
      )
    if (specifier === "~/lib/authorization.server")
      return mock(
        "export const requireSession=()=>{throw new Error('Unexpected server query');};"
      )
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
const { default: ApsSelect } = await import("../app/routes/auth/aps-select.tsx")
const { Input } = await import("../app/components/ui/input.tsx")
const { RadioGroup, RadioGroupItem } =
  await import("../app/components/ui/radio-group.tsx")
const { Form } = await import("react-router")
hooks.deregister()

const plants = Object.freeze([
  Object.freeze({
    ns: "menloa",
    name: "Menlo Park",
    city: "São Paulo",
    company: "Sotefin",
    country: "Brazil",
    flag: "🇧🇷",
    parkingSpaces: 150,
  }),
  Object.freeze({
    ns: "daman-n",
    name: "North Lot",
    city: "Dubai",
    company: "Prime",
    country: "UAE",
    flag: "🇦🇪",
    parkingSpaces: 200,
  }),
  Object.freeze({
    ns: "lab",
    name: "Workshop",
    city: "Rome",
    company: "Sotefin",
    country: "Italy",
    flag: "🇮🇹",
    parkingSpaces: 10,
  }),
])
function findAll(element, predicate) {
  if (!isValidElement(element)) return []
  return [
    ...(predicate(element) ? [element] : []),
    ...Children.toArray(element.props.children).flatMap((child) =>
      findAll(child, predicate)
    ),
  ]
}
const find = (tree, predicate) => findAll(tree, predicate)[0]
function page(items = plants) {
  state.index = 0
  state.id = 0
  return ApsSelect({ loaderData: items })
}
const search = (tree) => find(tree, (element) => element.type === Input)
const radio = (tree) => find(tree, (element) => element.type === RadioGroup)
const confirm = (tree) =>
  find(tree, (element) => element.props.type === "submit")
const options = (tree) =>
  findAll(tree, (element) => element.type === RadioGroupItem).map(
    (element) => element.props.value
  )
const changeSearch = (value) =>
  search(page()).props.onChange({ target: { value } })
beforeEach(() => {
  Object.assign(state, {
    values: [],
    index: 0,
    id: 0,
    navigation: { state: "idle" },
  })
  setLocale("en", { reload: false })
})

test("initial selection and all assigned systems are preserved; search is outside the submit form", () => {
  const tree = page()
  assert.deepEqual(
    options(tree),
    plants.map((plant) => plant.ns)
  )
  assert.equal(radio(tree).props.value, "menloa")
  assert.equal(radio(tree).props.name, "aps")
  assert.equal(confirm(tree).props.disabled, false)
  const form = find(tree, (element) => element.type === Form)
  assert.equal(
    find(form, (element) => element.type === Input),
    undefined
  )
  assert.equal(search(tree).props.type, "search")
})

test("search filters assigned names, namespaces and cities ignoring accents and case", () => {
  for (const query of ["MENLO", " menloa ", "sao paulo", "SÃO PAULO"]) {
    changeSearch(query)
    assert.deepEqual(options(page()), ["menloa"])
    assert.equal(radio(page()).props.value, "menloa")
  }
  changeSearch("daman-n")
  assert.deepEqual(options(page()), ["daman-n"])
  assert.equal(plants.length, 3)
})

test("hidden selections are cleared; filtered results require an explicit choice", () => {
  changeSearch("Dubai")
  let tree = page()
  assert.equal(radio(tree).props.value, "")
  assert.equal(confirm(tree).props.disabled, true)
  let prevented = false
  find(tree, (element) => element.type === Form).props.onSubmit({
    preventDefault() {
      prevented = true
    },
  })
  assert.equal(prevented, true)
  radio(tree).props.onValueChange("menloa")
  assert.equal(radio(page()).props.value, "")
  radio(tree).props.onValueChange("daman-n")
  tree = page()
  assert.equal(radio(tree).props.value, "daman-n")
  assert.equal(confirm(tree).props.disabled, false)
  changeSearch("")
  assert.equal(radio(page()).props.value, "daman-n")
  changeSearch("no match")
  changeSearch("")
  assert.equal(radio(page()).props.value, "")
  assert.equal(confirm(page()).props.disabled, true)
})

for (const locale of ["it", "en"])
  test(`empty results have a localized count and reset, distinct from no assignments (${locale})`, () => {
    setLocale(locale, { reload: false })
    changeSearch("no match")
    const tree = page()
    const html = renderToStaticMarkup(tree)
    assert.ok(
      html.includes(locale === "it" ? "0 di 3 impianti" : "0 of 3 systems")
    )
    assert.ok(
      html.includes(
        locale === "it" ? "Nessun impianto trovato" : "No systems found"
      )
    )
    assert.ok(
      !html.includes(
        locale === "it" ? "Nessun impianto assegnato" : "No systems assigned"
      )
    )
    assert.equal(radio(tree), undefined)
    assert.equal(confirm(tree).props.disabled, true)
    const reset = find(
      tree,
      (element) => typeof element.props.onClick === "function"
    )
    assert.equal(reset.props.type, "button")
    reset.props.onClick()
    assert.equal(search(page()).props.value, "")
    assert.deepEqual(
      options(page()),
      plants.map((plant) => plant.ns)
    )
  })

test("single-system and no-assignment flows retain their existing behavior", () => {
  let tree = page([plants[0]])
  assert.equal(search(tree), undefined)
  assert.equal(radio(tree).props.value, "menloa")
  assert.equal(confirm(tree).props.disabled, false)
  tree = page([])
  assert.equal(search(tree), undefined)
  assert.equal(radio(tree), undefined)
  assert.equal(confirm(tree).props.name, "intent")
  assert.equal(confirm(tree).props.value, "signout")
  assert.equal(confirm(tree).props.disabled, false)
})

test("pending navigation disables search, reset, selection and submit without changing values", () => {
  changeSearch("Menlo")
  Object.assign(state.navigation, {
    state: "submitting",
    formAction: "/aps-select",
  })
  const tree = page()
  assert.equal(search(tree).props.disabled, true)
  assert.equal(radio(tree).props.disabled, true)
  assert.equal(confirm(tree).props.disabled, true)
  const reset = find(
    tree,
    (element) => typeof element.props.onClick === "function"
  )
  assert.equal(reset.props.disabled, true)
  reset.props.onClick()
  search(tree).props.onChange({ target: { value: "Dubai" } })
  radio(tree).props.onValueChange("daman-n")
  assert.deepEqual(state.values, ["Menlo", "menloa"])
  let prevented = false
  find(tree, (element) => element.type === Form).props.onSubmit({
    preventDefault() {
      prevented = true
    },
  })
  assert.equal(prevented, true)
})
