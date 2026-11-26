import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { registerHooks } from "node:module"
import test, { afterEach, beforeEach } from "node:test"
import { Children, isValidElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"
import { setLocale } from "../src/paraglide/runtime.js"

const root = new URL("../app/", import.meta.url)
const uri = "otpauth://totp/Test?secret=JBSWY3DPEHPK3PXP&issuer=Test"
const recoveryCodes = [
  "test-code-one",
  "test-code-two",
  "test-code-three",
  "test-code-four",
]
const navigatorDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "navigator"
)
const state = {
  values: [],
  index: 0,
  refs: [],
  refIndex: 0,
  effects: [],
  calls: [],
  success: false,
  enabled: false,
  enableResult: {
    data: { method: "totp", totpURI: uri, backupCodes: recoveryCodes },
  },
  disableResult: { data: { status: true } },
  verifyResult: { data: { status: true } },
  clipboardWrites: [],
  clipboardResult: undefined,
  navigation: [],
}
globalThis.twoFactorFormTest = state
const mock = (source) => ({
  url: `data:text/javascript,${encodeURIComponent(source)}`,
  shortCircuit: true,
})
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (
      specifier === "react" &&
      context.parentURL?.endsWith("/components/setup-2fa.tsx")
    )
      return mock(
        "export const useId=()=> 'two-factor-form';export const useEffect=effect=>globalThis.twoFactorFormTest.effects.push(effect);export const useRef=initial=>{const s=globalThis.twoFactorFormTest;return s.refs[s.refIndex++]??={current:initial}};export const useState=initial=>{const s=globalThis.twoFactorFormTest;const i=s.index++;if(i===s.values.length)s.values.push(initial);return[s.values[i],value=>{s.values[i]=typeof value==='function'?value(s.values[i]):value}];};"
      )
    if (
      specifier === "react" &&
      context.parentURL?.endsWith("/auth/two-factor-setup.tsx")
    )
      return mock(
        "export const useState=()=>[globalThis.twoFactorFormTest.success,value=>{globalThis.twoFactorFormTest.success=value}];"
      )
    if (specifier === "react-router")
      return mock(
        "export const useNavigate=()=>path=>{globalThis.twoFactorFormTest.navigation.push(path)};"
      )
    if (specifier === "~/lib/auth")
      return mock(
        "const call=async(method,payload)=>{const s=globalThis.twoFactorFormTest;s.calls.push([method,payload]);return s[method+'Result']};export const authClient={twoFactor:{enable:payload=>call('enable',payload),disable:payload=>call('disable',payload),verifyTotp:payload=>call('verify',payload)}};"
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
const { Setup2FA } = await import("../app/components/setup-2fa.tsx")
const { default: AuthSetup } =
  await import("../app/routes/auth/two-factor-setup.tsx")
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
function page(showStatus = true, onComplete) {
  state.index = 0
  state.refIndex = 0
  state.effects = []
  return Setup2FA({
    isTwoFactorEnabled: state.enabled,
    success: state.success,
    setSuccess(value) {
      state.success = value
    },
    showStatus,
    onComplete,
  })
}
const input = (tree, name) =>
  find(tree, (element) => element.props.name === name)
const action = (tree) =>
  find(
    tree,
    (element) =>
      element.props.className === "w-full" &&
      typeof element.props.onClick === "function"
  )
const qr = (tree) => find(tree, (element) => element.props.role === "img")
const badge = (tree) => find(tree, (element) => element.props.role === "status")
async function start() {
  input(page(), "password").props.onChange({
    target: { value: "test-password" },
  })
  await action(page()).props.onClick()
}
const setCode = (value) =>
  input(page(), "totp").props.onChange({ target: { value } })
beforeEach(() => {
  Object.assign(state, {
    values: [],
    index: 0,
    refs: [],
    refIndex: 0,
    effects: [],
    calls: [],
    success: false,
    enabled: false,
    enableResult: {
      data: { method: "totp", totpURI: uri, backupCodes: recoveryCodes },
    },
    disableResult: { data: { status: true } },
    verifyResult: { data: { status: true } },
    clipboardWrites: [],
    clipboardResult: undefined,
    navigation: [],
  })
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      clipboard: {
        writeText: async (text) => {
          state.clipboardWrites.push(text)
          if (state.clipboardResult instanceof Error)
            throw state.clipboardResult
          return state.clipboardResult
        },
      },
    },
  })
  setLocale("en", { reload: false })
})
afterEach(() => {
  if (navigatorDescriptor)
    Object.defineProperty(globalThis, "navigator", navigatorDescriptor)
  else delete globalThis.navigator
})

for (const locale of ["it", "en"])
  test(`QR and verification are two labelled steps with responsive graphics (${locale})`, async () => {
    setLocale(locale, { reload: false })
    await start()
    const tree = page()
    const sections = findAll(tree, (element) => element.type === "section")
    assert.equal(sections.length, 2)
    for (const section of sections)
      assert.ok(
        find(
          section,
          (element) => element.props.id === section.props["aria-labelledby"]
        )
      )
    const graphic = qr(tree)
    assert.equal(graphic.props.value, uri)
    assert.equal(graphic.props.bgColor, "#ffffff")
    assert.equal(graphic.props.fgColor, "#000000")
    assert.deepEqual(graphic.props.style, {
      width: "100%",
      maxWidth: "100%",
      height: "auto",
    })
    assert.ok(graphic.props["aria-label"])
    assert.ok(
      find(
        tree,
        (element) =>
          element.props.className?.includes("mx-auto w-full max-w-64") &&
          element.props.className.includes("bg-white")
      )
    )
    const html = renderToStaticMarkup(tree)
    assert.ok(
      html.includes(
        locale === "it" ? "Scansiona il codice QR" : "Scan the QR code"
      )
    )
    assert.ok(
      html.includes(
        locale === "it" ? "Inserisci le sei cifre" : "Enter the six digits"
      )
    )
    assert.ok(!html.includes("/2fa-recovery"))
    setCode("12345")
    input(page(), "totp").props.onBlur()
    assert.ok(
      renderToStaticMarkup(page()).includes(
        locale === "it"
          ? "Inserisci un codice di sei cifre."
          : "Enter a six-digit code."
      )
    )
  })

test("OTP field is controlled, labelled and configured for numeric entry and one-time-code autofill", async () => {
  await start()
  const tree = page()
  const code = input(tree, "totp")
  assert.equal(code.props.type, "text")
  assert.equal(code.props.inputMode, "numeric")
  assert.equal(code.props.autoComplete, "one-time-code")
  assert.equal(code.props.pattern, "[0-9]{6}")
  assert.equal(code.props.minLength, 6)
  assert.equal(code.props.maxLength, 6)
  assert.equal(code.props.required, true)
  assert.equal(code.props.value, "")
  assert.ok(find(tree, (element) => element.props.htmlFor === code.props.id))
  assert.ok(
    find(tree, (element) => element.props.id === code.props["aria-describedby"])
  )
  assert.equal(action(tree).props.disabled, true)
})

test("empty, incomplete, nonnumeric and overlong codes cannot be sent to the server", async () => {
  await start()
  let focused = 0
  state.refs[0].current = {
    focus() {
      focused++
    },
  }
  for (const code of ["", "12345", "1234567", "12a456", "١٢٣٤٥٦", " 12345"]) {
    setCode(code)
    assert.equal(action(page()).props.disabled, true)
    await action(page()).props.onClick()
    const tree = page()
    assert.equal(input(tree, "totp").props["aria-invalid"], true)
    const errorId = `${input(tree, "totp").props.id}-error`
    assert.ok(input(tree, "totp").props["aria-describedby"].includes(errorId))
    assert.ok(find(tree, (element) => element.props.id === errorId))
  }
  assert.equal(focused, 6)
  assert.deepEqual(
    state.calls.map(([method]) => method),
    ["enable"]
  )
  assert.equal(state.success, false)
})

test("valid six-digit code preserves leading zeros and enables 2FA only after verification", async () => {
  await start()
  assert.equal(badge(page()).props.children, "2FA not enabled")
  setCode("001234")
  assert.equal(action(page()).props.disabled, false)
  await action(page()).props.onClick()
  assert.deepEqual(state.calls.at(-1), [
    "verify",
    { code: "001234", trustDevice: true },
  ])
  assert.equal(state.success, true)
  assert.equal(badge(page()).props.children, "2FA enabled")
})

test("failed verification retains QR, code and disabled status; editing clears the local format error", async () => {
  await start()
  setCode("12345")
  input(page(), "totp").props.onBlur()
  assert.equal(input(page(), "totp").props["aria-invalid"], true)
  setCode("001234")
  assert.equal(input(page(), "totp").props["aria-invalid"], false)
  state.verifyResult = { error: { message: "Invalid code" } }
  await action(page()).props.onClick()
  const tree = page()
  assert.equal(qr(tree).props.value, uri)
  assert.equal(input(tree, "totp").props.value, "001234")
  assert.equal(badge(tree).props.children, "2FA not enabled")
  assert.equal(state.success, false)
  assert.ok(renderToStaticMarkup(tree).includes("Invalid code"))
})

test("password visibility preserves its value and default shared usage has no status badge", () => {
  let tree = page(false)
  assert.equal(badge(tree), undefined)
  const password = input(tree, "password")
  assert.equal(password.props.autoComplete, "current-password")
  assert.ok(
    find(tree, (element) => element.props.htmlFor === password.props.id)
  )
  password.props.onChange({ target: { value: "test-password" } })
  tree = page(false)
  const toggle = find(
    tree,
    (element) => element.props["aria-controls"] === password.props.id
  )
  assert.equal(toggle.props.type, "button")
  toggle.props.onClick()
  assert.equal(input(page(false), "password").props.type, "text")
  assert.equal(input(page(false), "password").props.value, "test-password")
  assert.deepEqual(state.calls, [])
})

const codes = (tree) =>
  findAll(tree, (element) => element.type === "code").map(
    (element) => element.props.children
  )
const copyButton = (tree) =>
  find(tree, (element) => element.props["aria-busy"] !== undefined)
async function completeVerification() {
  await start()
  assert.deepEqual(codes(page()), [])
  setCode("001234")
  await action(page()).props.onClick()
}

for (const locale of ["it", "en"])
  test(`recovery codes remain visible until explicit completion, then credentials and codes are cleared (${locale})`, async () => {
    setLocale(locale, { reload: false })
    await completeVerification()
    let tree = page()
    assert.deepEqual(codes(tree), recoveryCodes)
    assert.equal(qr(tree), undefined)
    assert.equal(input(tree, "password"), undefined)
    assert.equal(input(tree, "totp"), undefined)
    const stored = JSON.stringify(state.values)
    for (const value of [uri, "test-password", "001234"])
      assert.ok(!stored.includes(value))
    const html = renderToStaticMarkup(tree)
    assert.ok(
      html.includes(locale === "it" ? "Codici di recupero" : "Recovery codes")
    )
    assert.ok(html.includes("sm:grid-cols-2"))
    assert.ok(html.includes("font-mono"))
    await copyButton(tree).props.onClick()
    tree = page()
    assert.deepEqual(state.clipboardWrites, [recoveryCodes.join("\n")])
    assert.ok(
      renderToStaticMarkup(tree).includes(
        locale === "it" ? "Codici copiati" : "Codes copied"
      )
    )
    assert.deepEqual(codes(tree), recoveryCodes)
    let focused = 0
    const feedback = find(
      tree,
      (element) => element.props.role === "status" && element.props.ref
    )
    feedback.props.ref.current = {
      focus() {
        focused++
      },
    }
    state.effects.forEach((effect) => effect())
    assert.equal(focused, 1)
    action(tree).props.onClick()
    tree = page()
    assert.equal(state.success, false)
    assert.deepEqual(codes(tree), [])
    assert.equal(copyButton(tree), undefined)
    assert.equal(input(tree, "password").props.value, "")
    assert.equal(input(tree, "password").props.type, "password")
    assert.equal(action(tree).props.disabled, true)
    assert.equal(
      badge(tree).props.children,
      locale === "it" ? "2FA attiva" : "2FA enabled"
    )
    for (const code of recoveryCodes)
      assert.ok(!JSON.stringify(state.values).includes(code))
  })

test("clipboard denial and unavailable clipboard retain every code and allow manual completion", async () => {
  await completeVerification()
  state.clipboardResult = new Error("Clipboard permission denied")
  await copyButton(page()).props.onClick()
  assert.deepEqual(codes(page()), recoveryCodes)
  assert.ok(
    renderToStaticMarkup(page()).includes(
      "You can select and copy them manually."
    )
  )
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {},
  })
  await copyButton(page()).props.onClick()
  assert.deepEqual(codes(page()), recoveryCodes)
  assert.equal(copyButton(page()).props.disabled, false)
  action(page()).props.onClick()
  assert.deepEqual(codes(page()), [])
})

test("closing during a pending copy clears codes and ignores late clipboard feedback", async () => {
  await completeVerification()
  let resolveCopy
  state.clipboardResult = new Promise((resolve) => {
    resolveCopy = resolve
  })
  const copy = copyButton(page()).props.onClick
  const request = copy()
  await copy()
  assert.equal(copyButton(page()).props.disabled, true)
  assert.equal(state.clipboardWrites.length, 1)
  action(page()).props.onClick()
  resolveCopy()
  await request
  const tree = page()
  assert.deepEqual(codes(tree), [])
  assert.equal(copyButton(tree), undefined)
  assert.ok(!renderToStaticMarkup(tree).includes("Codes copied"))
})

test("disabling reports a distinct outcome and clears password and temporary values", async () => {
  state.enabled = true
  input(page(), "password").props.onChange({
    target: { value: "test-password" },
  })
  await action(page()).props.onClick()
  const tree = page()
  assert.deepEqual(state.calls, [["disable", { password: "test-password" }]])
  assert.equal(badge(tree).props.children, "2FA not enabled")
  assert.equal(input(tree, "password").props.value, "")
  assert.equal(input(tree, "password").props.type, "password")
  assert.deepEqual(codes(tree), [])
  const html = renderToStaticMarkup(tree)
  assert.ok(html.includes("Two-factor authentication disabled"))
  assert.ok(!html.includes("Two-factor authentication enabled"))
})

test("missing verification or disable results cannot clear inputs or falsely update the status", async () => {
  state.enabled = true
  state.disableResult = { data: { status: false } }
  input(page(), "password").props.onChange({
    target: { value: "test-password" },
  })
  await action(page()).props.onClick()
  assert.equal(badge(page()).props.children, "2FA enabled")
  assert.equal(input(page(), "password").props.value, "test-password")
  state.enabled = false
  state.values = []
  await start()
  setCode("001234")
  state.verifyResult = {}
  await action(page()).props.onClick()
  assert.equal(qr(page()).props.value, uri)
  assert.equal(input(page(), "totp").props.value, "001234")
  assert.equal(state.success, false)
  assert.equal(badge(page()).props.children, "2FA not enabled")
})

test("auth setup continues to system selection only after recovery codes are explicitly acknowledged", async () => {
  const parent = AuthSetup()
  const setup = find(parent, (element) => element.type === Setup2FA)
  assert.equal(typeof setup.props.onComplete, "function")
  await completeVerification()
  assert.deepEqual(state.navigation, [])
  action(page(false, setup.props.onComplete)).props.onClick()
  assert.deepEqual(state.navigation, ["/aps-select"])
  assert.deepEqual(codes(page()), [])
})
