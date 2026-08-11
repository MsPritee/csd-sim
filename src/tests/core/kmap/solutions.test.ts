import { describe, expect, it } from 'vitest'
import { createKMap, withValue } from '../../../core/kmap'
import { expressionMinterms } from '../../../core/boolean/expression'
import {
  compareSolutions,
  canonicalForms,
  analyzeExpression,
  costOfExpression,
  absorptionReason,
  recordHistory,
  historyComment,
  type HistoryEntry,
} from '../../../core/kmap/solutions'

function modelFor(ones: readonly number[]) {
  let m = createKMap(['A', 'B', 'C'])
  for (const o of ones) m = withValue(m, o, 1)
  return m
}

const EXPECTED_ABC = { sop: "A' + C", pos: "A(C' + B')(A' + C)" }
void EXPECTED_ABC

describe('P3 equivalence — alternative/reordered expressions', () => {
  it('accepts reordered SOP terms', () => {
    const cmp = compareSolutions(['A', 'B', 'C'], 'sop', "A' + C", "C + A'")
    expect(cmp.equivalent).toBe(true)
  })

  it('rejects non-equivalent expressions', () => {
    const cmp = compareSolutions(['A', 'B', 'C'], 'sop', "A' + C", 'A + C')
    expect(cmp.equivalent).toBe(false)
  })

  it('recognises an alternative minimal expression as equivalent and equal-cost', () => {
    // Σm(0,1,2,3,5,7): A'+C and C+A' both minimal
    const cmp = compareSolutions(['A', 'B', 'C'], 'sop', "A' + C", "C + A'")
    expect(cmp.verdict).toMatch(/same number of literals/)
  })
})

describe('P3 analyseExpression — minimality & redundancy', () => {
  it('flags a redundant term using absorption', () => {
    const model = modelFor([0, 1, 2, 3])
    const q = analyzeExpression(model, ['A', 'B', 'C'], 'sop', "A' + A'C", { sop: "A'", pos: 'A' })
    expect(q.valid).toBe(true)
    expect(q.equivalent).toBe(true)
    expect(q.minimal).toBe(false)
    expect(q.redundantTerms).toContain("A'C")
  })

  it('accepts a minimal solution', () => {
    const model = modelFor([0, 1, 2, 3, 5, 7])
    const q = analyzeExpression(model, ['A', 'B', 'C'], 'sop', "A' + C", { sop: "A' + C", pos: '' })
    expect(q.equivalent).toBe(true)
    expect(q.minimal).toBe(true)
    expect(q.redundantTerms).toEqual([])
  })

  it('explains absorption in words', () => {
    expect(absorptionReason("A'", "A'C")).toMatch(/absorbed/)
  })
})

describe('P3 canonical vs minimal', () => {
  it('builds canonical SOP with one term per combination and a simpler form', () => {
    const forms = canonicalForms(['A', 'B', 'C'], new Set([0, 1, 2, 3, 5, 7]), new Set([4, 6]), new Set())
    expect(forms.canonicalSop).toContain('A\'B\'C\'')
    expect(forms.canonicalSop.split(' + ').length).toBe(6)
    // The simplified form (from the existing engine) must use fewer terms
    // than the canonical form and remain equivalent to the ON-set.
    expect(forms.simplifiedSop.split(' + ').length).toBeLessThan(6)
    expect(expressionMinterms(forms.simplifiedSop, ['A', 'B', 'C'])).toEqual([0, 1, 2, 3, 5, 7])
  })
})

describe('P3 cost analysis', () => {
  it('counts terms and literals (not treated as hardware cost)', () => {
    const c = costOfExpression("A'B + BC", 'sop')
    expect(c.terms).toBe(2)
    expect(c.literals).toBe(4)
    expect(c.estimatedGates).toBeGreaterThanOrEqual(c.literals)
  })

  it('reports a lower cost for the simpler form', () => {
    const expensive = costOfExpression("A'B + A'BC", 'sop')
    const cheap = costOfExpression("A'B", 'sop')
    expect(cheap.literals).toBeLessThan(expensive.literals)
  })

  it('handles constant (0 / 1) expressions without throwing', () => {
    expect(costOfExpression('0', 'sop')).toMatchObject({ terms: 0, literals: 0 })
    expect(costOfExpression('1', 'sop')).toMatchObject({ terms: 1, literals: 0 })
  })
})

describe('P3 solution history (session-only)', () => {
  it('records and compares attempts', () => {
    let history: readonly HistoryEntry[] = []
    history = recordHistory(history, { id: 1, expression: "A'B + A'BC", mode: 'sop', terms: 2, literals: 5, timestamp: 1 })
    history = recordHistory(history, { id: 2, expression: "A'B", mode: 'sop', terms: 1, literals: 2, timestamp: 2 })
    expect(history).toHaveLength(2)
    expect(historyComment(history[0]!, history[1]!)).toMatch(/simpler/)
  })
})