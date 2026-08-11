import { describe, it, expect } from 'vitest'
import { createKMap, withValue } from '../../../core/kmap/model'
import { assessMinimality } from '../../../core/kmap/minimality'

// Majority function over A,B,C → minimal AB + AC + BC (3 terms, 6 literals)
function majorityModel() {
  let m = createKMap(['A', 'B', 'C'])
  for (let i = 0; i < 8; i++) m = withValue(m, i, 0)
  for (const i of [3, 5, 6, 7]) m = withValue(m, i, 1)
  return m
}
const model = majorityModel()
const expected = { sop: 'AB + AC + BC', pos: '(A + B)(A + C)(B + C)' }

describe('assessMinimality', () => {
  it('flags a non-equivalent expression', () => {
    const r = assessMinimality(model, ['A', 'B', 'C'], 'sop', 'A', expected)
    expect(r.equivalent).toBe(false)
    expect(r.result).toBe('NOT_EQUIVALENT')
  })

  it('recognises the minimal form', () => {
    const r = assessMinimality(model, ['A', 'B', 'C'], 'sop', 'AB + AC + BC', expected)
    expect(r.equivalent).toBe(true)
    expect(r.result).toBe('MINIMAL')
  })

  it('recognises an equivalent alternative minimal form', () => {
    const r = assessMinimality(model, ['A', 'B', 'C'], 'sop', 'AC + BC + AB', expected)
    expect(r.result).toBe('MINIMAL')
  })

  it('flags a logically-correct but redundant expression as SUBOPTIMAL', () => {
    const r = assessMinimality(model, ['A', 'B', 'C'], 'sop', 'AB + AC + BC + ABC', expected)
    expect(r.equivalent).toBe(true)
    expect(r.result).toBe('SUBOPTIMAL')
    expect(r.studentTerms).toBeGreaterThan(r.expectedTerms)
  })

  it('supports POS', () => {
    const r = assessMinimality(model, ['A', 'B', 'C'], 'pos', '(A + B)(A + C)(B + C)', expected)
    expect(r.equivalent).toBe(true)
    expect(r.result).toBe('MINIMAL')
  })
})