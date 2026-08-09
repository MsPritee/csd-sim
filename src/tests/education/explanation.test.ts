import { describe, expect, it } from 'vitest'
import { analyzeVariableChanges } from '../../education/explanations/terms'
import { buildExplanation, formatTerms } from '../../education/explanations/engine'
import { getRule } from '../../education/explanations/rules'
import type { TransformationStep } from '../../education/explanations/types'

describe('analyzeVariableChanges', () => {
  it('marks a merging variable as eliminated', () => {
    const changes = analyzeVariableChanges(["A'BC", 'ABC'], ['BC'])
    const a = changes.find((c) => c.variable === 'A')
    expect(a?.kind).toBe('eliminated')
  })

  it('marks stable variables as kept', () => {
    const changes = analyzeVariableChanges(["A'BC", 'ABC'], ['BC'])
    expect(changes.find((c) => c.variable === 'B')?.kind).toBe('kept')
    expect(changes.find((c) => c.variable === 'C')?.kind).toBe('kept')
  })

  it('detects polaritity flips', () => {
    const changes = analyzeVariableChanges(["A'B"], ['AB'])
    expect(changes.find((c) => c.variable === 'A')?.kind).toBe('changed')
  })

  it('detects introduced variables', () => {
    const changes = analyzeVariableChanges(['A'], ['AB'])
    expect(changes.find((c) => c.variable === 'B')?.kind).toBe('introduced')
  })

  it('handles variable-free input', () => {
    expect(analyzeVariableChanges([], [])).toEqual([])
  })
})

describe('formatTerms', () => {
  it('renders sums of products', () => {
    expect(formatTerms(["A'BC", 'ABC'])).toBe("A'BC + ABC")
  })

  it('renders zero for an empty list', () => {
    expect(formatTerms([])).toBe('0')
  })
})

describe('buildExplanation', () => {
  const step: TransformationStep = {
    before: ["A'BC", 'ABC'],
    after: ['BC'],
    rule: getRule('COMBINATION'),
  }

  it('explains what happened', () => {
    const explanation = buildExplanation(step)
    expect(explanation.what).toBe("A'BC + ABC simplifies to BC.")
  })

  it('names the rule and its statement', () => {
    const explanation = buildExplanation(step)
    expect(explanation.rule.name).toBe('Combining theorem (adjacency)')
    expect(explanation.why).toContain('differ in exactly one variable')
  })

  it('explains which variable disappeared and why', () => {
    const explanation = buildExplanation(step)
    expect(explanation.changes.find((c) => c.variable === 'A')?.kind).toBe(
      'eliminated',
    )
    expect(explanation.notice.join(' ')).toContain('A appears in both')
    expect(explanation.notice.join(' ')).toContain('disappear')
  })

  it('tells the student which variables stayed', () => {
    const explanation = buildExplanation(step)
    expect(explanation.changes.some((c) => c.variable === 'B' && c.kind === 'kept')).toBe(
      true,
    )
    expect(explanation.changes.some((c) => c.variable === 'C' && c.kind === 'kept')).toBe(
      true,
    )
  })

  it('falls back to a neutral notice when nothing changes', () => {
    const explanation = buildExplanation({ before: ['A'], after: ['A'], rule: getRule('IDENTITY') })
    expect(explanation.notice).toEqual(['No variables changed in this step.'])
  })
})