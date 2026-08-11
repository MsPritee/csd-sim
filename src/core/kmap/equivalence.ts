/**
 * P2 — Boolean equivalence evaluation.
 *
 * Correctness is decided by TRUTH-TABLE EQUIVALENCE, never by string equality.
 * This reuses the existing `boolean/evaluate` truth-table builders
 * (`truthTableFromSop` / `truthTableFromPos`) and the model truth-table
 * exporter, so an alternative-but-equivalent grouping is accepted and there is
 * no single "answer string" validation (Feature 28).
 */

import { truthTableFromSop, truthTableFromPos, compareTruthTables } from '../boolean/evaluate'
import { kmapToTruthTable, type KMapModel } from './truth-table'
import type { KMapMode } from '../../education/practice/types'

/** Evaluate a student expression string into a 0/1 output row for each row. */
export function expressionTruthTable(
  variables: readonly string[],
  mode: KMapMode,
  expression: string,
): number[] {
  const total = 2 ** variables.length
  const trimmed = expression.trim()
  if (trimmed === '0' || trimmed === '1') {
    return Array(total).fill(trimmed === '1' ? 1 : 0)
  }

  if (mode === 'sop') {
    const terms = trimmed
      .split('+')
      .map((s) => s.trim())
      .filter(Boolean)
    return truthTableFromSop(variables, terms)
  }

  // POS: e.g. "(A + B)(A' + C)" → split on ')(' boundaries, strip outer parens.
  const norm = trimmed.replace(/\s+/g, '')
  const body = norm.replace(/^\(+/, '').replace(/\)+$/, '')
  const sums = body.split(')(').filter(Boolean)
  return truthTableFromPos(variables, sums)
}

/**
 * True when the student's expression produces the same output row as the
 * K-map for every input (don't-cares are treated as wildcards).
 */
export function expressionsEquivalent(
  model: KMapModel,
  variables: readonly string[],
  mode: KMapMode,
  expression: string,
): boolean {
  const original = kmapToTruthTable(model).outputs
  const simplified = expressionTruthTable(variables, mode, expression)
  return compareTruthTables(original, simplified).equal
}

/** Split an expression into its prime-term strings (SOP or POS). */
export function expressionTerms(
  expression: string,
  mode: KMapMode,
): readonly string[] {
  const trimmed = expression.trim()
  if (mode === 'pos') {
    const norm = trimmed.replace(/\s+/g, '')
    const body = norm.replace(/^\(+/, '').replace(/\)+$/, '')
    return body.split(')(').filter(Boolean)
  }
  return trimmed.split('+').map((s) => s.trim()).filter(Boolean)
}