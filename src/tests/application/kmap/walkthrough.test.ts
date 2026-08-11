import { describe, it, expect } from 'vitest'
import { createKMap, withValue } from '../../../core/kmap'
import { groupWraps } from '../../../core/kmap/group-reasoning'
import { generateWalkthrough } from '../../../application/kmap'

function twoVar(values: Record<number, 0 | 1 | 'X'>) {
  let m = createKMap(['a', 'b'])
  for (const [k, v] of Object.entries(values)) {
    m = withValue(m, Number(k), v)
  }
  return m
}

function threeVar(values: Record<number, 0 | 1 | 'X'>) {
  let m = createKMap(['a', 'b', 'c'])
  for (const [k, v] of Object.entries(values)) {
    m = withValue(m, Number(k), v)
  }
  return m
}

describe('generateWalkthrough', () => {
  it('produces a final SOP expression matching the engine', () => {
    // Full diamond: all 1s -> output always 1
    const model = twoVar({ 0: 1, 1: 1, 2: 1, 3: 1 })
    const solution = generateWalkthrough(model, 'sop')
    expect(solution.steps[0].type).toBe('understand')
    expect(solution.steps.some((s) => s.type === 'final')).toBe(true)
    expect(solution.finalExpression).toBeDefined()
    expect(solution.verification?.equivalent ?? false).toBe(true)
    expect(solution.steps.at(-1)!.type).toBe('verify')
  })

  it('builds a variable-comparison step with constant/changed classification', () => {
    // Pair: m0 (000→a=0,row) and m2 (010) -> for 2-var a is row bit, so a changes
    // Let's use a 3-var pair where only one variable changes and it is clear.
    // Row/col in 3-var: m0 (000) and m2 (010) -> b=MSB? Use m4(100) & m6(110): only a=0
    const model = threeVar({ 0: 1, 4: 1, 2: 0, 6: 0 })
    const solution = generateWalkthrough(model, 'sop')
    const compare = solution.steps.find((s) => s.type === 'variable-comparison')!
    expect(compare.variableAnalysis).toBeDefined()
    expect(solution.groups.length).toBeGreaterThanOrEqual(1)
    // constant and changed partition the variables, and a stays at 0 for that pair
    const analysis = compare.variableAnalysis!
    expect(analysis.changed).toContain('a')
    expect(analysis.constant).toContainEqual({ name: 'b', value: 0 })
  })

  it('supports POS generation', () => {
    const model = twoVar({ 0: 0, 1: 0, 2: 1, 3: 1 })
    const solution = generateWalkthrough(model, 'pos')
    expect(solution.mode).toBe('pos')
    expect(solution.steps.some((s) => s.type === 'candidate-groups')).toBe(true)
  })

  it('handles don\'t-care cells without crashing', () => {
    const model = twoVar({ 0: 1, 1: 1, 2: 'X', 3: 0 })
    const solution = generateWalkthrough(model, 'sop')
    expect(solution.steps.length).toBeGreaterThan(0)
    expect(solution.groups.length).toBeGreaterThanOrEqual(1)
  })

  it('uses product text for SOP group terms', () => {
    const model = twoVar({ 0: 1, 1: 1, 2: 1, 3: 1 })
    const solution = generateWalkthrough(model, 'sop')
    // single whole-map group term
    expect([...new Set(solution.terms)]).toEqual(['1'])
  })
})

describe('groupWraps', () => {
  it('detects wrap-around groups across the seam', () => {
    // m0 (000) and m2 (010) are the two ends of the top row in gray-code order -> wrap seam
    const model = threeVar({ 0: 1, 2: 1 })
    expect(groupWraps(model, [0, 2])).toBe(true)
  })

  it('returns false for contiguous groups', () => {
    const model = twoVar({ 0: 1, 1: 1, 2: 1, 3: 1 })
    expect(groupWraps(model, [0, 1])).toBe(false)
  })
})