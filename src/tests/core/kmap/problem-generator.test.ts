import { describe, it, expect } from 'vitest'
import { generateProblem, buildProblemModel } from '../../../core/kmap/problem-generator'
import { validateProblem } from '../../../core/kmap/problem-validator'
import type { ProblemSeedConfig } from '../../../education/practice/types'

function cfg(partial: Partial<ProblemSeedConfig>): ProblemSeedConfig {
  return {
    variableCount: 3,
    mode: 'sop',
    difficulty: 1,
    dontCare: 'none',
    concepts: ['adjacency'],
    seed: 'test',
    ...partial,
  }
}

describe('problem-generator', () => {
  it('generates a valid 2-variable problem', () => {
    const p = generateProblem(cfg({ variableCount: 2 }))
    expect(p.variables).toEqual(['A', 'B'])
    expect(p.variableCount).toBe(2)
    expect(validateProblem(p).valid).toBe(true)
  })

  it('generates a valid 3-variable problem', () => {
    const p = generateProblem(cfg({}))
    expect(p.variableCount).toBe(3)
    expect(validateProblem(p).valid).toBe(true)
  })

  it('generates a valid 4-variable problem', () => {
    const p = generateProblem(cfg({ variableCount: 4, difficulty: 3 }))
    expect(p.variableCount).toBe(4)
    expect(validateProblem(p).valid).toBe(true)
  })

  it('generates a valid SOP problem', () => {
    const p = generateProblem(cfg({ mode: 'sop', concepts: ['sop'] }))
    expect(p.mode).toBe('sop')
    expect(p.concepts).toContain('sop')
    expect(validateProblem(p).valid).toBe(true)
  })

  it('generates a valid POS problem', () => {
    const p = generateProblem(cfg({ mode: 'pos', difficulty: 2, concepts: ['pos'] }))
    expect(p.mode).toBe('pos')
    expect(p.concepts).toContain('pos')
    expect(validateProblem(p).valid).toBe(true)
  })

  it('generates a don\u2019t-care problem', () => {
    const p = generateProblem(cfg({ variableCount: 4, difficulty: 3, dontCare: 'optional', concepts: ['don-t-care'] }))
    expect(p.dontCares.length).toBeGreaterThan(0)
    expect(p.concepts).toContain('don-t-care')
    expect(validateProblem(p).valid).toBe(true)
  })

  it('generates a wrap-around problem', () => {
    const p = generateProblem(cfg({ variableCount: 4, difficulty: 3, concepts: ['wrap-around'] }))
    expect(p.concepts).toContain('wrap-around')
    expect(validateProblem(p).valid).toBe(true)
  })

  it('generates an overlapping problem', () => {
    const p = generateProblem(cfg({ variableCount: 4, difficulty: 4, concepts: ['overlap'] }))
    expect(p.concepts).toContain('overlap')
    expect(validateProblem(p).valid).toBe(true)
  })

  it('generates a challenge problem with hard concepts', () => {
    const p = generateProblem(
      cfg({ variableCount: 4, difficulty: 5, dontCare: 'optional', concepts: ['overlap', 'wrap-around', 'minimality'] }),
    )
    expect(p.difficulty).toBe(5)
    expect(validateProblem(p).valid).toBe(true)
  })

  it('is deterministic for the same seed', () => {
    const a = generateProblem(cfg({ seed: 'kmap-3var-wrap-001' }))
    const b = generateProblem(cfg({ seed: 'kmap-3var-wrap-001' }))
    expect(a.id).toBe(b.id)
    expect(a.expected.sop).toBe(b.expected.sop)
    expect(a.expected.pos).toBe(b.expected.pos)
  })

  it('expected solutions are valid for the described map', () => {
    const p = generateProblem(cfg({ variableCount: 4, difficulty: 3 }))
    const model = buildProblemModel(p)
    expect(model.layout.variables.length).toBe(4)
    expect(validateProblem(p).valid).toBe(true)
  })
})