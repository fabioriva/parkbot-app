import assert from "node:assert/strict"
import { registerHooks } from "node:module"
import { test } from "node:test"
import { can } from "../app/lib/permissions.ts"

const plants = [{ ns: "avigail" }, { ns: "menloa" }]
let queryCount = 0
const db = {
  collection: () => ({
    find: (query) => {
      queryCount++
      return {
        toArray: async () =>
          query.ns
            ? plants.filter((plant) => query.ns.$in.includes(plant.ns))
            : plants,
      }
    },
  }),
}
globalThis.apsAccessTestDb = db
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.endsWith("/app/lib/aps.server.ts")) {
      if (specifier === "./db.server")
        return {
          url: "data:text/javascript,export const db = globalThis.apsAccessTestDb",
          shortCircuit: true,
        }
      if (specifier === "./date-time")
        return nextResolve("./date-time.ts", context)
    }
    return nextResolve(specifier, context)
  },
})
const { findSubscribedApsList, findAllAps } =
  await import("../app/lib/aps.server.ts")
hooks.deregister()

test("empty assignments never expand to the administrative plant list", async () => {
  assert.deepEqual(await findSubscribedApsList(undefined), [])
  assert.deepEqual(await findSubscribedApsList([]), [])
  assert.equal(queryCount, 0)
  assert.deepEqual(await findSubscribedApsList(["avigail"]), [
    { ns: "avigail" },
  ])
  assert.deepEqual(await findAllAps(), plants)
})

test("valet UI permissions match the agreed operations", () => {
  for (const permission of ["exit", "rollback", "queue.delete"])
    assert.equal(can("valet", permission), true)
  for (const permission of ["entry", "pp", "map.edit", "pin.edit", "admin"])
    assert.equal(can("valet", permission), false)
  assert.equal(can("unknown", "exit"), false)
})
