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
  draft: [],
  draftIndex: 0,
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
globalThis.subscriptionMutationTest = state
const mock = (source) => ({
  url: `data:text/javascript,${encodeURIComponent(source)}`,
  shortCircuit: true,
})
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (
      specifier === "./aps-filter" &&
      context.parentURL?.endsWith("/subscription-filter.ts")
    )
      return next("./aps-filter.ts", context)
    if (
      specifier === "react" &&
      /\/(?:subscription-form|subscription-delete-dialog)\.tsx$/.test(
        context.parentURL || ""
      )
    )
      return mock(
        `export const useId=()=> 'subscription-mutation-form';export const useRef=initial=>{const s=globalThis.subscriptionMutationTest;return s.refs[s.refIndex++]??={current:initial}};export const useEffect=effect=>globalThis.subscriptionMutationTest.effects.push(effect);export const useState=initial=>{const s=globalThis.subscriptionMutationTest;const index=s.draftIndex++;if(index===s.draft.length)s.draft.push(typeof initial==='function'?initial():initial);return[s.draft[index],value=>{s.draft[index]=typeof value==='function'?value(s.draft[index]):value}];};`
      )
    if (
      specifier === "react" &&
      context.parentURL?.endsWith("/routes/admin/subscription.tsx")
    )
      return mock(
        `export const useId=()=> 'subscription-filter-'+globalThis.subscriptionMutationTest.ids++;export const useState=initial=>{const s=globalThis.subscriptionMutationTest;const index=s.stateIndex++;if(index===s.states.length)s.states.push(initial);return[s.states[index],value=>{s.states[index]=typeof value==='function'?value(s.states[index]):value}];};`
      )
    if (specifier === "react-router")
      return mock(
        "export const useFetcher=()=>globalThis.subscriptionMutationTest.fetcher;"
      )
    if (specifier === "~/lib/authorization.server")
      return mock(
        `export const requireAdmin=async(...args)=>{const s=globalThis.subscriptionMutationTest;s.calls.push(['auth',...args]);if(s.denied)throw new Response(null,{status:403});};`
      )
    if (specifier === "~/lib/aps.server")
      return mock(
        "export const findAllAps=async()=>[];export const findCompaniesFromAps=async()=>[];"
      )
    if (specifier === "~/lib/subscription.server")
      return mock(
        `const call=(name,...args)=>{const s=globalThis.subscriptionMutationTest;s.calls.push([name,...args]);if(s.result instanceof Error)throw s.result;return s.result;};export const createSubscription=async(...args)=>call('create',...args);export const updateSubscriptionByEmail=async(...args)=>call('update',...args);export const deleteSubscriptionByEmail=async(...args)=>call('delete',...args);export const findSubscriptions=async()=>[];`
      )
    if (
      specifier === "~/components/ui/dialog" ||
      specifier === "~/components/ui/alert-dialog"
    )
      return mock(
        `import {createElement} from ${JSON.stringify(import.meta.resolve("react"))};const Root=({open,children})=>open?createElement('div',null,children):null;const Div=({showCloseButton,...props})=>createElement('div',props);const Button=({variant,...props})=>createElement('button',props);export const Dialog=Root,DialogContent=Div,DialogHeader=Div,DialogFooter=Div,DialogTitle=Div,DialogDescription=Div;export const AlertDialog=Root,AlertDialogContent=Div,AlertDialogHeader=Div,AlertDialogFooter=Div,AlertDialogTitle=Div,AlertDialogDescription=Div,AlertDialogCancel=Button,AlertDialogAction=Button;`
      )
    if (specifier.startsWith("~/")) {
      const p = specifier.slice(2)
      return next(
        new URL(
          p + (existsSync(new URL(p + ".tsx", root)) ? ".tsx" : ".ts"),
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
const { default: SubscriptionPage, action } =
  await import("../app/routes/admin/subscription.tsx")
const { SubscriptionForm } =
  await import("../app/components/subscription-form.tsx")
const { SubscriptionDeleteDialog } =
  await import("../app/components/subscription-delete-dialog.tsx")
const { SubscriptionTable } =
  await import("../app/components/subscription-table.tsx")
hooks.deregister()
const aps = [
  { ns: "one", name: "First system", company: "Prime" },
  { ns: "two", name: "Second system", company: "Prime" },
]
const subscription = {
  email: "operator@example.test",
  company: "Prime",
  role: "valet",
  aps: ["one", "legacy"],
  subscribed: true,
}
function findAll(element, predicate) {
  if (!isValidElement(element)) return []
  return [
    ...(predicate(element) ? [element] : []),
    ...Children.toArray(element.props.children).flatMap((child) =>
      findAll(child, predicate)
    ),
  ]
}
const find = (element, predicate) => findAll(element, predicate)[0]
function page() {
  state.stateIndex = 0
  state.ids = 0
  return SubscriptionPage({
    loaderData: { aps, companies: ["Prime"], subscriptions: [subscription] },
  })
}
function dialog(Component, setOpen) {
  state.refIndex = 0
  state.draftIndex = 0
  state.effects = []
  const props = {
    action: "update",
    aps,
    selectedSubscription: subscription,
    subscription,
    fetcher: state.fetcher,
    open: true,
    setOpen,
  }
  const result = Component(props)
  return Component === SubscriptionForm ? result.type(result.props) : result
}
const form = (tree) => find(tree, (element) => element.type === Form)
const effects = () => state.effects.forEach((effect) => effect())
for (const Component of [SubscriptionForm, SubscriptionDeleteDialog])
  test(`${Component.name} stays open on failure, blocks duplicates and closes after revalidation`, () => {
    state.refs = []
    state.draft = []
    const closed = []
    let focused = 0
    Object.assign(state.fetcher, {
      state: "idle",
      data: { success: "old success" },
    })
    let tree = dialog(Component, (value) => closed.push(value))
    effects()
    assert.deepEqual(closed, [])
    form(tree).props.onSubmit({
      preventDefault() {
        assert.fail("initial submit blocked")
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
        focused++
      },
    }
    tree = dialog(Component, (value) => closed.push(value))
    effects()
    assert.equal(focused, 1)
    assert.deepEqual(closed, [])
    assert.ok(renderToStaticMarkup(tree).includes("Save failed"))
    if (Component === SubscriptionForm) {
      const ids = findAll(
        tree,
        (element) => element.type === "input" && element.props.name === "aps"
      ).map((element) => element.props.value)
      assert.deepEqual(ids, ["one", "legacy"])
    }
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
for (const locale of ["it", "en"])
  test(`delete confirmation identifies the email and retains the delete payload (${locale})`, () => {
    setLocale(locale, { reload: false })
    state.refs = []
    Object.assign(state.fetcher, { state: "idle", data: undefined })
    const tree = dialog(SubscriptionDeleteDialog, () => {})
    const html = renderToStaticMarkup(tree)
    assert.ok(
      html.includes(
        locale === "it" ? "Conferma l’eliminazione" : "Confirm deletion"
      )
    )
    assert.ok(html.includes("operator@example.test"))
    assert.match(html, /name="action" value="delete"/)
    assert.match(html, /name="email" value="operator@example.test"/)
    state.fetcher.state = "loading"
    const pending = renderToStaticMarkup(
      dialog(SubscriptionDeleteDialog, () => {})
    )
    assert.match(pending, /disabled=""/)
    assert.ok(pending.includes(locale === "it" ? "Eliminazione…" : "Deleting…"))
  })
test("table delete opens a confirmation and cancel performs no write", () => {
  state.states = []
  state.calls = []
  Object.assign(state.fetcher, { state: "idle", data: { success: "old" } })
  find(page(), (element) => element.type === SubscriptionTable).props.onDelete(
    subscription
  )
  assert.deepEqual(state.calls, [["reset"]])
  const confirmation = find(
    page(),
    (element) => element.type === SubscriptionDeleteDialog
  )
  assert.equal(confirmation.props.subscription.email, "operator@example.test")
  confirmation.props.setOpen(false)
  assert.equal(
    find(page(), (element) => element.type === SubscriptionDeleteDialog),
    undefined
  )
  assert.deepEqual(state.calls, [["reset"]])
})
test("pending requests disable actions, retain the form and hide old feedback", () => {
  state.states = []
  state.calls = []
  Object.assign(state.fetcher, { state: "idle", data: undefined })
  find(page(), (element) => element.type === SubscriptionTable).props.onUpdate(
    subscription
  )
  for (const status of ["submitting", "loading"]) {
    Object.assign(state.fetcher, {
      state: status,
      data: { success: "OLD_SUCCESS", error: "OLD_ERROR" },
    })
    const tree = page()
    const table = find(tree, (element) => element.type === SubscriptionTable)
    assert.equal(table.props.busy, true)
    table.props.onDelete(subscription)
    assert.ok(find(page(), (element) => element.type === SubscriptionForm))
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
test("pending form disables role and checkboxes without altering selected IDs", () => {
  state.refs = []
  state.draft = []
  Object.assign(state.fetcher, { state: "submitting", data: undefined })
  let tree = dialog(SubscriptionForm, () => {})
  const role = find(tree, (element) => element.props.name === "role")
  assert.equal(role.props.disabled, true)
  const box = find(
    tree,
    (element) =>
      element.props.value === "two" &&
      typeof element.props.onCheckedChange === "function"
  )
  assert.equal(box.props.disabled, true)
  box.props.onCheckedChange(true)
  tree = dialog(SubscriptionForm, () => {})
  assert.deepEqual(
    findAll(
      tree,
      (element) => element.type === "input" && element.props.name === "aps"
    ).map((element) => element.props.value),
    ["one", "legacy"]
  )
})
async function mutate(verb, changes = {}) {
  const data = new FormData()
  for (const [key, value] of Object.entries({
    ...subscription,
    action: verb,
    ...changes,
  })) {
    if (Array.isArray(value)) value.forEach((item) => data.append(key, item))
    else data.set(key, String(value))
  }
  return action({
    params: { aps: "admin-plant" },
    request: new Request(
      "https://example.test/aps/admin-plant/admin/subscription",
      { method: "POST", body: data }
    ),
  })
}
test("CRUD checks authorization and preserves assignments, role and registration semantics", async () => {
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
    assert.equal(state.calls[1][0], verb)
    const call = state.calls[1]
    if (verb === "delete") assert.equal(call[1], subscription.email)
    else {
      const payload = verb === "create" ? call[1] : call[2]
      assert.equal(payload.email, subscription.email)
      assert.equal(payload.role, "valet")
      assert.deepEqual(payload.aps, ["one", "legacy"])
      if (verb === "create") assert.equal(payload.subscribed, false)
      else {
        assert.equal(call[1], subscription.email)
        assert.equal("subscribed" in payload, false)
      }
    }
  }
  state.calls = []
  assert.ok((await mutate("update", { aps: [] })).success)
  assert.deepEqual(state.calls[1][2].aps, [])
})
test("missing records, database failures and invalid input are not reported as success", async () => {
  for (const [verb, result] of [
    ["create", { acknowledged: false }],
    ["update", { acknowledged: true, matchedCount: 0 }],
    ["delete", { acknowledged: true, deletedCount: 0 }],
  ]) {
    state.result = result
    assert.ok((await mutate(verb)).error)
  }
  state.result = new Error("PRIVATE_DATABASE_DETAIL")
  assert.ok(!(await mutate("create")).error.includes("PRIVATE_DATABASE_DETAIL"))
  state.calls = []
  assert.ok((await mutate("delete", { email: "" })).error)
  assert.equal(state.calls.length, 1)
  state.calls = []
  state.denied = true
  await assert.rejects(mutate("delete"), (error) => error.status === 403)
  assert.equal(state.calls.length, 1)
  state.denied = false
})
