import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { registerHooks } from "node:module"
import test from "node:test"
import { createElement, Children, isValidElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"
import { setLocale } from "../src/paraglide/runtime.js"

const root = new URL("../app/", import.meta.url)
const state = {
  enabled: true,
  denied: false,
  calls: [],
  result: { result: { acknowledged: true, matchedCount: 1 } },
  fetcher: {
    state: "idle",
    Form: (props) => createElement("form", props),
    data: undefined,
    reset() {},
    submit() {},
  },
  refs: [],
  index: 0,
  effects: [],
}
globalThis.notificationsUiTest = state
const mock = (source) => ({
  url: `data:text/javascript,${encodeURIComponent(source)}`,
  shortCircuit: true,
})
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (
      specifier === "react" &&
      context.parentURL?.endsWith("/notifications-form.tsx")
    )
      return mock(
        `export const useId = () => 'notification-test'; export const useRef = initial => { const s = globalThis.notificationsUiTest; return s.refs[s.index++] ??= {current:initial} }; export const useEffect = effect => globalThis.notificationsUiTest.effects.push(effect);`
      )
    if (specifier === "react-router")
      return mock(
        `export const useFetcher = () => globalThis.notificationsUiTest.fetcher; export const useOutletContext = () => ({aps:{notifications:globalThis.notificationsUiTest.enabled}});`
      )
    if (specifier === "~/lib/authorization.server")
      return mock(
        `export const requireAps = async (...args) => { const s=globalThis.notificationsUiTest;s.calls.push(['auth',...args]); if(s.denied) throw new Response(null,{status:403}); };`
      )
    if (specifier === "~/lib/cookie.server")
      return mock(`export const getToken = () => 'test-token';`)
    if (specifier === "~/lib/fetch")
      return mock(
        `export default async (...args) => { const s=globalThis.notificationsUiTest; s.calls.push(['fetch',...args]); if(s.result instanceof Error || s.result instanceof Response) throw s.result; return s.result; };`
      )
    if (specifier === "~/components/ui/dialog")
      return mock(
        `import {createElement} from ${JSON.stringify(import.meta.resolve("react"))}; export const Dialog=({children,open})=>open?createElement('div',null,children):null; export const DialogContent=({children})=>createElement('div',null,children); export const DialogTitle=({children})=>createElement('h2',null,children); export const DialogDescription=({children})=>createElement('p',null,children); export const DialogFooter=DialogContent; export const DialogHeader=DialogContent;`
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
const { default: Notifications, action } =
  await import("../app/routes/aps/notifications.tsx")
const { NotificationsTable } =
  await import("../app/components/notifications-table.tsx")
const { NotificationsForm } =
  await import("../app/components/notifications-form.tsx")
hooks.deregister()
const recipient = {
  _id: "one",
  email: "operator@example.test",
  name: "Operator",
  locale: "it",
  phone: "+41123456",
}
const page = (recipients) =>
  renderToStaticMarkup(
    createElement(Notifications, { loaderData: { recipients } })
  )
function form(props = {}) {
  state.index = 0
  state.effects = []
  return NotificationsForm({
    action: "create",
    fetcher: state.fetcher,
    open: true,
    setOpen: () => {},
    ...props,
  })
}
function findForm(element) {
  if (!isValidElement(element)) return null
  if (element.type === state.fetcher.Form) return element
  return Children.toArray(element.props.children).map(findForm).find(Boolean)
}
for (const locale of ["it", "en"])
  test(`header, capacity and empty/disabled states (${locale})`, () => {
    setLocale(locale, { reload: false })
    state.enabled = true
    Object.assign(state.fetcher, { state: "idle", data: undefined })
    const html = page([])
    assert.ok(
      html.includes(locale === "it" ? "0 / 3 destinatari" : "0 / 3 recipients")
    )
    assert.ok(
      html.includes(locale === "it" ? "Aggiungi destinatario" : "Add recipient")
    )
    assert.ok(
      html.includes(locale === "it" ? "Nessun destinatario" : "No recipients")
    )
    const full = page(
      Array.from({ length: 3 }, (_, i) => ({
        ...recipient,
        _id: String(i),
        email: `operator${i}@example.test`,
      }))
    )
    assert.ok(full.includes(locale === "it" ? "Limite di 3" : "Limit of 3"))
    assert.match(full, /disabled=""/)
    state.enabled = false
    const disabled = page([])
    assert.ok(
      disabled.includes(
        locale === "it" ? "Notifiche disabilitate" : "Notifications disabled"
      )
    )
    assert.doesNotMatch(disabled, /<button/)
    state.enabled = true
  })
test("responsive list retains recipient details and accessible action labels", () => {
  setLocale("it", { reload: false })
  const html = renderToStaticMarkup(
    createElement(NotificationsTable, {
      recipients: [recipient],
      busy: false,
      onUpdate() {},
      onDelete() {},
    })
  )
  assert.match(html, /lg:hidden/)
  assert.match(html, /lg:block/)
  assert.match(html, /Azioni per operator@example.test/)
  assert.match(html, /Operator/)
  assert.match(html, /\+41123456/)
  const pending = renderToStaticMarkup(
    createElement(NotificationsTable, {
      recipients: [recipient],
      busy: true,
      onUpdate() {},
      onDelete() {},
    })
  )
  assert.match(pending, /disabled=""/)
})
test("stale feedback is hidden during the next mutation", () => {
  Object.assign(state.fetcher, {
    state: "submitting",
    data: { success: "OLD_SUCCESS" },
  })
  assert.doesNotMatch(page([recipient]), /OLD_SUCCESS/)
  Object.assign(state.fetcher, {
    state: "loading",
    data: { error: "OLD_ERROR" },
  })
  assert.doesNotMatch(page([recipient]), /OLD_ERROR/)
  Object.assign(state.fetcher, {
    state: "idle",
    data: { error: "<b>API failure</b>" },
  })
  const html = page([recipient])
  assert.match(html, /&lt;b&gt;API failure&lt;\/b&gt;/)
  assert.doesNotMatch(html, /<b>API failure<\/b>/)
})
test("dialog closes only after its own successful submission and revalidation", () => {
  state.refs = []
  const closes = []
  Object.assign(state.fetcher, {
    state: "idle",
    data: { success: "previous success" },
  })
  let tree = form({ setOpen: (value) => closes.push(value) })
  state.effects.forEach((effect) => effect())
  assert.deepEqual(closes, [])
  findForm(tree).props.onSubmit({
    preventDefault() {
      assert.fail("unexpected block")
    },
  })
  for (const step of ["submitting", "loading"]) {
    state.fetcher.state = step
    tree = form({ setOpen: (value) => closes.push(value) })
    state.effects.forEach((effect) => effect())
    assert.deepEqual(closes, [])
    assert.equal(findForm(tree).props["aria-busy"], true)
    let prevented = false
    findForm(tree).props.onSubmit({
      preventDefault() {
        prevented = true
      },
    })
    assert.equal(prevented, true)
  }
  Object.assign(state.fetcher, { state: "idle", data: { error: "Failed" } })
  form({ setOpen: (value) => closes.push(value) })
  state.effects.forEach((effect) => effect())
  assert.deepEqual(closes, [])
  Object.assign(state.fetcher, { state: "idle", data: { success: "Saved" } })
  form({ setOpen: (value) => closes.push(value) })
  state.effects.forEach((effect) => effect())
  assert.deepEqual(closes, [false])
})
test("form has associated labels, optional fields and retains values on errors", () => {
  setLocale("it", { reload: false })
  state.refs = []
  Object.assign(state.fetcher, { state: "idle", data: { error: "Retry" } })
  const html = renderToStaticMarkup(
    form({ action: "update", selectedRecipient: recipient })
  )
  assert.match(html, /for="notification-test-email"/)
  assert.match(html, /id="notification-test-email"/)
  assert.match(html, /type="tel"/)
  assert.match(html, /facoltativo/)
  assert.match(html, /value="operator@example.test"/)
  assert.match(html, /Retry/)
  assert.match(html, /Salva/)
  assert.doesNotMatch(html, /Save changes|Select a role/)
})
async function mutate(values) {
  const data = new FormData()
  Object.entries(values).forEach(([k, v]) => data.set(k, v))
  return action({
    params: { aps: "test" },
    request: new Request("https://example.test/aps/test/notifications", {
      method: "POST",
      body: data,
    }),
  })
}
test("CRUD uses the existing authenticated endpoints and preserves payloads", async () => {
  state.denied = false
  state.result = { result: { acknowledged: true, matchedCount: 1 } }
  for (const verb of ["create", "update", "delete"]) {
    state.calls = []
    const result = await mutate({ action: verb, ...recipient })
    assert.ok(result.success)
    assert.equal(state.calls[0][0], "auth")
    assert.equal(state.calls[0][3], "notifications")
    const call = state.calls.find((c) => c[0] === "fetch")
    assert.match(
      call[1],
      new RegExp(`/notifications/${verb === "create" ? "add" : verb}$`)
    )
    assert.equal(call[2].headers.Authorization, "Bearer test-token")
    const body = JSON.parse(call[2].body)
    assert.deepEqual(
      body,
      verb === "delete"
        ? { _id: "one" }
        : {
            email: recipient.email,
            name: recipient.name,
            locale: "it",
            phone: recipient.phone,
          }
    )
  }
})
test("failed saves remain errors and authorization failures are not swallowed", async () => {
  for (const failure of [
    new Error("network"),
    new Response(null, { status: 500 }),
    { result: { acknowledged: true, matchedCount: 0 } },
  ]) {
    state.result = failure
    assert.ok((await mutate({ action: "update", ...recipient })).error)
  }
  state.denied = true
  state.calls = []
  await assert.rejects(
    mutate({ action: "create", ...recipient }),
    (error) => error.status === 403
  )
  assert.equal(
    state.calls.some((c) => c[0] === "fetch"),
    false
  )
  state.denied = false
})
