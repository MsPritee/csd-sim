import { describe, it, expect } from 'vitest'
import { GATE_DEFINITIONS, getGate } from '../../../core/gates/catalog'
import type { GateType } from '../../../core/gates/types'

describe('gate catalog', () => {
  it('contains exactly the canonical gate set', () => {
    const ids = GATE_DEFINITIONS.map((g) => g.id).sort()
    expect(ids).toEqual(
      ['BUFFER', 'NOT', 'AND', 'NAND', 'OR', 'NOR', 'XOR', 'XNOR', 'CON_BUF', 'CON_INV', 'ODD_PARITY', 'EVEN_PARITY'].sort(),
    )
  })

  it('has unique ids', () => {
    expect(new Set(GATE_DEFINITIONS.map((g) => g.id)).size).toBe(GATE_DEFINITIONS.length)
  })

  it('getGate returns the same instance from the catalog', () => {
    for (const gate of GATE_DEFINITIONS) {
      expect(getGate(gate.id)).toBe(gate)
    }
  })

  it('throws on unknown ids', () => {
    expect(() => getGate('MYSTERY' as GateType)).toThrow(RangeError)
  })
})

describe('arity metadata', () => {
  it('unary gates accept exactly one input', () => {
    for (const id of ['BUFFER', 'NOT'] as const) {
      expect(getGate(id).minInputs).toBe(1)
      expect(getGate(id).maxInputs).toBe(1)
    }
  })

  it('binary gates accept two or more inputs', () => {
    for (const id of ['AND', 'NAND', 'OR', 'NOR', 'XOR', 'XNOR'] as const) {
      expect(getGate(id).minInputs).toBe(2)
      expect(getGate(id).maxInputs).toBeGreaterThanOrEqual(2)
    }
  })

  it('parity gates accept two or more inputs', () => {
    for (const id of ['ODD_PARITY', 'EVEN_PARITY'] as const) {
      expect(getGate(id).minInputs).toBe(2)
      expect(getGate(id).maxInputs).toBeGreaterThanOrEqual(2)
    }
  })

  it('controlled gates accept data plus control', () => {
    for (const id of ['CON_BUF', 'CON_INV'] as const) {
      expect(getGate(id).minInputs).toBe(2)
      expect(getGate(id).maxInputs).toBe(2)
    }
  })
})

describe('complementary pairs', () => {
  const pairs: ReadonlyArray<readonly [GateType, GateType]> = [
    ['BUFFER', 'NOT'],
    ['AND', 'NAND'],
    ['OR', 'NOR'],
    ['XOR', 'XNOR'],
    ['CON_BUF', 'CON_INV'],
    ['ODD_PARITY', 'EVEN_PARITY'],
  ]

  it.each(pairs)('%s and %s point at each other', (a, b) => {
    expect(getGate(a).complementaryOf).toBe(b)
    expect(getGate(b).complementaryOf).toBe(a)
  })
})

describe('algebraic metadata', () => {
  it('marks commutative gates', () => {
    for (const id of ['AND', 'NAND', 'OR', 'NOR', 'XOR', 'XNOR'] as const) {
      expect(getGate(id).commutative).toBe(true)
    }
    expect(getGate('BUFFER').commutative).toBe(false)
    expect(getGate('NOT').commutative).toBe(false)
  })

  it('records the identity element for AND and OR', () => {
    expect(getGate('AND').identity).toBe(1)
    expect(getGate('OR').identity).toBe(0)
    expect(getGate('XOR').identity).toBe(0)
    expect(getGate('BUFFER').identity).toBe(0)
  })

  it('every definition carries teaching metadata', () => {
    for (const gate of GATE_DEFINITIONS) {
      expect(gate.name.length).toBeGreaterThan(0)
      expect(gate.symbol.length).toBeGreaterThan(0)
      expect(gate.booleanExpression).toContain('Y =')
      expect(gate.description.length).toBeGreaterThan(10)
    }
  })
})
