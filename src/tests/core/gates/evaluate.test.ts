import { describe, it, expect } from 'vitest'
import { evaluateGate, evaluateAllInputs, generateTruthTable } from '../../../core/gates/evaluate'
import type { Bit, GateType } from '../../../core/gates/types'

const ALL_TYPES: readonly GateType[] = [
  'BUFFER',
  'NOT',
  'AND',
  'NAND',
  'OR',
  'NOR',
  'XOR',
  'XNOR',
  'CON_BUF',
  'CON_INV',
  'ODD_PARITY',
  'EVEN_PARITY',
]

describe('evaluateGate — unary gates', () => {
  it('BUFFER passes the input through', () => {
    expect(evaluateGate('BUFFER', [0])).toBe(0)
    expect(evaluateGate('BUFFER', [1])).toBe(1)
  })

  it('NOT inverts the input', () => {
    expect(evaluateGate('NOT', [0])).toBe(1)
    expect(evaluateGate('NOT', [1])).toBe(0)
  })
})

describe('evaluateGate — 2-input gates', () => {
  const cases: ReadonlyArray<[GateType, readonly Bit[], Bit]> = [
    // AND
    ['AND', [0, 0], 0],
    ['AND', [0, 1], 0],
    ['AND', [1, 0], 0],
    ['AND', [1, 1], 1],
    // NAND
    ['NAND', [0, 0], 1],
    ['NAND', [0, 1], 1],
    ['NAND', [1, 0], 1],
    ['NAND', [1, 1], 0],
    // OR
    ['OR', [0, 0], 0],
    ['OR', [0, 1], 1],
    ['OR', [1, 0], 1],
    ['OR', [1, 1], 1],
    // NOR
    ['NOR', [0, 0], 1],
    ['NOR', [0, 1], 0],
    ['NOR', [1, 0], 0],
    ['NOR', [1, 1], 0],
    // XOR
    ['XOR', [0, 0], 0],
    ['XOR', [0, 1], 1],
    ['XOR', [1, 0], 1],
    ['XOR', [1, 1], 0],
    // XNOR
    ['XNOR', [0, 0], 1],
    ['XNOR', [0, 1], 0],
    ['XNOR', [1, 0], 0],
    ['XNOR', [1, 1], 1],
  ]

  it.each(cases)('%s(%s) = %s', (gate, inputs, expected) => {
    expect(evaluateGate(gate, inputs)).toBe(expected)
  })
})

describe('evaluateGate — n-ary XOR is odd parity', () => {
  it('handles 3 inputs', () => {
    expect(evaluateGate('XOR', [0, 0, 0])).toBe(0)
    expect(evaluateGate('XOR', [1, 0, 0])).toBe(1)
    expect(evaluateGate('XOR', [1, 1, 0])).toBe(0)
    expect(evaluateGate('XOR', [1, 1, 1])).toBe(1)
  })

  it('AND and OR stay associative over 4 inputs', () => {
    expect(evaluateGate('AND', [1, 1, 1, 1])).toBe(1)
    expect(evaluateGate('AND', [1, 1, 0, 1])).toBe(0)
    expect(evaluateGate('OR', [0, 0, 0, 0])).toBe(0)
    expect(evaluateGate('OR', [0, 0, 0, 1])).toBe(1)
  })
})

describe('evaluateGate — arity validation', () => {
  it('rejects too few inputs', () => {
    expect(() => evaluateGate('AND', [])).toThrow(RangeError)
    expect(() => evaluateGate('AND', [1])).toThrow(RangeError)
  })

  it('rejects too many inputs', () => {
    expect(() => evaluateGate('NOT', [0, 1])).toThrow(RangeError)
    expect(() => evaluateGate('AND', Array(33).fill(1))).toThrow(RangeError)
  })

  it('rejects a controlled gate with more than two inputs', () => {
    expect(() => evaluateGate('CON_BUF', [1, 1, 1])).toThrow(RangeError)
  })
})

describe('evaluateGate — parity gates', () => {
  it('ODD_PARITY is 1 for an odd number of ones', () => {
    expect(evaluateGate('ODD_PARITY', [0, 0])).toBe(0)
    expect(evaluateGate('ODD_PARITY', [1, 0])).toBe(1)
    expect(evaluateGate('ODD_PARITY', [1, 1])).toBe(0)
    expect(evaluateGate('ODD_PARITY', [1, 1, 1])).toBe(1)
  })

  it('EVEN_PARITY is 1 for an even number of ones', () => {
    expect(evaluateGate('EVEN_PARITY', [0, 0])).toBe(1)
    expect(evaluateGate('EVEN_PARITY', [1, 0])).toBe(0)
    expect(evaluateGate('EVEN_PARITY', [1, 1])).toBe(1)
    expect(evaluateGate('EVEN_PARITY', [1, 1, 1])).toBe(0)
  })
})

describe('evaluateGate — controlled gates (bit model)', () => {
  it('CON_BUF passes data through while enabled and outputs 0 while disabled', () => {
    expect(evaluateGate('CON_BUF', [1, 1])).toBe(1)
    expect(evaluateGate('CON_BUF', [0, 1])).toBe(0)
    expect(evaluateGate('CON_BUF', [1, 0])).toBe(0)
  })

  it('CON_INV inverts data while enabled and outputs 0 while disabled', () => {
    expect(evaluateGate('CON_INV', [1, 1])).toBe(0)
    expect(evaluateGate('CON_INV', [0, 1])).toBe(1)
    expect(evaluateGate('CON_INV', [1, 0])).toBe(0)
  })
})

describe('evaluateAllInputs', () => {
  it('evaluates every gate over the same inputs', () => {
    const result = evaluateAllInputs([1, 0])
    expect(result).toEqual({
      BUFFER: 1,
      NOT: 0,
      AND: 0,
      NAND: 1,
      OR: 1,
      NOR: 0,
      XOR: 1,
      XNOR: 0,
      CON_BUF: 1,
      CON_INV: 0,
      ODD_PARITY: 1,
      EVEN_PARITY: 0,
    })
  })

  it('covers exactly the canonical gate set', () => {
    expect(Object.keys(evaluateAllInputs([0, 0])).sort()).toEqual([...ALL_TYPES].sort())
  })
})

describe('generateTruthTable', () => {
  it('NOT produces two rows', () => {
    expect(generateTruthTable('NOT', 1)).toEqual([
      [0, 1],
      [1, 0],
    ])
  })

  it('AND produces the canonical four rows', () => {
    expect(generateTruthTable('AND', 2)).toEqual([
      [0, 0, 0],
      [0, 1, 0],
      [1, 0, 0],
      [1, 1, 1],
    ])
  })

  it('XOR over 3 inputs has 8 rows and odd parity output', () => {
    const table = generateTruthTable('XOR', 3)
    expect(table).toHaveLength(8)
    const outputs = table.map((row) => row[3])
    expect(outputs).toEqual([0, 1, 1, 0, 1, 0, 0, 1])
  })

  it('output column matches evaluateGate on every row', () => {
    for (const gate of ALL_TYPES) {
      const inputCount = gate === 'BUFFER' || gate === 'NOT' ? 1 : 2
      for (const row of generateTruthTable(gate, inputCount)) {
        const inputs = row.slice(0, -1)
        expect(evaluateGate(gate, inputs)).toBe(row[row.length - 1])
      }
    }
  })

  it('rejects unsupported input counts', () => {
    expect(() => generateTruthTable('AND', 1)).toThrow(RangeError)
    expect(() => generateTruthTable('NOT', 2)).toThrow(RangeError)
  })
})
