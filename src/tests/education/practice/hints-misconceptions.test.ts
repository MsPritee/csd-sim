import { describe, it, expect } from 'vitest'
import { generateProblem } from '../../../core/kmap/problem-generator'
import { hintsForProblem, hintAtLevel, availableHints } from '../../../education/practice/hints'
import { classifyGroup, classifyMinimality } from '../../../education/practice/misconceptions'
import { similarProblemConfig } from '../../../education/practice/mastery'
import { buildProblemModel } from '../../../core/kmap/problem-generator'
import { createKMap, withValue } from '../../../core/kmap/model'
import { assessMinimality } from '../../../core/kmap/minimality'

describe('progressive hints', () => {
  const p = generateProblem({ variableCount: 4, difficulty: 4, mode: 'sop', dontCare: 'none', concepts: ['wrap-around', 'overlap'], seed: 'h' })

  it('provides five escalating hint levels', () => {
    const hints = hintsForProblem(p)
    expect(hints).toHaveLength(5)
    expect(hints[0]!.kind).toBe('concept')
    expect(hints[4]!.kind).toBe('solution-reasoning')
  })

  it('hint level is clamped to the ladder', () => {
    expect(hintAtLevel(p, 0).level).toBe(1)
    expect(hintAtLevel(p, 9).level).toBe(5)
  })

  it('does not reveal the answer in the hints', () => {
    for (const h of hintsForProblem(p)) {
      expect(h.text).not.toContain(p.expected.sop)
      expect(h.text).not.toContain(p.expected.pos)
    }
  })

  it('caps available hints at the problem allowance', () => {
    expect(availableHints(p, 0).length).toBeLessThanOrEqual(p.allowedHints)
  })
})

describe('mistake classification', () => {
  const p = generateProblem({ variableCount: 3, mode: 'sop', difficulty: 1, dontCare: 'none', concepts: ['adjacency'], seed: 'm' })
  const model = buildProblemModel(p)

  it('classifies a diagonal group as an adjacency mistake', () => {
    const mistakes = classifyGroup(model, 'sop', [0, 5])
    expect(mistakes.some((m) => m.category === 'ADJACENCY' || m.category === 'GROUP_SHAPE')).toBe(true)
  })

  it('classifies a wrong-size group', () => {
    const mistakes = classifyGroup(model, 'sop', [0, 1, 2])
    expect(mistakes.some((m) => m.category === 'GROUP_SIZE')).toBe(true)
  })

  it('classifies a non-minimal expression as MINIMALITY', () => {
    let mm = createKMap(['A', 'B', 'C'])
    for (let i = 0; i < 8; i++) mm = withValue(mm, i, 0)
    for (const i of [3, 5, 6, 7]) mm = withValue(mm, i, 1)
    const report = assessMinimality(mm, ['A', 'B', 'C'], 'sop', 'AB + AC + BC + ABC', { sop: 'AB + AC + BC', pos: '(A + B)(A + C)(B + C)' })
    const mistakes = classifyMinimality(report)
    expect(mistakes.some((m) => m.category === 'MINIMALITY')).toBe(true)
  })
})

describe('similar problem', () => {
  it('generates a config with the same primary concept', () => {
    const p = generateProblem({ variableCount: 4, difficulty: 3, mode: 'sop', dontCare: 'none', concepts: ['wrap-around'], seed: 's' })
    const config = similarProblemConfig(p, 'retry')
    expect(config.concepts).toContain(p.concepts[0])
    expect(config.variableCount).toBe(p.variableCount)
    expect(config.mode).toBe(p.mode)
    expect(config.seed).toContain('similar')
  })
})