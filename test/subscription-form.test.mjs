import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { registerHooks } from "node:module"
import test from "node:test"
import { createElement, Children, isValidElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"
import { setLocale } from "../src/paraglide/runtime.js"
const root = new URL("../app/", import.meta.url)
const state = { values: [], index: 0 }
globalThis.subscriptionFormTest = state
const mock = (source) => ({
  url: `data:text/javascript,${encodeURIComponent(source)}`,
  shortCircuit: true,
})
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (
      specifier === "react" &&
      context.parentURL?.endsWith("/subscription-form.tsx")
    )
      return mock(
        `export const useEffect=()=>{};export const useRef=initial=>({current:initial});export const useId=()=> 'subscription-test';export const useState=initial=>{const s=globalThis.subscriptionFormTest;const index=s.index++;if(index===s.values.length)s.values.push(typeof initial==='function'?initial():initial);return[s.values[index],value=>{s.values[index]=typeof value==='function'?value(s.values[index]):value}];};`
      )
    if (specifier === "~/components/ui/dialog")
      return mock(
        `import {createElement,cloneElement} from ${JSON.stringify(import.meta.resolve("react"))};export const Dialog=({open,children})=>open?createElement('div',null,children):null;export const DialogContent=({showCloseButton,...props})=>createElement('div',props);export const DialogHeader=DialogContent,DialogFooter=DialogContent;export const DialogTitle=props=>createElement('h2',props);export const DialogDescription=props=>createElement('p',props);export const DialogClose=({render})=>cloneElement(render,{type:'button'});`
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
const { SubscriptionForm } =
  await import("../app/components/subscription-form.tsx")
hooks.deregister()
const aps = [
  { ns: "one", name: "First system", company: "Prime" },
  { ns: "two", name: "São Paulo", company: "Sotefin" },
]
const selected = {
  email: "user@example.test",
  company: "Prime",
  role: "valet",
  subscribed: true,
  aps: ["one", "legacy"],
}
const fetcher = { state: "idle", Form: (props) => createElement("form", props) }
const props = {
  action: "update",
  aps,
  fetcher,
  open: true,
  setOpen() {},
  selectedSubscription: selected,
}
function tree(options = props) {
  state.index = 0
  const editor = SubscriptionForm(options)
  return editor?.type(editor.props)
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
const chosen = (element) =>
  findAll(
    element,
    (item) => item.type === "input" && item.props.name === "aps"
  ).map((item) => item.props.value)
const input = (element, name) =>
  findAll(element, (item) => item.props.name === name)[0]
const search = (element) =>
  findAll(element, (item) => item.props.type === "search")[0]
const checkbox = (element, ns) =>
  findAll(
    element,
    (item) =>
      item.props.value === ns &&
      typeof item.props.onCheckedChange === "function"
  )[0]
const reset = () => {
  state.values = []
  state.index = 0
}

test("editing preloads company, role and exactly the stored assignments", () => {
  reset()
  const element = tree()
  assert.equal(input(element, "company").props.value, "Prime")
  assert.equal(input(element, "role").props.defaultValue, "valet")
  assert.deepEqual(chosen(element), ["one", "legacy"])
  assert.equal(checkbox(element, "one").props.checked, true)
  assert.equal(checkbox(element, "two").props.checked, false)
  assert.equal(checkbox(element, "legacy").props.checked, true)
})
test("new subscriptions start without assignments and changing company never grants access", () => {
  reset()
  let element = tree({
    ...props,
    action: "create",
    selectedSubscription: undefined,
  })
  assert.deepEqual(chosen(element), [])
  input(element, "company").props.onChange({ target: { value: "Prime" } })
  element = tree({
    ...props,
    action: "create",
    selectedSubscription: undefined,
  })
  assert.deepEqual(chosen(element), [])
  checkbox(element, "two").props.onCheckedChange(true)
  element = tree({
    ...props,
    action: "create",
    selectedSubscription: undefined,
  })
  input(element, "company").props.onChange({ target: { value: "Sotefin" } })
  assert.deepEqual(
    chosen(
      tree({ ...props, action: "create", selectedSubscription: undefined })
    ),
    ["two"]
  )
})
test("search hides rows while retaining their assignment in the form payload", () => {
  reset()
  let element = tree()
  search(element).props.onChange({ target: { value: "SAO PAULO" } })
  element = tree()
  assert.equal(checkbox(element, "one"), undefined)
  assert.ok(checkbox(element, "two"))
  assert.deepEqual(chosen(element), ["one", "legacy"])
  checkbox(element, "two").props.onCheckedChange(true)
  assert.deepEqual(chosen(tree()), ["one", "legacy", "two"])
  search(tree()).props.onChange({ target: { value: "nothing matches" } })
  element = tree()
  assert.equal(
    findAll(element, (item) => typeof item.props.onCheckedChange === "function")
      .length,
    0
  )
  assert.deepEqual(chosen(element), ["one", "legacy", "two"])
})
test("unknown systems can be explicitly removed and restored without accidental loss", () => {
  reset()
  let element = tree()
  checkbox(element, "legacy").props.onCheckedChange(false)
  element = tree()
  assert.deepEqual(chosen(element), ["one"])
  checkbox(element, "legacy").props.onCheckedChange(true)
  assert.deepEqual(chosen(tree()), ["one", "legacy"])
})
for (const locale of ["it", "en"])
  test(`form is localized, labelled and preserves email on update (${locale})`, () => {
    setLocale(locale, { reload: false })
    reset()
    const element = tree()
    const html = renderToStaticMarkup(element)
    for (const text of locale === "it"
      ? [
          "Dati iscrizione",
          "Impianti assegnati",
          "Impianti selezionati: 2",
          "Salva",
          "Annulla",
        ]
      : [
          "Subscription details",
          "Assigned systems",
          "Selected systems: 2",
          "Save",
          "Cancel",
        ])
      assert.ok(html.includes(text), text)
    const email = html.match(/<input\b(?=[^>]*name="email")[^>]*>/)[0]
    assert.match(email, /readonly=""/i)
    assert.doesNotMatch(email, /disabled=""/)
    assert.match(email, /value="user@example.test"/)
    assert.equal(input(element, "email").props.readOnly, true)
    for (const match of html.matchAll(/<label[^>]*for="([^"]+)"/g))
      assert.ok(html.includes(`id="${match[1]}"`), match[1])
    assert.match(html, /sm:max-w-xl/)
    assert.match(html, /grid-cols-1/)
    assert.doesNotMatch(html, /Save changes/)
    for (const box of findAll(
      element,
      (item) => typeof item.props.onCheckedChange === "function"
    ))
      assert.equal(box.props.name, undefined)
  })
test("closing unmounts the draft and different subscriptions have distinct editor keys", () => {
  assert.equal(SubscriptionForm({ ...props, open: false }), null)
  const one = SubscriptionForm(props),
    two = SubscriptionForm({
      ...props,
      selectedSubscription: {
        ...selected,
        email: "second@example.test",
        company: "Sotefin",
        aps: ["two"],
      },
    })
  assert.notEqual(one.key, two.key)
  reset()
  const element = two.type(two.props)
  assert.equal(input(element, "company").props.value, "Sotefin")
  assert.deepEqual(chosen(element), ["two"])
  reset()
  assert.equal(
    input(
      tree({ ...props, action: "create", selectedSubscription: undefined }),
      "email"
    ).props.readOnly,
    false
  )
})
