import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { registerHooks } from "node:module"
import test from "node:test"
import ts from "typescript"
import { setLocale } from "../src/paraglide/runtime.js"

const transURL = new URL("../app/lib/trans.ts", import.meta.url).href
const imports = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      context.parentURL === transURL &&
      specifier === "@paraglide/messages.js"
    ) {
      return {
        url: new URL("../src/paraglide/messages.js", import.meta.url).href,
        shortCircuit: true,
      }
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (url === transURL) {
      const { outputText } = ts.transpileModule(
        readFileSync(new URL(url), "utf8"),
        { compilerOptions: { module: ts.ModuleKind.ESNext } }
      )
      return { format: "module", source: outputText, shortCircuit: true }
    }
    return nextLoad(url, context)
  },
})
const { logT, safeMessageT } = await import(transURL)
imports.deregister()

const base = { card: 183, stall: 201, mode: { id: 8, key: "mode-auto" } }
const cases = [
  [0, "op-no", "---", "---"],
  [3, "op-switch-mode", "Switch to function mode 8", "Cambio funzione 8"],
  [4, "op-change-pin", "PIN changed for card 183", "Modificato PIN tag 183"],
  [5, "op-stall-in", "Parked car 183, stall 201", "Entrata 183, stallo 201"],
  [6, "op-stall-out", "Unparked car 183, stall 201", "Uscita 183, stallo 201"],
  [
    7,
    "op-shuffle-in",
    "Moved car 183 in stall 201",
    "Spostamento 183 in stallo 201",
  ],
  [
    8,
    "op-shuffle-out",
    "Moved car 183 from stall 201",
    "Spostamento 183 da stallo 201",
  ],
  [9, "op-stall-rsv", "Reserved stall 201", "Prenotato stallo 201"],
  [10, "op-req-exit", "Exit request for card 183", "Richiesta uscita, tag 183"],
  [
    11,
    "op-req-entry",
    "Entry request for card 183",
    "Richiesta entrata, tag 183",
  ],
  [
    12,
    "op-req-rollback",
    "Rollback requested for card 183",
    "Richiesta di rollback per la tessera 183",
  ],
  [
    13,
    "op-req-queue",
    "Queue deletion requested for card 183",
    "Richiesta di cancellazione dalla coda per la tessera 183",
  ],
  [
    14,
    "op-req-pp",
    "Step-by-step operation requested",
    "Richiesta operazione passo-passo",
  ],
  [15, "op-req-swap", "Swap request for card 183", "Richiesta swap, tag 183"],
  [
    16,
    "op-req-repark",
    "Re_park initiated for card 183",
    "Riparcheggio tag 183",
  ],
  [17, "op-card-issued", "Issued card 183", "Emesso tag 183"],
]

for (const locale of ["en", "it"]) {
  for (const [id, key, en, it] of cases) {
    test(`${locale}: canonical operation ${id} has an activity message and history label`, () => {
      setLocale(locale, { reload: false })
      for (const user of ["operator@example.test", undefined]) {
        assert.equal(
          logT({ ...base, user, operation: { id, key } }),
          locale === "en" ? en : it
        )
      }
      assert.doesNotMatch(
        safeMessageT("history_table", key),
        /Missing translation/
      )
    })
  }
  for (const key of ["op-alarm-on", "op-alarm-off"]) {
    test(`${locale}: ${key} has a history label and tolerates missing alarm details`, () => {
      setLocale(locale, { reload: false })
      assert.doesNotMatch(
        safeMessageT("history_table", key),
        /Missing translation/
      )
      assert.equal(logT({ ...base, operation: { id: 1, key } }), null)
    })
  }
}

test("operation descriptions depend on the key, including unchanged KN codes", () => {
  setLocale("en", { reload: false })
  assert.equal(
    logT({ ...base, operation: { id: 95, key: "op-stall-in" } }),
    "Parked car 183, stall 201"
  )
  assert.equal(
    logT({ ...base, operation: { id: 97, key: "op-stall-lck" } }),
    "Locked stall 201"
  )
  assert.equal(
    logT({ ...base, operation: { id: 13, key: "op-req-repark" } }),
    "Re_park initiated for card 183"
  )
})

test("unknown operation keys retain a neutral fallback", () => {
  setLocale("en", { reload: false })
  assert.equal(
    logT({ ...base, operation: { id: 80, key: "op-unknown" } }),
    "Operation 80"
  )
})
