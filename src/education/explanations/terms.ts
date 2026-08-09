import type { VariableChange, VariableChangeKind } from './types'

interface Literal {
  readonly name: string
  readonly negated: boolean
}

const LITERAL_RE = /([A-Za-z])(\u2032|'|!)?/g

function parseLiterals(term: string): Literal[] {
  const literals: Literal[] = []
  for (const match of term.matchAll(LITERAL_RE)) {
    literals.push({ name: match[1].toUpperCase(), negated: match[2] !== undefined })
  }
  return literals
}

export function getVariables(terms: readonly string[]): string[] {
  const vars = new Set<string>()
  for (const term of terms) {
    for (const literal of parseLiterals(term)) vars.add(literal.name)
  }
  return [...vars].sort()
}

export function termVariables(term: string): string[] {
  return parseLiterals(term).map((l) => l.name)
}

interface PolarityState {
  present: boolean
  polarities: Set<boolean>
  current: boolean | null
}

/** Collects the polarities a variable takes across the terms of one side. */
function analyzePolarity(terms: readonly string[], variable: string): PolarityState {
  const polarities = new Set<boolean>()
  let current: boolean | null = null
  for (const term of terms) {
    for (const lit of parseLiterals(term)) {
      if (lit.name === variable) {
        polarities.add(lit.negated)
        current = lit.negated
      }
    }
  }
  return { present: polarities.size > 0, polarities, current }
}

/**
 * Compares the variable polarities between the `before` and `after` sides of
 * a transformation:
 * - `eliminated` — present on both sides; on the before side it appears in
 *   both polarities, so it is a merging candidate and drops out of the term.
 * - `changed` — present before and after, but its polarity flipped.
 * - `kept`   — present before and after with the same polarity.
 * - `introduced` — new on the after side.
 */
export function analyzeVariableChanges(
  before: readonly string[],
  after: readonly string[],
): VariableChange[] {
  const variables = [...new Set([...getVariables(before), ...getVariables(after)])].sort()
  const changes: VariableChange[] = []

  for (const variable of variables) {
    const beforeState = analyzePolarity(before, variable)
    const afterState = analyzePolarity(after, variable)

    let kind: VariableChangeKind
    if (!beforeState.present && afterState.present) {
      kind = 'introduced'
    } else if (beforeState.present && !afterState.present) {
      kind = beforeState.polarities.size === 2 ? 'eliminated' : 'changed'
    } else if (beforeState.polarities.size === 2) {
      kind = 'eliminated'
    } else if (afterState.current !== null && beforeState.current === afterState.current) {
      kind = 'kept'
    } else {
      kind = 'changed'
    }
    changes.push({ variable, kind })
  }
  return changes
}