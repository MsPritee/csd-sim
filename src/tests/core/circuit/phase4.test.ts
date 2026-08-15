import { describe, expect, it } from 'vitest'
import {
  addComponent,
  toCircuit,
  evaluateCircuit,
  propagate,
  tick,
  packedValue,
  emptyState,
} from '../../../core/circuit'
import type { NetValue, SimState } from '../../../core/circuit'

const w = (from: string, to: string) => ({ from, to })

/** Read the value arriving at an output pin’s input row. */
function readOut(r: { values: ReadonlyMap<string, NetValue> }, outId: string): NetValue {
  return (r.values.get(`${outId}:in:0`) as NetValue) ?? undefined
}

describe('Phase 4 — Wiring library', () => {
  it('constant drives its configured bus value', () => {
    const c = addComponent('c', 'constant', { width: 8, value: 0x2a })
    const out = addComponent('o', 'output', { width: 8 })
    const r = evaluateCircuit(toCircuit([c, out], [w('c:out:0', 'o:in:0')]))
    expect(packedValue(readOut(r, 'o'))).toBe(0x2a)
  })

  it('tunnel relays its input to its output', () => {
    const inPin = addComponent('i', 'input', { width: 8 })
    const t = addComponent('t', 'tunnel', { label: 'bus' })
    const out = addComponent('o', 'output', { width: 8 })
    const r = evaluateCircuit(
      toCircuit([inPin, t, out], [w('i:out:0', 't:in:0'), w('t:out:0', 'o:in:0')]),
      { i: 1 },
    )
    expect(packedValue(readOut(r, 'o'))).toBe(0xff)
  })

  it('probe and led act as pure sinks without outputs', () => {
    const inPin = addComponent('i', 'input')
    const probe = addComponent('p', 'probe', { label: 'P' })
    const led = addComponent('l', 'led', { label: 'L' })
    const r = evaluateCircuit(
      toCircuit([inPin, probe, led], [w('i:out:0', 'p:in:0'), w('i:out:0', 'l:in:0')]),
      { i: 1 },
    )
    expect(r.oscillating).toBe(false)
  })
})

describe('Phase 4 — IO library', () => {
  it('button drives a multi-bit all-ones/zeros bus', () => {
    const b = addComponent('b', 'button', { width: 8, label: 'B' })
    const out = addComponent('o', 'output', { width: 8 })
    const r = evaluateCircuit(toCircuit([b, out], [w('b:out:0', 'o:in:0')]), { b: 1 })
    expect(packedValue(readOut(r, 'o'))).toBe(0xff)
  })

  it('7-segment display accepts an 8-bit input and renders nothing back', () => {
    const inPin = addComponent('i', 'input', { width: 8 })
    const seg = addComponent('s', 'segment', { label: 'D' })
    const r = evaluateCircuit(toCircuit([inPin, seg], [w('i:out:0', 's:in:0')]), { i: 1 })
    expect(r.oscillating).toBe(false)
  })
})

describe('Phase 4 — Arithmetic library', () => {
  function bus(id: string, value: number, width = 8) {
    return addComponent(id, 'constant', { width, value })
  }

  it('adder sums constants and reports carry-out', () => {
    const a = bus('a', 0xff)
    const b = bus('b', 0x01)
    const adder = addComponent('add', 'adder', { width: 8 })
    const sum = addComponent('sum', 'output', { width: 8 })
    const cout = addComponent('co', 'output')
    const r = evaluateCircuit(
      toCircuit(
        [a, b, adder, sum, cout],
        [w('a:out:0', 'add:in:0'), w('b:out:0', 'add:in:1'), w('add:out:0', 'sum:in:0'), w('add:out:1', 'co:in:0')],
      ),
    )
    expect(packedValue(readOut(r, 'sum'))).toBe(0x00)
    expect(packedValue(readOut(r, 'co'))).toBe(1)
  })

  it('subtractor computes A - B with borrow', () => {
    const a = bus('a', 0x02)
    const b = bus('b', 0x12)
    const sub = addComponent('sub', 'subtractor', { width: 8 })
    const diff = addComponent('d', 'output', { width: 8 })
    const bout = addComponent('bo', 'output')
    const r = evaluateCircuit(
      toCircuit(
        [a, b, sub, diff, bout],
        [w('a:out:0', 'sub:in:0'), w('b:out:0', 'sub:in:1'), w('sub:out:0', 'd:in:0'), w('sub:out:1', 'bo:in:0')],
      ),
    )
    expect(packedValue(readOut(r, 'd'))).toBe(0xf0)
    expect(packedValue(readOut(r, 'bo'))).toBe(1)
  })

  it('comparator emits gt / eq / lt', () => {
    const a = bus('a', 7)
    const b = bus('b', 7)
    const cmp = addComponent('cmp', 'comparator', { width: 8 })
    const gt = addComponent('gt', 'output')
    const eq = addComponent('eq', 'output')
    const lt = addComponent('lt', 'output')
    const r = evaluateCircuit(
      toCircuit(
        [a, b, cmp, gt, eq, lt],
        [
          w('a:out:0', 'cmp:in:0'),
          w('b:out:0', 'cmp:in:1'),
          w('cmp:out:0', 'gt:in:0'),
          w('cmp:out:1', 'eq:in:0'),
          w('cmp:out:2', 'lt:in:0'),
        ],
      ),
    )
    expect(packedValue(readOut(r, 'gt'))).toBe(0)
    expect(packedValue(readOut(r, 'eq'))).toBe(1)
    expect(packedValue(readOut(r, 'lt'))).toBe(0)
  })

  it('negator emits two’s-complement negation', () => {
    const a = bus('a', 5)
    const neg = addComponent('n', 'negator', { width: 8 })
    const out = addComponent('o', 'output', { width: 8 })
    const r = evaluateCircuit(toCircuit([a, neg, out], [w('a:out:0', 'n:in:0'), w('n:out:0', 'o:in:0')]))
    expect(packedValue(readOut(r, 'o'))).toBe(0xfb)
  })

  it('floats a floating arithmetic input', () => {
    const a = bus('a', 5)
    const add = addComponent('add', 'adder', { width: 8 })
    const sum = addComponent('sum', 'output', { width: 8 })
    // b input left unwired -> floating propagates floating (no error)
    const r = evaluateCircuit(toCircuit([a, add, sum], [w('a:out:0', 'add:in:0'), w('add:out:0', 'sum:in:0')]))
    expect(readOut(r, 'sum')).toBeUndefined()
  })
})

describe('Phase 4 — clock end-to-end', () => {
  it('ticks a free-running clock and captures into a D flip-flop', () => {
    const clk = addComponent('clk', 'clock')
    const d = addComponent('d', 'constant', { width: 1, value: 1 })
    const ff = addComponent('ff', 'dff')
    const q = addComponent('q', 'output')
    const circ = toCircuit(
      [clk, d, ff, q],
      [w('d:out:0', 'ff:in:0'), w('clk:out:0', 'ff:in:1'), w('ff:out:0', 'q:in:0')],
    )

    let s: SimState = emptyState()
    const sample = () => packedValue(readOut(propagate(circ, {}, s), 'q'))

    expect(sample()).toBe(0)

    // tick 1: clock rises 0 -> 1, captures D = 1
    let t = tick(circ, {}, s)
    s = t.nextState
    expect(sample()).toBe(1)

    // tick 2: clock falls, Q holds
    t = tick(circ, {}, s)
    s = t.nextState
    expect(sample()).toBe(1)

    // tick 3: clock rises again, still captures 1
    t = tick(circ, {}, s)
    s = t.nextState
    expect(sample()).toBe(1)
  })
})