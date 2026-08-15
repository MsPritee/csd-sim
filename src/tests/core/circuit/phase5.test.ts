import { describe, it, expect } from 'vitest'
import {
  addComponent,
  makeGate,
  toCircuit,
  evaluateCircuit,
  netFromBits,
} from '../../../core/circuit'
import type { BitState } from '../../../core/circuit'

function constant(id: string, width: number, value: number) {
  return addComponent(id, 'constant', { width, value })
}

describe('Phase 5 — controlled gates over the net model', () => {
  it('CON_BUF is tri-state: a fully-zeroed control bus floats the output', () => {
    const a = constant('a', 2, 0b01)
    const c = constant('c', 2, 0)
    const g = makeGate('g1', 'CON_BUF', 0, 0)
    const o = addComponent('o', 'output', { label: 'Y' })
    const circ = toCircuit(
      [a, c, g, o],
      [
        { from: 'a:out:0', to: 'g1:in:0' },
        { from: 'c:out:0', to: 'g1:in:1' },
        { from: 'g1:out:0', to: 'o:in:0' },
      ],
    )
    expect(evaluateCircuit(circ).values.get('g1:out:0')).toBeUndefined()
  })

  it('CON_BUF passes data while the control bus is all 1', () => {
    const a = constant('a', 2, 0b01)
    const c = constant('c', 2, 0b11)
    const g = makeGate('g1', 'CON_BUF', 0, 0)
    const circ = toCircuit(
      [a, c, g],
      [
        { from: 'a:out:0', to: 'g1:in:0' },
        { from: 'c:out:0', to: 'g1:in:1' },
      ],
    )
    expect(evaluateCircuit(circ).values.get('g1:out:0')).toEqual(
      netFromBits([1, 0]),
    )
  })

  it('CON_BUF emits high-impedance lanes per column where control is 0/X', () => {
    // data [1,1], control [1,0] -> lane0 control=1 passes 1, lane1 control=0 -> 'X'
    const a = constant('a', 2, 0b11)
    const c = constant('c', 2, 0b01)
    const g = makeGate('g1', 'CON_BUF', 0, 0)
    const circ = toCircuit(
      [a, c, g],
      [
        { from: 'a:out:0', to: 'g1:in:0' },
        { from: 'c:out:0', to: 'g1:in:1' },
      ],
    )
    expect(evaluateCircuit(circ).values.get('g1:out:0')).toEqual(
      netFromBits([1, 'X'] as BitState[]),
    )
  })

  it('CON_INV inverts data while enabled and floats while disabled', () => {
    const a = constant('a', 2, 0b01)
    const on = constant('on', 2, 0b11)
    const off = constant('off', 2, 0)
    const g = makeGate('g1', 'CON_INV', 0, 0)
    const circOn = toCircuit(
      [a, on, g],
      [
        { from: 'a:out:0', to: 'g1:in:0' },
        { from: 'on:out:0', to: 'g1:in:1' },
      ],
    )
    expect(evaluateCircuit(circOn).values.get('g1:out:0')).toEqual(
      netFromBits([0, 1]),
    )
    const circOff = toCircuit(
      [a, off, g],
      [
        { from: 'a:out:0', to: 'g1:in:0' },
        { from: 'off:out:0', to: 'g1:in:1' },
      ],
    )
    expect(evaluateCircuit(circOff).values.get('g1:out:0')).toBeUndefined()
  })
})

describe('Phase 5 — splitter wiring over the net model', () => {
  it('fans a width-8 stem out to two width-4 arms', () => {
    // constant 0b11110000 is LSB-first [0,0,0,0,1,1,1,1]
    const src = constant('src', 8, 0b11110000)
    const sp = addComponent('sp', 'splitter', { width: 8, fanOut: 2 })
    const a = addComponent('a', 'output', { label: 'A' })
    const b = addComponent('b', 'output', { label: 'B' })
    const circ = toCircuit(
      [src, sp, a, b],
      [
        { from: 'src:out:0', to: 'sp:in:0' },
        { from: 'sp:out:1', to: 'a:in:0' },
        { from: 'sp:out:2', to: 'b:in:0' },
      ],
    )
    const r = evaluateCircuit(circ)
    expect(r.values.get('a:in:0')).toEqual(netFromBits([0, 0, 0, 0]))
    expect(r.values.get('b:in:0')).toEqual(netFromBits([1, 1, 1, 1]))
  })

  it('combines driven arms back into the stem (fan-in)', () => {
    // arm A value 0b1010 -> [0,1,0,1]; arm B value 0b0101 -> [1,0,1,0]
    const a = constant('a', 4, 0b1010)
    const b = constant('b', 4, 0b0101)
    const sp = addComponent('sp', 'splitter', { width: 8, fanOut: 2 })
    const o = addComponent('o', 'output', { label: 'Y' })
    const circ = toCircuit(
      [a, b, sp, o],
      [
        { from: 'a:out:0', to: 'sp:in:1' },
        { from: 'b:out:0', to: 'sp:in:2' },
        { from: 'sp:out:0', to: 'o:in:0' },
      ],
    )
    expect(evaluateCircuit(circ).values.get('o:in:0')).toEqual(
      netFromBits([0, 1, 0, 1, 1, 0, 1, 0]),
    )
  })
})

describe('Phase 5 — pull resistor', () => {
  it('passes a driven line through', () => {
    // value 0b1100 -> LSB-first [0,0,1,1]
    const src = constant('src', 4, 0b1100)
    const p = addComponent('p', 'pull', { pull: 1 })
    const o = addComponent('o', 'output', { label: 'Y' })
    const circ = toCircuit(
      [src, p, o],
      [
        { from: 'src:out:0', to: 'p:in:0' },
        { from: 'p:out:0', to: 'o:in:0' },
      ],
    )
    expect(evaluateCircuit(circ).values.get('o:in:0')).toEqual(
      netFromBits([0, 0, 1, 1]),
    )
  })

  it('forces the configured pull value on a floating line', () => {
    const p = addComponent('p', 'pull', { pull: 1 })
    const o = addComponent('o', 'output', { label: 'Y' })
    const circ = toCircuit(
      [p, o],
      [{ from: 'p:out:0', to: 'o:in:0' }],
    )
    expect(evaluateCircuit(circ).values.get('o:in:0')).toEqual(netFromBits([1]))
  })

  it('pull=0 forces a zero level', () => {
    const p = addComponent('p', 'pull', { pull: 0 })
    const o = addComponent('o', 'output', { label: 'Y' })
    const circ = toCircuit(
      [p, o],
      [{ from: 'p:out:0', to: 'o:in:0' }],
    )
    expect(evaluateCircuit(circ).values.get('o:in:0')).toEqual(netFromBits([0]))
  })
})