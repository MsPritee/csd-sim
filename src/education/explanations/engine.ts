import type { Explanation, TransformationStep, VariableChange } from './types'
import { analyzeVariableChanges } from './terms'

export function formatTerms(terms: readonly string[]): string {
  if (terms.length === 0) return '0'
  if (terms.length === 1) return terms[0] ?? ''
  return terms.join(' + ')
}

function spelledJoin(items: readonly string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

/**
 * Builds a full pedagogical explanation for a single transformation step.
 * It answers: what happened? why? which rule? which variables changed /
 * disappeared? and what the student should notice.
 */
export function buildExplanation(step: TransformationStep): Explanation {
  const changes = analyzeVariableChanges(step.before, step.after)
  const beforeText = formatTerms(step.before)
  const afterText = formatTerms(step.after)

  const eliminated = changes
    .filter((c) => c.kind === 'eliminated')
    .map((c) => c.variable)
  const changed = changes.filter((c) => c.kind === 'changed').map((c) => c.variable)

  const notice: string[] = []
  if (eliminated.length > 0) {
    notice.push(
      `${spelledJoin(eliminated)} ${
        eliminated.length === 1 ? 'appears' : 'appear'
      } in both complemented and uncomplemented forms, so ${
        eliminated.length === 1 ? 'it' : 'they'
      } cancel out and disappear from the product term.`,
    )
  }
  if (changed.length > 0) {
    notice.push(`${spelledJoin(changed)} changed state but ${changed.length === 1 ? 'stays' : 'stay'} in the term.`)
  }
  if (notice.length === 0) {
    notice.push('No variables changed in this step.')
  }

  return {
    what: `${beforeText} simplifies to ${afterText}.`,
    why: step.rule.statement,
    rule: step.rule,
    changes,
    notice,
  }
}

export interface ExplanationSummary {
  step: string
  why: string
  ruleId: string
  ruleName: string
  eliminated: string[]
  changed: string[]
  kept: string[]
  notice: string[]
}

export function summarize(explanation: Explanation): ExplanationSummary {
  const byKind = (kind: VariableChange['kind']) =>
    explanation.changes.filter((c) => c.kind === kind).map((c) => c.variable)
  return {
    step: explanation.what,
    why: explanation.why,
    ruleId: explanation.rule.id,
    ruleName: explanation.rule.name,
    eliminated: byKind('eliminated'),
    changed: byKind('changed'),
    kept: byKind('kept'),
    notice: [...explanation.notice],
  }
}