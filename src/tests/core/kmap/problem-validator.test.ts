import { describe, it, expect } from 'vitest'
import { generateProblem } from '../../../core/kmap/problem-generator'
import { validateProblem } from '../../../core/kmap/problem-validator'
import type { KMapProblem } from '../../../education/practice/types'

function base(): KMapProblem {
  return generateProblem({
    variableCount: 3,
    mode: 'sop',
    difficulty: 1,
    dontCare: 'none',
    concepts: ['adjacency'],
    seed: 'validate',
  })
}

describe('problem-validator', () => {
  it('accepts a valid generated problem', () => {
    expect(validateProblem(base()).valid).toBe(true)
  })

  it('rejects minterms out of range', () => {
    const bad: KMapProblem = { ...base(), minterms: [0, 999] }
    const result = validateProblem(bad)
    expect(result.valid).toBe(false)
    expect(result.issues.some((i) => i.includes('out of range'))).toBe(true)
  })

  it('rejects a conflicting minterm/maxterm', () => {
    const bad: KMapProblem = { ...base(), minterms: [0, 1], maxterms: [0] }
    const result = validateProblem(bad)
    expect(result.valid).toBe(false)
    expect(result.issues.some((i) => i.includes('contradiction'))).toBe(true)
  })

  it('rejects an invalid don\u2019t-care', () => {
    const bad: KMapProblem = { ...base(), dontCares: [-1] }
    expect(validateProblem(bad).valid).toBe(false)
  })

  it('rejects an unsolvable problem (no required cells for mode)', () => {
    const p = base()
    const allZero: KMapProblem = { ...p, minterms: [], maxterms: [0, 1, 2, 3, 4, 5, 6, 7], dontCares: [] }
    expect(validateProblem(allZero).valid).toBe(false)
  })

  it('rejects a problem whose expected solution is wrong', () => {
    const p = base()
    const wrongExpected: KMapProblem = {
      ...p,
      expected: { ...p.expected, sop: 'A', pos: p.expected.pos },
    }
    // "A" will not match the generated map for this problem in general; trust the engine verdict.
    const result = validateProblem(wrongExpected)
    expect(result.valid).toBe(false)
  })
})