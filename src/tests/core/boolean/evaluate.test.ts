import { describe, it, expect } from 'vitest'
import type { CellValue } from '../../../core/kmap/model'
import {
  truthTableFromSop,
  truthTableFromPos,
  compareTruthTables,
  expressionMetrics,
} from '../../../core/boolean/evaluate'

describe('truthTableFromSop', () => {
  it('evaluates a simple AND (AB)', () => {
    expect(truthTableFromSop(['A', 'B'], ['AB'])).toEqual([0, 0, 0, 1])
  })

  it('evaluates XOR (A\'B + AB\')', () => {
    const tt = truthTableFromSop(['A', 'B'], ["A'B", "AB'"])
    expect(tt).toEqual([0, 1, 1, 0])
  })

  it('handles don\'t-care-safe variable ordering (3 vars)', () => {
    // m0 (000), m1 (001) => A'B'C
    const tt = truthTableFromSop(['A', 'B', 'C'], ["A'B'C"])
    expect(tt[0]).toBe(0)
    expect(tt[1]).toBe(1)
    expect(tt[2]).toBe(0)
  })
})

describe('truthTableFromPos', () => {
  it('evaluates A+B (0 only at m0)', () => {
    const tt = truthTableFromPos(['A', 'B'], ['A + B'])
    expect(tt).toEqual([0, 1, 1, 1])
  })

  it('evaluates a POS majority-style maxterm', () => {
    // Maxterm (A + B) with 2 vars -> 0 only at 00.
    const tt = truthTableFromPos(['A', 'B'], ['(A + B)'])
    expect(tt).toEqual([0, 1, 1, 1])
  })
})

describe('compareTruthTables', () => {
  it('reports equal truth tables', () => {
    const tt: CellValue[] = [0, 1, 1, 0]
    const c = compareTruthTables(tt, truthTableFromSop(['A', 'B'], ["A'B", "AB'"]))
    expect(c.equal).toBe(true)
    expect(c.differences).toEqual([])
  })

  it('detects a mismatch and reports the exact row', () => {
    const c = compareTruthTables([0, 0, 0, 1] as CellValue[], [1, 0, 0, 1])
    expect(c.equal).toBe(false)
    expect(c.differences).toHaveLength(1)
    expect(c.differences[0]).toMatchObject({ minterm: 0, bits: '00', original: 0, simplified: 1 })
  })

  it('treats don\'t-care rows as matching anything', () => {
    // original has X at m1 -> never reported as a difference even though simplified is 1
    const original: CellValue[] = [0, 'X', 0, 1]
    const c = compareTruthTables(original, [0, 1, 0, 1])
    expect(c.equal).toBe(true)
  })
})

describe('expressionMetrics', () => {
  it('counts terms, literals and variables', () => {
    const m = expressionMetrics(["A'BC", 'ABC'], ['A', 'B', 'C'])
    expect(m.terms).toBe(2)
    expect(m.literals).toBe(6)
    expect(m.variables).toBe(3)
  })
})