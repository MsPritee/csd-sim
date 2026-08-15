import { describe, it, expect } from 'vitest'
import { evaluateGate } from '../../../core/gates/evaluate'
import { buildNandOnly, buildNandOnlyFromSop } from '../../../core/gates/universal'
import { inputCombinations } from '../../../core/gates/verify'
import type { Bit } from '../../../core/gates/types'

const AND_TT: readonly Bit[] = [0, 0, 0, 1]
const OR_TT: readonly Bit[] = [0, 1, 1, 1]
const XOR_TT: readonly Bit[] = [0, 1, 1, 0]

/** The majority function: 1 when two or more of A, B, C are 1. */
const MAJORITY_TT: readonly Bit[] = [
  0, 0, 0, 1, 0, 1, 1, 1,
]

const rowIndex = (v: readonly Bit[]): number => {
  let idx = 0
  for (const bit of v) idx = (idx << 1) | bit
  return idx
}

describe('buildNandOnly — validity', () => {
  it('rejects a wrong-sized truth table', () => {
    expect(() => buildNandOnly(['A', 'B'], [0, 0, 0])).toThrow(RangeError)
    expect(() => buildNandOnly(['A'], [0, 1, 1, 0])).toThrow(RangeError)
  })

  it('is equivalent to the input truth table', () => {
    for (const tt of [AND_TT, OR_TT, XOR_TT, MAJORITY_TT]) {
      const variables = tt.length === 8 ? ['A', 'B', 'C'] : ['A', 'B']
      const circuit = buildNandOnly(variables, tt)
      expect(circuit.equivalent).toBe(true)
    }
  })

  it('evaluates to the truth table on every input', () => {
    const circuit = buildNandOnly(['A', 'B', 'C'], MAJORITY_TT)
    for (const vec of inputCombinations(3)) {
      expect(circuit.evaluate(vec)).toBe(MAJORITY_TT[rowIndex(vec)])
    }
  })
})

describe('buildNandOnly — uses only NAND gates', () => {
  it('matches each real gate on every input', () => {
    const circuits = {
      AND: buildNandOnly(['A', 'B'], AND_TT),
      OR: buildNandOnly(['A', 'B'], OR_TT),
      XOR: buildNandOnly(['A', 'B'], XOR_TT),
    }
    for (const vec of inputCombinations(2)) {
      expect(circuits.AND.evaluate(vec)).toBe(evaluateGate('AND', vec))
      expect(circuits.OR.evaluate(vec)).toBe(evaluateGate('OR', vec))
      expect(circuits.XOR.evaluate(vec)).toBe(evaluateGate('XOR', vec))
    }
  })

  it('emits a NAND expression and counts gates', () => {
    const circuit = buildNandOnly(['A', 'B'], AND_TT)
    expect(circuit.expression).toContain('↑')
    expect(circuit.nandCount).toBeGreaterThan(0)
  })
})

describe('buildNandOnly — constants and degenerate cases', () => {
  it('handles the constant-0 function', () => {
    const circuit = buildNandOnly(['A', 'B'], [0, 0, 0, 0])
    expect(circuit.equivalent).toBe(true)
    expect(circuit.nandCount).toBe(0)
    for (const vec of inputCombinations(2)) expect(circuit.evaluate(vec)).toBe(0)
  })

  it('handles the constant-1 function', () => {
    const circuit = buildNandOnly(['A', 'B'], [1, 1, 1, 1])
    expect(circuit.equivalent).toBe(true)
    for (const vec of inputCombinations(2)) expect(circuit.evaluate(vec)).toBe(1)
  })

  it('handles a single ON-set row', () => {
    // Only m5 (101) is 1.
    const tt: readonly Bit[] = [0, 0, 0, 0, 0, 1, 0, 0]
    const circuit = buildNandOnly(['A', 'B', 'C'], tt)
    expect(circuit.equivalent).toBe(true)
    expect(circuit.evaluate([1, 0, 1])).toBe(1)
    expect(circuit.evaluate([0, 0, 0])).toBe(0)
  })
})

describe('buildNandOnlyFromSop', () => {
  it('builds an equivalent circuit from an SOP expression', () => {
    const circuit = buildNandOnlyFromSop(['A', 'B', 'C'], ['AB', 'C'])
    expect(circuit.equivalent).toBe(true)
    expect(circuit.nandCount).toBeGreaterThan(0)
    for (const vec of inputCombinations(3)) {
      expect(circuit.evaluate(vec)).toBe(evaluateGate('OR', [evaluateGate('AND', [vec[0]!, vec[1]!]), vec[2]!]))
    }
  })
})