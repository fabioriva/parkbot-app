import assert from "node:assert/strict"
import { registerHooks } from "node:module"
import { test } from "node:test"

// Socket lifecycle tests do not need the UI imports or Vite's alias resolver.
const dependencies = new Map([
  ["~/components/ui/toast", "export const toast = { add() {} }"],
  ["~/lib/trans", "export function logT() {}"],
  ["~/lib/date-time", "export function formatPlantDateTime() {}"],
])
const imports = registerHooks({
  resolve(specifier, context, nextResolve) {
    const source = dependencies.get(specifier)
    if (source !== undefined) {
      return {
        url: `data:text/javascript,${encodeURIComponent(source)}`,
        shortCircuit: true,
      }
    }
    return nextResolve(specifier, context)
  },
})

const { connectReconnectingWebSocket } = await import("../app/hooks/use-ws.ts")
imports.deregister()

function setup(t) {
  const sockets = []
  const originalWebSocket = globalThis.WebSocket

  class FakeWebSocket {
    constructor(url) {
      this.url = url
      this.closeCalls = 0
      sockets.push(this)
    }

    open() {
      this.onopen?.()
    }

    message(data) {
      this.onmessage?.({ data })
    }

    end(code = 1006) {
      this.onclose?.({ code, reason: "", wasClean: code === 1000 })
    }

    close() {
      this.closeCalls++
      this.end(1000)
    }
  }

  globalThis.WebSocket = FakeWebSocket
  t.after(() => {
    globalThis.WebSocket = originalWebSocket
  })
  t.mock.timers.enable({ apis: ["setTimeout"] })
  t.mock.method(Math, "random", () => 0.5)
  t.mock.method(console, "warn", () => {})
  return sockets
}

test("receives broadcasts again after reconnecting", (t) => {
  const sockets = setup(t)
  const messages = []
  const stop = connectReconnectingWebSocket("wss://example.test/info", {
    onMessage: (event) => messages.push(event.data),
  })

  sockets[0].open()
  sockets[0].message("first broadcast")
  sockets[0].end()
  t.mock.timers.tick(899)
  assert.equal(sockets.length, 1)
  t.mock.timers.tick(1)
  assert.equal(sockets.length, 2)
  assert.equal(sockets[1].url, "wss://example.test/info")
  sockets[1].open()
  sockets[1].message("second broadcast")
  assert.deepEqual(messages, ["first broadcast", "second broadcast"])
  stop()
})

test("failed connections back off to the cap and opening resets the delay", (t) => {
  const sockets = setup(t)
  const stop = connectReconnectingWebSocket("wss://example.test/info", {
    onMessage: () => {},
  })

  for (const delay of [900, 1800, 3600, 7200, 14400, 27000, 27000]) {
    const count = sockets.length
    sockets.at(-1).end()
    t.mock.timers.tick(delay - 1)
    assert.equal(sockets.length, count)
    t.mock.timers.tick(1)
    assert.equal(sockets.length, count + 1)
  }

  sockets.at(-1).open()
  const count = sockets.length
  sockets.at(-1).end()
  t.mock.timers.tick(900)
  assert.equal(sockets.length, count + 1)
  stop()
})

test("an error followed by close schedules only one reconnect", (t) => {
  const sockets = setup(t)
  const stop = connectReconnectingWebSocket("wss://example.test/info", {
    onMessage: () => {},
  })

  sockets[0].onerror()
  sockets[0].end()
  t.mock.timers.tick(900)
  assert.equal(sockets.length, 2)
  t.mock.timers.tick(30_000)
  assert.equal(sockets.length, 2)
  stop()
})

test("cleanup cancels pending retries and ignores late socket events", (t) => {
  const sockets = setup(t)
  const events = []
  const stop = connectReconnectingWebSocket("wss://example.test/info", {
    onMessage: () => events.push("message"),
    onOpen: () => events.push("open"),
    onClose: () => events.push("close"),
  })

  sockets[0].end()
  assert.deepEqual(events, ["close"])
  stop()
  assert.equal(sockets[0].closeCalls, 1)
  sockets[0].open()
  sockets[0].message("late broadcast")
  sockets[0].end()
  t.mock.timers.tick(60_000)
  assert.equal(sockets.length, 1)
  assert.deepEqual(events, ["close"])
})

test("cleanup during connection allows a fresh URL without reviving the old one", (t) => {
  const sockets = setup(t)
  const messages = []
  const stopOld = connectReconnectingWebSocket("wss://example.test/old", {
    onMessage: (event) => messages.push(event.data),
  })
  stopOld()
  const stopNew = connectReconnectingWebSocket("wss://example.test/new", {
    onMessage: (event) => messages.push(event.data),
  })

  sockets[0].message("old broadcast")
  sockets[1].open()
  sockets[1].message("new broadcast")
  t.mock.timers.tick(60_000)
  assert.equal(sockets.length, 2)
  assert.equal(sockets[1].url, "wss://example.test/new")
  assert.deepEqual(messages, ["new broadcast"])
  stopNew()
})

test("policy violations stop retries while normal server closes reconnect", (t) => {
  const sockets = setup(t)
  const stopPolicy = connectReconnectingWebSocket("wss://example.test/policy", {
    onMessage: () => {},
  })
  sockets[0].end(1008)
  t.mock.timers.tick(60_000)
  assert.equal(sockets.length, 1)
  stopPolicy()

  const stopNormal = connectReconnectingWebSocket("wss://example.test/info", {
    onMessage: () => {},
  })
  sockets[1].end(1000)
  t.mock.timers.tick(900)
  assert.equal(sockets.length, 3)
  stopNormal()
})
