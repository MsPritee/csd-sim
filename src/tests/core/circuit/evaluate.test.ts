import { describe, expect, it } from 'vitest'
import {
  evaluateCircuit,
  makeCircuit,
  findConflicts,
  bitValue,
  packedValue,
} from '../../../core/circuit'
import type { Circuit, CircuitLibrary } from '../../../core/circuit'
import { addComponent, makeGate, toCircuit } from '../../../core/circuit'

describe('evaluateCircuit', () => {
  it('evaluates a simple AND with two forced inputs', () => {
    const and = makeGate('g1', 'AND', 0, 0, { inputs: 2 })
    const a = addComponent('a', 'input', { label: 'A' })
    const b = addComponent('b', 'input', { label: 'B' })
    const out = addComponent('o', 'output', { label: 'Y' })
    const circ = toCircuit(
      [and, a, b, out],
      [
        { from: 'a:out:0', to: 'g1:in:0' },
        { from: 'b:out:0', to: 'g1:in:1' },
        { from: 'g1:out:0', to: 'o:in:0' },
      ],
    )
    const r = evaluateCircuit(circ, { a: 1, b: 1 })
    expect(bitValue(r.values.get('g1:out:0'))).toBe(1)
    expect(bitValue(r.values.get('o:in:0'))).toBe(1)
  })

  it('AND outputs 0 when any input is 0', () => {
    const and = makeGate('g1', 'AND', 0, 0, { inputs: 2 })
    const a = addComponent('a', 'input', { label: 'A' })
    const b = addComponent('b', 'input', { label: 'B' })
    const circ = toCircuit(
      [and, a, b],
      [
        { from: 'a:out:0', to: 'g1:in:0' },
        { from: 'b:out:0', to: 'g1:in:1' },
      ],
    )
    expect(bitValue(evaluateCircuit(circ, { a: 1, b: 0 }).values.get('g1:out:0'))).toBe(0)
    expect(bitValue(evaluateCircuit(circ, { a: 0, b: 1 }).values.get('g1:out:0'))).toBe(0)
    expect(bitValue(evaluateCircuit(circ, { a: 0, b: 0 }).values.get('g1:out:0'))).toBe(0)
  })

  it('NAND inverts AND', () => {
    const nand = makeGate('g1', 'NAND', 0, 0, { inputs: 2 })
    const a = addComponent('a', 'input', { label: 'A' })
    const b = addComponent('b', 'input', { label: 'B' })
    const circ = toCircuit(
      [nand, a, b],
      [
        { from: 'a:out:0', to: 'g1:in:0' },
        { from: 'b:out:0', to: 'g1:in:1' },
      ],
    )
    expect(bitValue(evaluateCircuit(circ, { a: 1, b: 1 }).values.get('g1:out:0'))).toBe(0)
    expect(bitValue(evaluateCircuit(circ, { a: 1, b: 0 }).values.get('g1:out:0'))).toBe(1)
  })

  it('NOT inverts a single input', () => {
    const not = makeGate('g1', 'NOT', 0, 0)
    const a = addComponent('a', 'input', { label: 'A' })
    const circ = toCircuit([not, a], [{ from: 'a:out:0', to: 'g1:in:0' }])
    expect(bitValue(evaluateCircuit(circ, { a: 1 }).values.get('g1:out:0'))).toBe(0)
    expect(bitValue(evaluateCircuit(circ, { a: 0 }).values.get('g1:out:0'))).toBe(1)
  })

  it('supports fan-out: one output drives two gates', () => {
    const a = addComponent('a', 'input', { label: 'A' })
    const and1 = makeGate('and1', 'AND', 0, 0, { inputs: 2 })
    const and2 = makeGate('and2', 'AND', 0, 0, { inputs: 2 })
    const circ = toCircuit(
      [a, and1, and2],
      [
        { from: 'a:out:0', to: 'and1:in:0' },
        { from: 'a:out:0', to: 'and2:in:0' },
      ],
    )
    const r = evaluateCircuit(circ, { a: 1 })
    // each gate still has an unconnected second input => floating
    expect(r.values.get('and1:out:0')).toBeUndefined()
    expect(r.values.get('and2:out:0')).toBeUndefined()
  })

  it('XOR outputs 1 for odd parity', () => {
    const xor = makeGate('g1', 'XOR', 0, 0, { inputs: 2 })
    const a = addComponent('a', 'input', { label: 'A' })
    const b = addComponent('b', 'input', { label: 'B' })
    const circ = toCircuit(
      [xor, a, b],
      [
        { from: 'a:out:0', to: 'g1:in:0' },
        { from: 'b:out:0', to: 'g1:in:1' },
      ],
    )
    expect(bitValue(evaluateCircuit(circ, { a: 1, b: 0 }).values.get('g1:out:0'))).toBe(1)
    expect(bitValue(evaluateCircuit(circ, { a: 1, b: 1 }).values.get('g1:out:0'))).toBe(0)
  })

  it('floating gate stays undefined (not silently 0)', () => {
    const or = makeGate('g1', 'OR', 0, 0, { inputs: 2 })
    const a = addComponent('a', 'input', { label: 'A' })
    const circ = toCircuit([or, a], [{ from: 'a:out:0', to: 'g1:in:0' }])
    // missing second input => floating regardless of A
    expect(evaluateCircuit(circ, { a: 1 }).values.get('g1:out:0')).toBeUndefined()
  })

  it('defaults unforced inputs to 0', () => {
    const and = makeGate('g1', 'AND', 0, 0, { inputs: 2 })
    const a = addComponent('a', 'input', { label: 'A' })
    const b = addComponent('b', 'input', { label: 'B' })
    const circ = toCircuit(
      [and, a, b],
      [
        { from: 'a:out:0', to: 'g1:in:0' },
        { from: 'b:out:0', to: 'g1:in:1' },
      ],
    )
    // no inputs forced => both 0 => AND = 0
    expect(bitValue(evaluateCircuit(circ).values.get('g1:out:0'))).toBe(0)
  })

  it('detects combinational oscillation (NOT fed back to itself)', () => {
    const not = makeGate('g1', 'NOT', 0, 0)
    const circ = toCircuit([not], [{ from: 'g1:out:0', to: 'g1:in:0' }])
    const r = evaluateCircuit(circ)
    expect(r.oscillating).toBe(true)
    expect(r.oscillatingPorts).toContain('g1:out:0')
  })

  it('evaluates one gate deep through wired intermediate', () => {
    // A AND (A OR B) = A
    const a = addComponent('a', 'input', { label: 'A' })
    const b = addComponent('b', 'input', { label: 'B' })
    const or = makeGate('or', 'OR', 0, 0, { inputs: 2 })
    const and = makeGate('and', 'AND', 0, 0, { inputs: 2 })
    const circ = toCircuit(
      [a, b, or, and],
      [
        { from: 'a:out:0', to: 'or:in:0' },
        { from: 'b:out:0', to: 'or:in:1' },
        { from: 'a:out:0', to: 'and:in:0' },
        { from: 'or:out:0', to: 'and:in:1' },
      ],
    )
    const r = evaluateCircuit(circ, { a: 1, b: 0 })
    expect(bitValue(r.values.get('or:out:0'))).toBe(1)
    expect(bitValue(r.values.get('and:out:0'))).toBe(1)
  })

  it('applies a multi-bit AND elementwise across a width-2 bus', () => {
    const and = makeGate('g1', 'AND', 0, 0, { inputs: 2 })
    const a = addComponent('a', 'input', { label: 'A', width: 2 })
    const b = addComponent('b', 'input', { label: 'B', width: 2 })
    const circ = toCircuit(
      [and, a, b],
      [
        { from: 'a:out:0', to: 'g1:in:0' },
        { from: 'b:out:0', to: 'g1:in:1' },
      ],
    )
    // forced bits broadcast: a = 11, b = 11 => 11; a = 11, b = 00 => 00
    expect(packedValue(evaluateCircuit(circ, { a: 1, b: 1 }).values.get('g1:out:0'))).toBe(0b11)
    expect(packedValue(evaluateCircuit(circ, { a: 1, b: 0 }).values.get('g1:out:0'))).toBe(0)
    // a = 01 would be driven per-lane only through a packed value; broadcast keeps parity
    expect(packedValue(evaluateCircuit(circ, { a: 0, b: 0 }).values.get('g1:out:0'))).toBe(0)
  })

  it('flags a width mismatch between gate inputs as an error net', () => {
    const and = makeGate('g1', 'AND', 0, 0, { inputs: 2 })
    const a = addComponent('a', 'input', { label: 'A' })
    const b = addComponent('b', 'input', { label: 'B', width: 2 })
    const circ = toCircuit(
      [and, a, b],
      [
        { from: 'a:out:0', to: 'g1:in:0' },
        { from: 'b:out:0', to: 'g1:in:1' },
      ],
    )
    const r = evaluateCircuit(circ, { a: 1, b: 1 })
    expect(r.values.get('g1:out:0')).toBe('E')
  })
})

describe('subcircuits', () => {
  function library(circ: Circuit, arity: [number, number]): CircuitLibrary {
    return {
      arity: () => arity,
      get: () => circ,
    }
  }

  it('evaluates a subcircuit using its internal gates', () => {
    // inner: inputs ai,bi -> AND -> output yi
    const ai = addComponent('ai', 'input', { label: 'A' })
    const bi = addComponent('bi', 'input', { label: 'B' })
    const andi = makeGate('andi', 'AND', 0, 0, { inputs: 2 })
    const oi = addComponent('oi', 'output', { label: 'Y' })
    const inner = toCircuit(
      [ai, bi, andi, oi],
      [
        { from: 'ai:out:0', to: 'andi:in:0' },
        { from: 'bi:out:0', to: 'andi:in:1' },
        { from: 'andi:out:0', to: 'oi:in:0' },
      ],
    )
    const lib = library(inner, [2, 1])

    const sub = addComponent('sub', 'subcircuit', { libraryId: 'and2' }, 0, 0)
    const a = addComponent('a', 'input', { label: 'A' })
    const b = addComponent('b', 'input', { label: 'B' })
    const outer = toCircuit(
      [sub, a, b],
      [
        { from: 'a:out:0', to: 'sub:in:0' },
        { from: 'b:out:0', to: 'sub:in:1' },
      ],
    )
    const r = evaluateCircuit(outer, { a: 1, b: 1 }, lib)
    expect(bitValue(r.values.get('sub:out:0'))).toBe(1)

    const r2 = evaluateCircuit(outer, { a: 1, b: 0 }, lib)
    expect(bitValue(r2.values.get('sub:out:0'))).toBe(0)
  })

  it('subcircuit with no library evaluates floating', () => {
    const sub = addComponent('sub', 'subcircuit', { libraryId: 'missing' }, 0, 0)
    const circ = makeCircuit([sub])
    const r = evaluateCircuit(circ)
    expect(r.values.get('sub:out:0')).toBeUndefined()
  })
})

describe('findConflicts', () => {
  it('flags multiple wires driving one port', () => {
    const a = addComponent('a', 'input', { label: 'A' })
    const b = addComponent('b', 'input', { label: 'B' })
    const and = makeGate('g1', 'AND', 0, 0, { inputs: 2 })
    const circ = {
      components: [a, b, and],
      wires: [
        { id: 'w0', from: 'a:out:0', to: 'g1:in:0' },
        { id: 'w1', from: 'b:out:0', to: 'g1:in:0' },
      ],
    }
    const issues = findConflicts(circ)
    expect(issues.length).toBe(1)
    expect(issues[0]!.message).toContain('g1:in:0')
  })
})