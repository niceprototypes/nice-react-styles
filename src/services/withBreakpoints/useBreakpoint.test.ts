import { test } from "node:test"
import assert from "node:assert/strict"
import { subscribe } from "./useBreakpoint.ts"

type Handler = () => void

// Minimal window stand-in that records resize listener registration
const createWindow = () => {
  const added: Handler[] = []
  const removed: Handler[] = []
  const active = new Set<Handler>()
  return {
    added,
    removed,
    active,
    innerWidth: 1024,
    addEventListener: (type: string, handler: Handler) => {
      if (type !== "resize") return
      added.push(handler)
      active.add(handler)
    },
    removeEventListener: (type: string, handler: Handler) => {
      if (type !== "resize") return
      removed.push(handler)
      active.delete(handler)
    },
    fireResize() {
      active.forEach((handler) => handler())
    },
  }
}

test("N subscribers share exactly one resize listener, removed after the last unsubscribes", () => {
  const win = createWindow()
  ;(globalThis as { window?: unknown }).window = win
  try {
    const calls = [0, 0, 0, 0, 0]
    const unsubscribes = calls.map((_, i) => subscribe(() => { calls[i]++ }))

    assert.equal(win.added.length, 1)
    assert.equal(win.active.size, 1)

    win.fireResize()
    assert.deepEqual(calls, [1, 1, 1, 1, 1])

    unsubscribes.slice(0, 4).forEach((unsubscribe) => unsubscribe())
    assert.equal(win.removed.length, 0)
    win.fireResize()
    assert.deepEqual(calls, [1, 1, 1, 1, 2])

    unsubscribes[4]()
    assert.equal(win.removed.length, 1)
    assert.equal(win.removed[0], win.added[0])
    assert.equal(win.active.size, 0)

    // A new subscriber after teardown re-attaches one listener
    const unsubscribe = subscribe(() => {})
    assert.equal(win.added.length, 2)
    unsubscribe()
    assert.equal(win.removed.length, 2)
  } finally {
    delete (globalThis as { window?: unknown }).window
  }
})

test("subscribe is a no-op without window (SSR)", () => {
  assert.equal(typeof (globalThis as { window?: unknown }).window, "undefined")
  const unsubscribe = subscribe(() => {})
  assert.equal(typeof unsubscribe, "function")
  unsubscribe()
})
