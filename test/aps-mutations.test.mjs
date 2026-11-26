import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { registerHooks } from "node:module"
import test from "node:test"
import { createElement, Children, isValidElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"
import { setLocale } from "../src/paraglide/runtime.js"

const root = new URL("../app/", import.meta.url)
const Form = (props) => createElement("form", props)
const state = {
  refs: [],
  refIndex: 0,
  effects: [],
  states: [],
  stateIndex: 0,
  ids: 0,
  calls: [],
  denied: false,
  result: { acknowledged: true, matchedCount: 1, deletedCount: 1 },
  fetcher: {
    Form,
    state: "idle",
    data: undefined,
    reset() {
      this.data = undefined
      state.calls.push(["reset"])
    },
  },
}
globalThis.apsMutationTest = state
const mock = (source) => ({
  url: `data:text/javascript,${encodeURIComponent(source)}`,
  shortCircuit: true,
})
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (
      specifier === "react" &&
      /\/(?:aps-form|aps-delete-dialog)\.tsx$/.test(context.parentURL || "")
    )
      return mock(
        `export const useId=()=> 'aps-mutation-form'; export const useRef=initial=>{const s=globalThis.apsMutationTest; return s.refs[s.refIndex++]??={current:initial}};export const useEffect=effect=>globalThis.apsMutationTest.effects.push(effect);`
      )
    if (
      specifier === "react" &&
      context.parentURL?.endsWith("/routes/admin/aps.tsx")
    )
      return mock(
        `export const useId=()=> 'aps-filter-'+globalThis.apsMutationTest.ids++;export const useState=initial=>{const s=globalThis.apsMutationTest;const index=s.stateIndex++;if(index===s.states.length)s.states.push(initial);return [s.states[index],value=>{s.states[index]=typeof value==='function'?value(s.states[index]):value}];};`
      )
    if (specifier === "react-router")
      return mock(
        "export const useFetcher=()=>globalThis.apsMutationTest.fetcher;"
      )
    if (specifier === "~/lib/authorization.server")
      return mock(
        `export const requireAdmin=async (...args)=>{const s=globalThis.apsMutationTest;s.calls.push(['auth',...args]);if(s.denied)throw new Response(null,{status:403});};`
      )
    if (specifier === "~/lib/aps.server")
      return mock(
        `const call=(name,...args)=>{const s=globalThis.apsMutationTest;s.calls.push([name,...args]);if(s.result instanceof Error)throw s.result;return s.result;};export const createAps=async(...args)=>call('create',...args);export const updateApsByNs=async(...args)=>call('update',...args);export const deleteApsByNs=async(...args)=>call('delete',...args);export const findAllAps=async()=>[];export const findCompaniesFromAps=async()=>[];`
      )
    if (
      specifier === "~/components/ui/dialog" ||
      specifier === "~/components/ui/alert-dialog"
    )
      return mock(
        `import {createElement} from ${JSON.stringify(import.meta.resolve("react"))};const Root=({open,children})=>open?createElement('div',null,children):null;const Div=({showCloseButton,...props})=>createElement('div',props);const Button=({variant,...props})=>createElement('button',props);export const Dialog=Root,DialogContent=Div,DialogHeader=Div,DialogFooter=Div,DialogTitle=Div,DialogDescription=Div;export const AlertDialog=Root,AlertDialogContent=Div,AlertDialogHeader=Div,AlertDialogFooter=Div,AlertDialogTitle=Div,AlertDialogDescription=Div,AlertDialogCancel=Button,AlertDialogAction=Button;`
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
const { default: ApsPage, action } = await import("../app/routes/admin/aps.tsx")
const { ApsForm } = await import("../app/components/aps-form.tsx")
const { ApsDeleteDialog } =
  await import("../app/components/aps-delete-dialog.tsx")
const { ApsTable } = await import("../app/components/aps-table.tsx")
hooks.deregister()
const plant = {
  ns: "daman-n",
  name: "North system",
  company: "Prime",
  city: "Dubai",
  country: "UAE",
  flag: "🇦🇪",
  timeZone: "Asia/Dubai",
  parkingSpaces: 0,
  notifications: true,
}
function find(element, predicate) {
  if (!isValidElement(element)) return null
  if (predicate(element)) return element
  return Children.toArray(element.props.children)
    .map((child) => find(child, predicate))
    .find(Boolean)
}
function page() {
  state.stateIndex = 0
  state.ids = 0
  return ApsPage({ loaderData: { aps: [plant], companies: ["Prime"] } })
}
function dialog(Component, setOpen) {
  state.refIndex = 0
  state.effects = []
  return Component({
    action: "update",
    selectedAps: plant,
    aps: plant,
    fetcher: state.fetcher,
    open: true,
    setOpen,
  })
}
function form(tree) {
  return find(tree, (element) => element.type === Form)
}
const effects = () => state.effects.forEach((effect) => effect())
for (const Component of [ApsForm, ApsDeleteDialog])
  test(`${Component.name} preserves errors, prevents duplicate submission and closes only after success`, () => {
    state.refs = []
    const closed = []
    let focus = 0
    Object.assign(state.fetcher, { state: "idle", data: { success: "stale" } })
    let tree = dialog(Component, (value) => closed.push(value))
    effects()
    assert.deepEqual(closed, [])
    form(tree).props.onSubmit({
      preventDefault() {
        assert.fail("first submission blocked")
      },
    })
    let prevented = false
    form(tree).props.onSubmit({
      preventDefault() {
        prevented = true
      },
    })
    assert.equal(prevented, true)
    tree.props.onOpenChange(false)
    assert.deepEqual(closed, [])
    for (const step of ["submitting", "loading"]) {
      state.fetcher.state = step
      tree = dialog(Component, (value) => closed.push(value))
      effects()
      assert.deepEqual(closed, [])
      assert.equal(form(tree).props["aria-busy"], true)
    }
    Object.assign(state.fetcher, {
      state: "idle",
      data: { error: "Save failed" },
    })
    state.refs[1].current = {
      focus() {
        focus++
      },
    }
    tree = dialog(Component, (value) => closed.push(value))
    effects()
    assert.equal(focus, 1)
    assert.deepEqual(closed, [])
    assert.ok(renderToStaticMarkup(tree).includes("Save failed"))
    form(tree).props.onSubmit({
      preventDefault() {
        assert.fail("retry blocked")
      },
    })
    Object.assign(state.fetcher, { state: "idle", data: { success: "Saved" } })
    dialog(Component, (value) => closed.push(value))
    effects()
    assert.deepEqual(closed, [false])
  })
for (const locale of ["en", "it"])
  test(`delete confirmation identifies the system and posts its namespace (${locale})`, () => {
    setLocale(locale, { reload: false })
    state.refs = []
    Object.assign(state.fetcher, { state: "idle", data: undefined })
    const tree = dialog(ApsDeleteDialog, () => {})
    const html = renderToStaticMarkup(tree)
    assert.ok(html.includes("North system (daman-n)"))
    assert.ok(
      html.includes(
        locale === "it" ? "Conferma l’eliminazione" : "Confirm deletion"
      )
    )
    assert.match(html, /name="action" value="delete"/)
    assert.match(html, /name="ns" value="daman-n"/)
    tree.props.onOpenChange(false)
    state.fetcher.state = "submitting"
    const pending = renderToStaticMarkup(dialog(ApsDeleteDialog, () => {}))
    assert.match(pending, /disabled=""/)
    assert.ok(pending.includes(locale === "it" ? "Eliminazione…" : "Deleting…"))
  })
test("table delete opens a confirmation without submitting a mutation", () => {
  state.states = []
  state.calls = []
  Object.assign(state.fetcher, { state: "idle", data: { success: "old" } })
  const table = find(page(), (element) => element.type === ApsTable)
  table.props.onDelete(plant)
  assert.deepEqual(state.calls, [["reset"]])
  const confirmation = find(
    page(),
    (element) => element.type === ApsDeleteDialog
  )
  assert.equal(confirmation.props.aps.ns, "daman-n")
  confirmation.props.setOpen(false)
  assert.equal(
    find(page(), (element) => element.type === ApsDeleteDialog),
    undefined
  )
})
test("pending mutations disable actions, hide old feedback and keep the current dialog", () => {
  state.states = []
  state.calls = []
  Object.assign(state.fetcher, { state: "idle", data: undefined })
  find(page(), (element) => element.type === ApsTable).props.onUpdate(plant)
  for (const status of ["submitting", "loading"]) {
    Object.assign(state.fetcher, {
      state: status,
      data: { success: "OLD_SUCCESS", error: "OLD_ERROR" },
    })
    const tree = page()
    const table = find(tree, (element) => element.type === ApsTable)
    assert.equal(table.props.busy, true)
    table.props.onDelete(plant)
    assert.ok(find(page(), (element) => element.type === ApsForm))
    assert.equal(state.calls.length, 1)
    assert.equal(
      find(tree, (element) => element.props.children === "OLD_SUCCESS"),
      undefined
    )
    assert.equal(
      find(tree, (element) => element.props.children === "OLD_ERROR"),
      undefined
    )
  }
})
async function mutate(verb, changes = {}) {
  const data = new FormData()
  for (const [key, value] of Object.entries({
    ...plant,
    parkingSpaces: "0",
    notifications: "on",
    action: verb,
    ...changes,
  }))
    data.set(key, String(value))
  return action({
    params: { aps: "admin-plant" },
    request: new Request("https://example.test/aps/admin-plant/admin/aps", {
      method: "POST",
      body: data,
    }),
  })
}
test("CRUD checks authorization and validates actual database outcomes", async () => {
  state.denied = false
  state.result = {
    acknowledged: true,
    matchedCount: 1,
    modifiedCount: 0,
    deletedCount: 1,
  }
  for (const verb of ["create", "update", "delete"]) {
    state.calls = []
    assert.ok((await mutate(verb)).success)
    assert.equal(state.calls[0][0], "auth")
    const call = state.calls[1]
    assert.equal(call[0], verb)
    if (verb === "delete") assert.equal(call[1], "daman-n")
    else {
      assert.equal(call[1].parkingSpaces, 0)
      assert.equal(call[1].timeZone, "Asia/Dubai")
      assert.equal(call[1].ns, "daman-n")
      if (verb === "update") assert.equal(call[2], "daman-n")
    }
  }
  for (const [verb, result] of [
    ["create", { acknowledged: false }],
    ["update", { acknowledged: true, matchedCount: 0 }],
    ["delete", { acknowledged: true, deletedCount: 0 }],
  ]) {
    state.result = result
    assert.ok((await mutate(verb)).error)
  }
})
test("invalid input and non-admin requests do not write data; failures use localized feedback", async () => {
  setLocale("it", { reload: false })
  state.denied = false
  state.calls = []
  assert.ok((await mutate("update", { timeZone: "not/a-zone" })).error)
  assert.equal(state.calls.length, 1)
  state.calls = []
  assert.ok((await mutate("delete", { ns: "" })).error)
  assert.equal(state.calls.length, 1)
  state.result = new Error("PRIVATE_DATABASE_DETAIL")
  assert.ok(!(await mutate("create")).error.includes("PRIVATE_DATABASE_DETAIL"))
  state.calls = []
  state.denied = true
  await assert.rejects(mutate("delete"), (error) => error.status === 403)
  assert.equal(state.calls.length, 1)
  state.denied = false
})
