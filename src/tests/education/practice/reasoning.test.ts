import { describe, it, expect } from 'vitest'
import { generateProblem, buildProblemModel } from '../../../core/kmap/problem-generator'
import { evaluateGroups, evaluateExpression } from '../../../education/practice/reasoning'
import type { KMapProblem } from '../../../education/practice/types'

function problem(): KMapProblem {
  return generateProblem({
    variableCount: 3,
    mode: 'sop',
    difficulty: 2,
    dontCare: 'none',
    concepts: ['adjacency', 'coverage', 'minimality'],
    seed: 'reasoning',
  })
}

describe('evaluateGroups', () => {
  it('accepts a correct, covering, minimal solution', () => {
    const p = problem()
    const model = buildProblemModel(p)
    const correct = p.expected.sopGroups
    const r = evaluateGroups(model, p, correct, false)
    expect(r.equivalent).toBe(true)
    expect(r.coversRequired).toBe(true)
    expect(r.minimal).toBe(true)
    expect(r.groupsValid).toBe(true)
    expect(r.mistakes).toEqual([])
    expect(r.score).toBe(100)
  })

  it('detects an invalid group', () => {
    const p = problem()
    const model = buildProblemModel(p)
    const r = evaluateGroups(model, p, [[0, 7]], false)
    expect(r.groupsValid).toBe(false)
    expect(r.mistakes.length).toBeGreaterThan(0)
    expect(r.score).toBeLessThan(100)
  })

  it('awards partial credit for a redundant extra group', () => {
    const p = problem()
    const model = buildProblemModel(p)
    const correct = p.expected.sopGroups
    const redundant = [...correct, [...correct[0]!]]
    const r = evaluateGroups(model, p, redundant, false)
    expect(r.equivalent).toBe(true)
    expect(r.minimal).toBe(false)
    expect(r.mistakes.some((m) => m.category === 'MINIMALITY')).toBe(true)
    expect(r.score).toBe(90)
  })

  it('records hint usage', () => {
    const p = problem()
    const model = buildProblemModel(p)
    const correct = p.expected.sopGroups
    expect(evaluateGroups(model, p, correct, false).usedHints).toBe(false)
    expect(evaluateGroups(model, p, correct, true).usedHints).toBe(true)
  })

  it('reports uncovered required cells', () => {
    const p = problem()
    const model = buildProblemModel(p)
    const r = evaluateGroups(model, p, [p.expected.sopGroups[0] ?? [0]], false)
    expect(r.coversRequired).toBe(false)
  })
})

describe('evaluateExpression', () => {
  it('accepts an equivalent minimal expression', () => {
    const p = problem()
    const model = buildProblemModel(p)
    const r = evaluateExpression(model, p, p.expected.sop, false)
    expect(r.equivalent).toBe(true)
    expect(r.minimal).toBe(true)
    expect(r.score).toBe(100)
    expect(r.mistakes).toEqual([])
  })

  it('accepts an equivalent alternative', () => {
    const p = problem()
    const model = buildProblemModel(p)
    // Reorder terms — still equivalent by truth table.
    const reordered = expressionVariants(p.expected.sop)
    const r = evaluateExpression(model, p, reordered, false)
    expect(r.equivalent).toBe(true)
  })

  it('flags a suboptimal equivalent expression', () => {
    const p = problem()
    const model = buildProblemModel(p)
    const r = evaluateExpression(model, p, `${p.expected.sop} + ${p.expected.sop.split(' ')[0] ?? 'ABC'}`, false)
    expect(r.equivalent).toBe(true)
    expect(r.minimal).toBe(false)
  })

  it('flags a non-equivalent expression', () => {
    const p = problem()
    const model = buildProblemModel(p)
    const r = evaluateExpression(model, p, 'A', false)
    expect(r.equivalent).toBe(false)
    expect(r.score).toBe(0)
  })
})

function expressionVariants(expr: string): string {
  const terms = expr.split(' + ')
  return [...terms].reverse().join(' + ')
}