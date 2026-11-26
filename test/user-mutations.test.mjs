import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { registerHooks } from "node:module"
import test, { beforeEach } from "node:test"
import { Children, createElement, isValidElement } from "react"
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
  calls: [],
  denied: false,
  result: { acknowledged: true, deletedCount: 1 },
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
globalThis.userMutationTest = state
const mock = (source) => ({
  url: `data:text/javascript,${encodeURIComponent(source)}`,
  shortCircuit: true,
})
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (
      specifier === "react" &&
      context.parentURL?.endsWith("/user-delete-dialog.tsx")
    )
      return mock(
        "export const useRef=initial=>{const s=globalThis.userMutationTest;return s.refs[s.refIndex++]??={current:initial}};export const useEffect=effect=>globalThis.userMutationTest.effects.push(effect);"
      )
    if (
      specifier === "react" &&
      context.parentURL?.endsWith("/routes/admin/user.tsx")
    )
      return mock(
        "export const useId=()=> 'user-filter';export const useState=initial=>{const s=globalThis.userMutationTest;const index=s.stateIndex++;if(index===s.states.length)s.states.push(initial);return[s.states[index],value=>{s.states[index]=typeof value==='function'?value(s.states[index]):value}];};"
      )
    if (specifier === "react-router")
      return mock(
        "export const useFetcher=()=>globalThis.userMutationTest.fetcher;"
      )
    if (specifier === "~/lib/authorization.server")
      return mock(
        "export const requireAdmin=async(...args)=>{const s=globalThis.userMutationTest;s.calls.push(['auth',...args]);if(s.denied)throw new Response(null,{status:403});};"
      )
    if (specifier === "~/lib/user.server")
      return mock(
        "export const findUsers=async()=>[];export const deleteUserByEmail=async(email)=>{const s=globalThis.userMutationTest;s.calls.push(['delete',email]);if(s.result instanceof Error)throw s.result;return s.result;};"
      )
    if (specifier === "~/components/ui/alert-dialog")
      return mock(
        `import {createElement} from ${JSON.stringify(import.meta.resolve("react"))};const Root=({open,children})=>open?createElement('div',null,children):null;const Div=props=>createElement('div',props);const Button=({variant,...props})=>createElement('button',props);export const AlertDialog=Root,AlertDialogContent=Div,AlertDialogHeader=Div,AlertDialogFooter=Div,AlertDialogTitle=Div,AlertDialogDescription=Div,AlertDialogCancel=Button,AlertDialogAction=Button;`
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
const { default: UserPage, action } =
  await import("../app/routes/admin/user.tsx")
const { UserDeleteDialog } =
  await import("../app/components/user-delete-dialog.tsx")
const { UserTable } = await import("../app/components/user-table.tsx")
hooks.deregister()

const user = Object.freeze({
  id: "one",
  name: "Anna <Rossi>",
  email: "anna@example.test",
  role: "service",
  aps: "menloa",
  emailVerified: true,
  createdAt: new Date("2026-11-20T10:30:00Z"),
  updatedAt: new Date("2026-11-25T11:45:00Z"),
})
const users = Object.freeze([user])
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
const form = (tree) => find(tree, (element) => element.type === Form)
function page(items = users) {
  state.stateIndex = 0
  return UserPage({ loaderData: { users: items } })
}
function dialog(setOpen = () => {}) {
  state.refIndex = 0
  state.effects = []
  return UserDeleteDialog({ user, fetcher: state.fetcher, open: true, setOpen })
}
const effects = () => state.effects.forEach((effect) => effect())
async function remove(fields = { action: "delete", email: user.email }) {
  const body = new FormData()
  for (const [name, value] of Object.entries(fields)) body.append(name, value)
  return action({
    request: new Request("http://localhost/aps/menloa/admin/user", {
      method: "POST",
      body,
    }),
    params: { aps: "menloa" },
  })
}
beforeEach(() => {
  Object.assign(state, {
    refs: [],
    refIndex: 0,
    effects: [],
    states: [],
    stateIndex: 0,
    calls: [],
    denied: false,
    result: { acknowledged: true, deletedCount: 1 },
  })
  Object.assign(state.fetcher, { state: "idle", data: undefined })
  setLocale("en", { reload: false })
})

test("deletion checks authorization first and reports success only for one deleted user", async () => {
  const result = await remove()
  assert.ok(result.success)
  assert.equal(result.action, "Delete user")
  assert.deepEqual(
    state.calls.map(([name]) => name),
    ["auth", "delete"]
  )
  assert.equal(state.calls[0][2], "menloa")
  assert.equal(state.calls[1][1], user.email)
  state.calls = []
  state.denied = true
  await assert.rejects(remove(), (error) => error.status === 403)
  assert.deepEqual(
    state.calls.map(([name]) => name),
    ["auth"]
  )
})

test("missing records, unacknowledged deletes and database errors never report success", async () => {
  for (const result of [
    { acknowledged: true, deletedCount: 0 },
    { acknowledged: false, deletedCount: 1 },
    new Error("private database details"),
  ]) {
    state.result = result
    const response = await remove()
    assert.ok(response.error)
    assert.equal(response.success, undefined)
    assert.ok(!response.error.includes("private database details"))
  }
})

test("unsupported actions and invalid email values cannot trigger deletion", async () => {
  for (const fields of [
    { action: "update", email: user.email },
    { email: user.email },
    { action: "delete" },
    { action: "delete", email: "   " },
    { action: "delete", email: new Blob(["email"]) },
  ]) {
    state.calls = []
    assert.ok((await remove(fields)).error)
    assert.deepEqual(
      state.calls.map(([name]) => name),
      ["auth"]
    )
  }
})

for (const locale of ["it", "en"])
  test(`confirmation identifies the user, retains the exact payload and localizes feedback (${locale})`, async () => {
    setLocale(locale, { reload: false })
    let tree = dialog()
    const html = renderToStaticMarkup(tree)
    assert.ok(html.includes("Anna &lt;Rossi&gt;"))
    assert.ok(html.includes(user.email))
    assert.equal(
      find(tree, (element) => element.props.name === "action").props.value,
      "delete"
    )
    assert.equal(
      find(tree, (element) => element.props.name === "email").props.value,
      user.email
    )
    const response = await remove()
    assert.equal(
      response.action,
      locale === "it" ? "Elimina utente" : "Delete user"
    )
    state.fetcher.state = "submitting"
    tree = dialog()
    assert.ok(
      renderToStaticMarkup(tree).includes(
        locale === "it" ? "Eliminazione utente…" : "Deleting user…"
      )
    )
    for (const button of findAll(
      tree,
      (element) =>
        element.props.type === "button" || element.props.type === "submit"
    ))
      assert.equal(button.props.disabled, true)
  })

test("dialog blocks duplicate submissions, retains errors for retry and waits for revalidation", () => {
  const closed = []
  let focused = 0
  state.fetcher.data = { success: "old success" }
  let tree = dialog((value) => closed.push(value))
  effects()
  assert.deepEqual(closed, [])
  form(tree).props.onSubmit({
    preventDefault() {
      assert.fail("first submit blocked")
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
  for (const phase of ["submitting", "loading"]) {
    state.fetcher.state = phase
    tree = dialog((value) => closed.push(value))
    effects()
    assert.equal(form(tree).props["aria-busy"], true)
    assert.deepEqual(closed, [])
  }
  Object.assign(state.fetcher, {
    state: "idle",
    data: { error: "Delete failed" },
  })
  state.refs[1].current = {
    focus() {
      focused++
    },
  }
  tree = dialog((value) => closed.push(value))
  effects()
  assert.equal(focused, 1)
  assert.ok(renderToStaticMarkup(tree).includes("Delete failed"))
  assert.deepEqual(closed, [])
  form(tree).props.onSubmit({
    preventDefault() {
      assert.fail("retry blocked")
    },
  })
  Object.assign(state.fetcher, {
    state: "loading",
    data: { success: "Deleted" },
  })
  dialog((value) => closed.push(value))
  effects()
  assert.deepEqual(closed, [])
  state.fetcher.state = "idle"
  dialog((value) => closed.push(value))
  effects()
  assert.deepEqual(closed, [false])
})

test("table actions open a confirmation; cancel causes no server mutation", () => {
  state.fetcher.data = { error: "old error" }
  let tree = page()
  const table = find(tree, (element) => element.type === UserTable)
  const content = UserTable(table.props)
  const actions = findAll(
    content,
    (element) =>
      element.props.variant === "destructive" &&
      typeof element.props.onClick === "function"
  )
  assert.equal(actions.length, 2)
  actions[0].props.onClick()
  assert.equal(state.fetcher.data, undefined)
  assert.deepEqual(state.calls, [["reset"]])
  tree = page()
  const confirmation = find(
    tree,
    (element) => element.type === UserDeleteDialog
  )
  assert.equal(confirmation.props.user.email, user.email)
  confirmation.props.setOpen(false)
  assert.equal(
    find(page(), (element) => element.type === UserDeleteDialog),
    undefined
  )
  assert.deepEqual(state.calls, [["reset"]])
})

test("pending requests block row actions and hide stale feedback while preserving filters", () => {
  state.states = ["Anna", "service", "yes", "no", user]
  Object.assign(state.fetcher, {
    state: "submitting",
    data: { success: "stale success", error: "stale error" },
  })
  const tree = page()
  assert.ok(find(tree, (element) => element.type === UserDeleteDialog))
  const table = find(tree, (element) => element.type === UserTable)
  assert.equal(table.props.busy, true)
  assert.deepEqual(table.props.users, users)
  const html = renderToStaticMarkup(tree)
  assert.ok(!html.includes("stale success"))
  assert.ok(!html.includes("stale error"))
  const content = UserTable(table.props)
  for (const item of findAll(
    content,
    (element) => typeof element.props.onClick === "function"
  )) {
    assert.equal(item.props.disabled, true)
    item.props.onClick()
  }
  for (const trigger of findAll(content, (element) =>
    element.props.render?.props["aria-label"]?.startsWith("Actions for")
  ))
    assert.equal(trigger.props.render.props.disabled, true)
  table.props.onDelete(user)
  assert.deepEqual(state.calls, [])
  assert.deepEqual(state.states, ["Anna", "service", "yes", "no", user])
  state.fetcher.state = "idle"
  const empty = page([])
  const roleFilter = find(empty, (element) => element.props.label === "Role")
  assert.ok(
    roleFilter.props.options.some((option) => option.value === "service")
  )
})
