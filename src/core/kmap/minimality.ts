/**
 * P2 — Minimality assessment.
 *
 * A logically-correct-but-not-minimal answer should be guided, not marked
 * wrong (Feature 14). This compares the student's term/literal cost with the
 * shared engine's minimal cover and labels the result, alongside equivalence.
 */

import { expressionMetrics } from '../boolean/evaluate'
import { expressionTerms, expressionsEquivalent } from './equivalence'
import type { KMapModel } from './model'
import type { KMapMode } from '../../education/practice/types'

export type MinimalityResult =
  | 'NOT_EQUIVALENT'
  | 'MINIMAL'
  | 'SUBOPTIMAL'

export interface MinimalityReport {
  readonly result: MinimalityResult
  readonly equivalent: boolean
  readonly studentTerms: number
  readonly studentLiterals: number
  readonly expectedTerms: number
  readonly expectedLiterals: number
}

/**
 * Assess the quality of a submitted expression against a K-map's guaranteed
 * minimal form. The `expected` expression strings come from the shared
 * simplification engine (never hard-coded).
 */
export function assessMinimality(
  model: KMapModel,
  variables: readonly string[],
  mode: KMapMode,
  expression: string,
  expected: { readonly sop: string; readonly pos: string },
): MinimalityReport {
  const equivalent = expressionsEquivalent(model, variables, mode, expression)

  const student = expressionMetrics(
    expressionTerms(expression, mode),
    variables,
  )
  const expectedText = mode === 'sop' ? expected.sop : expected.pos
  const expectedMetrics = expressionMetrics(
    expressionTerms(expectedText, mode),
    variables,
  )

  let result: MinimalityResult = 'NOT_EQUIVALENT'
  if (equivalent) {
    result =
      student.terms <= expectedMetrics.terms &&
      student.literals <= expectedMetrics.literals
        ? 'MINIMAL'
        : 'SUBOPTIMAL'
  }

  return {
    result,
    equivalent,
    studentTerms: student.terms,
    studentLiterals: student.literals,
    expectedTerms: expectedMetrics.terms,
    expectedLiterals: expectedMetrics.literals,
  }
}