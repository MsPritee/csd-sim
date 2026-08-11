/**
 * P2 — Problem validation.
 *
 * Every generated problem must be validated before it is shown to a student
 * (Feature 27): variable count, minterm/maxterm/don't-care ranges, no
 * contradictory inputs, a solvable configuration, a correct expected solution,
 * and a reasonable difficulty classification. No invalid problem is ever shown.
 */

import { createKMap, withValue, minterms, maxterms, type KMapModel } from './model'
import { expressionsEquivalent } from './equivalence'
import type { KMapProblem } from '../../education/practice/types'

export interface ProblemValidation {
  readonly valid: boolean
  readonly issues: readonly string[]
}

function inRange(m: number, total: number): boolean {
  return Number.isInteger(m) && m >= 0 && m < total
}

/** Rebuild the K-map a problem describes, for checks against its expected. */
export function problemModel(problem: KMapProblem): KMapModel {
  let model = createKMap([...problem.variables])
  const total = 2 ** problem.variables.length
  for (let m = 0; m < total; m++) {
    if (problem.dontCares.includes(m)) model = withValue(model, m, 'X')
    else if (problem.minterms.includes(m)) model = withValue(model, m, 1)
    else model = withValue(model, m, 0)
  }
  return model
}

export function validateProblem(problem: KMapProblem): ProblemValidation {
  const issues: string[] = []
  const total = 2 ** problem.variables.length

  if (problem.variableCount !== problem.variables.length) {
    issues.push('variableCount does not match the variable list size.')
  }
  if (problem.variables.length < 2 || problem.variables.length > 4) {
    issues.push('K-map must use 2, 3 or 4 variables.')
  }
  if (problem.difficulty < 1 || problem.difficulty > 5) {
    issues.push('difficulty must be between 1 and 5.')
  }

  for (const m of problem.minterms) if (!inRange(m, total)) issues.push(`minterm ${m} out of range.`)
  for (const m of problem.maxterms) if (!inRange(m, total)) issues.push(`maxterm ${m} out of range.`)
  for (const m of problem.dontCares) if (!inRange(m, total)) issues.push(`don't-care ${m} out of range.`)

  const ones = new Set(problem.minterms)
  const zeros = new Set(problem.maxterms)
  const dc = new Set(problem.dontCares)
  for (const m of ones) if (zeros.has(m)) issues.push(`minterm ${m} is also a maxterm (contradiction).`)
  for (const m of dc) if (ones.has(m)) issues.push(`don't-care ${m} is also a minterm.`)
  for (const m of dc) if (zeros.has(m)) issues.push(`don't-care ${m} is also a maxterm.`)

  if (dc.size + ones.size + zeros.size !== total) {
    issues.push('minterms, maxterms and don\u2019t-cares must partition all cells.')
  }

  const model = problemModel(problem)
  const target =
    problem.mode === 'sop' ? minterms(model) : maxterms(model)
  if (target.length === 0) {
    issues.push('problem has no required cells for its mode (unsolvable).')
  }
  const expectedValue = problem.mode === 'sop' ? problem.expected.sop : problem.expected.pos
  const ok =
    expressionsEquivalent(model, [...problem.variables], problem.mode, expectedValue) &&
    expressionsEquivalent(model, [...problem.variables], 'sop', problem.expected.sop) &&
    expressionsEquivalent(model, [...problem.variables], 'pos', problem.expected.pos)
  if (!ok) {
    issues.push('expected solution is not equivalent to the described K-map.')
  }

  return { valid: issues.length === 0, issues }
}

/** True when the described map's partition covers every cell exactly once. */
export function isPartitioned(minterms: readonly number[], maxterms: readonly number[], dontCares: readonly number[], total: number): boolean {
  const seen = new Set<number>()
  for (const m of minterms) seen.add(m)
  for (const m of maxterms) seen.add(m)
  for (const m of dontCares) seen.add(m)
  if (seen.size !== total) return false
  return [...seen].every((m) => m >= 0 && m < total)
}

/** Verify a freshly generated problem is safe to present. */
export function assertValidProblem(problem: KMapProblem): KMapProblem {
  const result = validateProblem(problem)
  if (!result.valid) {
    throw new Error(`Invalid generated problem: ${result.issues.join(' ')}`)
  }
  return problem
}