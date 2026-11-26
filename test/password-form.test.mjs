import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { registerHooks } from "node:module"
import test, { beforeEach } from "node:test"
import { Children, isValidElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"
import { setLocale } from "../src/paraglide/runtime.js"

const root = new URL("../app/", import.meta.url)
const state = {
  values: [],
  index: 0,
  refs: [],
  refIndex: 0,
  effects: [],
  calls: [],
  result: { data: { user: { id: "test-user" } } },
}
globalThis.passwordFormTest = state
const mock = (source) => ({
  url: `data:text/javascript,${encodeURIComponent(source)}`,
  shortCircuit: true,
})
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (
      specifier === "react" &&
      context.parentURL?.endsWith("/user/password.tsx")
    )
      return mock(
        "export const useId=()=> 'password-form';export const useEffect=effect=>globalThis.passwordFormTest.effects.push(effect);export const useRef=initial=>{const s=globalThis.passwordFormTest;return s.refs[s.refIndex++]??={current:initial};};export const useState=initial=>{const s=globalThis.passwordFormTest;const i=s.index++;if(i===s.values.length)s.values.push(typeof initial==='function'?initial():initial);return[s.values[i],value=>{s.values[i]=typeof value==='function'?value(s.values[i]):value}];};"
      )
    if (specifier === "~/lib/auth")
      return mock(
        "export const authClient={changePassword:async(payload)=>{const s=globalThis.passwordFormTest;s.calls.push(payload);if(s.result instanceof Error)throw s.result;return s.result;}};"
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
const { default: Password } = await import("../app/routes/user/password.tsx")
hooks.deregister()

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
function page() {
  state.index = 0
  state.refIndex = 0
  state.effects = []
  return Password()
}
const field = (tree, name) =>
  find(tree, (element) => element.props.name === name)
function fill(values) {
  for (const [name, value] of Object.entries(values))
    field(page(), name).props.onChange({ target: { value } })
}
const form = (tree) => find(tree, (element) => element.type === "form")
async function submit() {
  let prevented = false
  await form(page()).props.onSubmit({
    preventDefault() {
      prevented = true
    },
  })
  assert.equal(prevented, true)
}
function reset() {
  Object.assign(state, {
    values: [],
    index: 0,
    refs: [],
    refIndex: 0,
    effects: [],
    calls: [],
    result: { data: { user: { id: "test-user" } } },
  })
  setLocale("en", { reload: false })
}
beforeEach(reset)

for (const locale of ["it", "en"])
  test(`semantic form labels, autocomplete and requirements remain accessible (${locale})`, () => {
    setLocale(locale, { reload: false })
    const tree = page()
    assert.equal(form(tree).props.noValidate, true)
    assert.equal(form(tree).props["aria-labelledby"], "password-form")
    const inputs = ["currentPassword", "newPassword", "confirmPassword"].map(
      (name) => field(tree, name)
    )
    for (const input of inputs) {
      assert.ok(
        find(tree, (element) => element.props.htmlFor === input.props.id)
      )
      assert.equal(input.props.required, true)
      assert.equal(input.props["aria-invalid"], false)
    }
    assert.equal(inputs[0].props.autoComplete, "current-password")
    assert.equal(inputs[0].props.minLength, undefined)
    assert.equal(inputs[1].props.autoComplete, "new-password")
    assert.equal(inputs[1].props.minLength, 8)
    assert.equal(inputs[1].props.maxLength, 128)
    assert.equal(inputs[2].props.autoComplete, "new-password")
    const button = find(tree, (element) => element.props.type === "submit")
    assert.equal(button.props.onClick, undefined)
    const html = renderToStaticMarkup(tree)
    assert.ok(
      html.includes(
        locale === "it"
          ? "Usa da 8 a 128 caratteri."
          : "Use 8 to 128 characters."
      )
    )
    assert.equal([...html.matchAll(/type="password"/g)].length, 3)
    assert.equal([...html.matchAll(/type="button"/g)].length, 3)
    assert.deepEqual(state.calls, [])
  })

test("required fields and out-of-range passwords never reach the server and focus the first error", async () => {
  for (const [values, expected] of [
    [{}, "currentPassword"],
    [{ currentPassword: "old" }, "newPassword"],
    [{ currentPassword: "old", newPassword: "validpass" }, "confirmPassword"],
    [
      {
        currentPassword: "old",
        newPassword: "1234567",
        confirmPassword: "1234567",
      },
      "newPassword",
    ],
    [
      {
        currentPassword: "old",
        newPassword: "a".repeat(129),
        confirmPassword: "a".repeat(129),
      },
      "newPassword",
    ],
  ]) {
    reset()
    fill(values)
    page()
    const focused = []
    for (const [index, name] of [
      "currentPassword",
      "newPassword",
      "confirmPassword",
    ].entries())
      state.refs[index].current = {
        focus() {
          focused.push(name)
        },
      }
    await submit()
    assert.deepEqual(state.calls, [])
    assert.deepEqual(focused, [expected])
    const tree = page()
    const input = field(tree, expected)
    assert.equal(input.props["aria-invalid"], true)
    const errorId = `${input.props.id}-error`
    assert.ok(input.props["aria-describedby"].includes(errorId))
    assert.ok(find(tree, (element) => element.props.id === errorId))
  }
})

test("confirmation mismatch is local to its field and clears when corrected", async () => {
  fill({
    currentPassword: "old-password",
    newPassword: "new-password",
    confirmPassword: "different-password",
  })
  await submit()
  assert.deepEqual(state.calls, [])
  let tree = page()
  assert.equal(field(tree, "newPassword").props["aria-invalid"], false)
  assert.equal(field(tree, "confirmPassword").props["aria-invalid"], true)
  const id = `${field(tree, "confirmPassword").props.id}-error`
  assert.equal(
    find(tree, (element) => element.props.id === id).props.children,
    "Password doesn't match"
  )
  fill({ confirmPassword: "new-password" })
  tree = page()
  assert.equal(field(tree, "confirmPassword").props["aria-invalid"], false)
  assert.equal(
    find(tree, (element) => element.props.id === id),
    undefined
  )
})

test("valid length boundaries submit exact values, preserve whitespace and retain session revocation", async () => {
  for (const value of ["12345678", "a".repeat(128), "  valid password  "]) {
    reset()
    fill({ currentPassword: "x", newPassword: value, confirmPassword: value })
    await submit()
    assert.deepEqual(state.calls, [
      { currentPassword: "x", newPassword: value, revokeOtherSessions: true },
    ])
  }
})

test("server errors remain separate from local validation and never mark confirmation invalid", async () => {
  state.result = {
    error: { code: "INVALID_PASSWORD", message: "Private server message" },
  }
  fill({
    currentPassword: "old-password",
    newPassword: "new-password",
    confirmPassword: "new-password",
  })
  await submit()
  const tree = page()
  for (const name of ["currentPassword", "newPassword", "confirmPassword"])
    assert.equal(field(tree, name).props["aria-invalid"], false)
  assert.ok(
    renderToStaticMarkup(tree).includes("Your current password is incorrect.")
  )
  assert.ok(!renderToStaticMarkup(tree).includes("Private server message"))
  assert.equal(
    find(
      tree,
      (element) => element.props.children === "Password doesn't match"
    ),
    undefined
  )
})

const validValues = {
  currentPassword: "old-password",
  newPassword: "new-password",
  confirmPassword: "new-password",
}

test("pending requests block duplicate submits and field edits before and after a rerender", async () => {
  fill(validValues)
  let resolveRequest
  state.result = new Promise((resolve) => {
    resolveRequest = resolve
  })
  const tree = page()
  const handler = form(tree).props.onSubmit
  const request = handler({ preventDefault() {} })
  await handler({ preventDefault() {} })
  let pending = page()
  assert.equal(form(pending).props["aria-busy"], true)
  const button = find(pending, (element) => element.props.type === "submit")
  assert.equal(button.props.disabled, true)
  assert.equal(button.props["aria-busy"], true)
  for (const name of Object.keys(validValues)) {
    assert.equal(field(pending, name).props.disabled, true)
    field(tree, name).props.onChange({ target: { value: "stale edit" } })
    field(pending, name).props.onChange({ target: { value: "pending edit" } })
  }
  await form(pending).props.onSubmit({ preventDefault() {} })
  pending = page()
  for (const [name, value] of Object.entries(validValues))
    assert.equal(field(pending, name).props.value, value)
  const html = renderToStaticMarkup(pending)
  assert.ok(html.includes("Updating…"))
  assert.equal(
    [...html.matchAll(/<button[^>]*type="button"[^>]*disabled/g)].length,
    3
  )
  assert.deepEqual(state.calls, [
    {
      currentPassword: "old-password",
      newPassword: "new-password",
      revokeOtherSessions: true,
    },
  ])
  resolveRequest({ data: { user: { id: "test-user" } } })
  await request
  assert.equal(form(page()).props["aria-busy"], false)
  assert.equal(field(page(), "newPassword").props.disabled, false)
})

for (const locale of ["it", "en"])
  test(`server error codes and network failures use localized feedback (${locale})`, async () => {
    setLocale(locale, { reload: false })
    fill(validValues)
    for (const [result, expected] of [
      [
        { error: { code: "INVALID_PASSWORD" } },
        locale === "it"
          ? "La password attuale non è corretta."
          : "Your current password is incorrect.",
      ],
      [
        { error: { code: "PASSWORD_COMPROMISED" } },
        locale === "it"
          ? "Questa password è presente in una violazione di dati."
          : "This password has appeared in a data breach.",
      ],
      [
        { error: { status: 401 } },
        locale === "it"
          ? "Accedi di nuovo e riprova."
          : "Sign in again and try again.",
      ],
      [
        { error: { status: 429 } },
        locale === "it" ? "Troppi tentativi." : "Too many attempts.",
      ],
      [
        new Error("Network unavailable"),
        locale === "it" ? "Connessione non riuscita." : "Connection failed.",
      ],
    ]) {
      state.result = result
      await submit()
      const tree = page()
      assert.equal(form(tree).props["aria-busy"], false)
      assert.ok(renderToStaticMarkup(tree).includes(expected), expected)
      for (const [name, value] of Object.entries(validValues))
        assert.equal(field(tree, name).props.value, value)
    }
  })

test("network failures release the submission lock, focus the error and allow retry", async () => {
  fill(validValues)
  state.result = new Error("Network unavailable")
  await submit()
  let tree = page()
  let focused = 0
  find(
    tree,
    (element) => element.props.variant === "destructive"
  ).props.ref.current = {
    focus() {
      focused++
    },
  }
  state.effects.forEach((effect) => effect())
  assert.equal(focused, 1)
  assert.equal(form(tree).props["aria-busy"], false)
  state.result = { data: { user: { id: "test-user" } } }
  await submit()
  tree = page()
  assert.equal(state.calls.length, 2)
  assert.ok(renderToStaticMarkup(tree).includes("Password updated"))
  assert.ok(!renderToStaticMarkup(tree).includes("Connection failed."))
})

test("editing or resubmitting clears old success, including when a later request fails", async () => {
  fill(validValues)
  await submit()
  assert.ok(renderToStaticMarkup(page()).includes("Password updated"))
  fill({ currentPassword: "new-password" })
  assert.ok(!renderToStaticMarkup(page()).includes("Password updated"))
  fill({ newPassword: "next-password", confirmPassword: "next-password" })
  await submit()
  assert.ok(renderToStaticMarkup(page()).includes("Password updated"))
  fill({
    currentPassword: "wrong-current-password",
    newPassword: "third-password",
    confirmPassword: "third-password",
  })
  state.result = { error: { code: "INVALID_PASSWORD" } }
  await submit()
  const html = renderToStaticMarkup(page())
  assert.ok(html.includes("Your current password is incorrect."))
  assert.ok(!html.includes("Password updated"))
})

for (const locale of ["it", "en"])
  test(`successful completion clears fields, restores hidden inputs and announces session handling (${locale})`, async () => {
    setLocale(locale, { reload: false })
    fill(validValues)
    const before = page()
    const initialKeys = Object.keys(validValues).map(
      (name) => field(before, name).key
    )
    const beforeHtml = renderToStaticMarkup(before)
    assert.ok(
      beforeHtml.includes(
        locale === "it"
          ? "Il cambio password disconnette le altre sessioni."
          : "Changing your password signs out other sessions."
      )
    )
    await submit()
    const tree = page()
    assert.equal(form(tree).props["aria-busy"], false)
    for (const [index, name] of Object.keys(validValues).entries()) {
      const input = field(tree, name)
      assert.equal(input.props.value, "")
      assert.equal(input.props["aria-invalid"], false)
      assert.notEqual(input.key, initialKeys[index])
    }
    assert.equal(field(tree, "currentPassword").props.autoFocus, false)
    assert.equal(
      find(tree, (element) => element.props.type === "submit").props.disabled,
      true
    )
    const status = find(tree, (element) => element.props.role === "status")
    assert.ok(status)
    assert.equal(status.props.tabIndex, -1)
    let focused = 0
    status.props.ref.current = {
      focus() {
        focused++
      },
    }
    state.effects.forEach((effect) => effect())
    assert.equal(focused, 1)
    const html = renderToStaticMarkup(tree)
    assert.ok(
      html.includes(
        locale === "it"
          ? "Le altre sessioni sono state disconnesse."
          : "Other sessions have been signed out."
      )
    )
    assert.equal([...html.matchAll(/type="password"/g)].length, 3)
    for (const value of Object.values(validValues))
      assert.ok(!html.includes(`value="${value}"`))
    assert.deepEqual(state.calls, [
      {
        currentPassword: "old-password",
        newPassword: "new-password",
        revokeOtherSessions: true,
      },
    ])
  })

test("unknown errors and missing response data never show raw server details or false success", async () => {
  fill(validValues)
  for (const result of [
    {},
    { data: null },
    { error: { code: "UNKNOWN", message: "<script>private details</script>" } },
  ]) {
    state.result = result
    await submit()
    const html = renderToStaticMarkup(page())
    assert.ok(
      html.includes("Unable to update your password. Please try again.")
    )
    assert.ok(!html.includes("private details"))
    assert.ok(!html.includes("Password updated"))
  }
})
