import { describe, it, expect } from 'vitest'
import { createKMap, withValue, type KMapModel } from '../../../core/kmap/model'
import { expressionsEquivalent, expressionTerms } from '../../../core/kmap/equivalence'

function makeModel(values: Record<number, 0 | 1 | 'X'>, variables = ['A', 'B', 'C']): KMapModel {
  let m = createKMap(variables)
  const total = 2 ** variables.length
  for (let i = 0; i < total; i++) m = withValue(m, i, 0)
  for (const [k, v] of Object.entries(values)) m = withValue(m, Number(k), v)
  return m
}

// Majority function over A,B,C → AB + AC + BC
const majority = makeModel({ 3: 1, 5: 1, 6: 1, 7: 1 })

describe('expressionsEquivalent', () => {
  it('accepts the same expression', () => {
    expect(expressionsEquivalent(majority, ['A', 'B', 'C'], 'sop', 'AB + AC + BC')).toBe(true)
  })

  it('accepts reordered terms', () => {
    expect(expressionsEquivalent(majority, ['A', 'B', 'C'], 'sop', 'AC + BC + AB')).toBe(true)
  })

  it('accepts reordered literals within a term', () => {
    expect(expressionsEquivalent(majority, ['A', 'B', 'C'], 'sop', 'BA + CA + CB')).toBe(true)
  })

  it('accepts an equivalent alternative grouping', () => {
    expect(expressionsEquivalent(majority, ['A', 'B', 'C'], 'sop', 'AB + BC + AC')).toBe(true)
    expect(expressionsEquivalent(majority, ['A', 'B', 'C'], 'pos', '(A + B)(A + C)(B + C)')).toBe(true)
  })

  it('rejects a non-equivalent expression', () => {
    expect(expressionsEquivalent(majority, ['A', 'B', 'C'], 'sop', 'A')).toBe(false)
    expect(expressionsEquivalent(majority, ['A', 'B', 'C'], 'sop', 'AB + AC')).toBe(false)
  })

  it('treats constant expressions correctly', () => {
    const allOnes = makeModel({ 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1 })
    expect(expressionsEquivalent(allOnes, ['A', 'B', 'C'], 'sop', '1')).toBe(true)
  })

  it('ignores don\u2019t-cares as wildcards', () => {
    // Output is 1 for m0,m1,m3, and X for m2 → the function is simply A'.
    const withDc = makeModel({ 0: 1, 1: 1, 2: 'X', 3: 1 })
    expect(expressionsEquivalent(withDc, ['A', 'B', 'C'], 'sop', "A'")).toBe(true)
  })
})

describe('expressionTerms', () => {
  it('splits SOP into product terms', () => {
    expect(expressionTerms('AB + AC', 'sop')).toEqual(['AB', 'AC'])
  })
  it('splits POS into sum terms', () => {
    // Whitespace is removed so the pieces are compact, but still parseable.
    expect(expressionTerms('(A + B)(A\u2032 + C)', 'pos')).toEqual(['A+B', "A\u2032+C"])
  })
})