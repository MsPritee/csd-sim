/**
 * P2 — Progressive hint system (Feature 10).
 *
 * Hints never reveal the answer immediately. They escalate in strength from a
 * concept reminder to direction, a stronger nudge, the reasoning step, and only
 * the final hint approaches the solution. Hints are generated per-problem from
 * its facts (mode, group sizes), not canned text for a small bank.
 */

import type { KMapProblem } from './types'

export interface Hint {
  readonly level: 1 | 2 | 3 | 4 | 5
  readonly kind: 'concept' | 'direction' | 'stronger' | 'reasoning' | 'solution-reasoning'
  readonly text: string
}

/** The largest expected group size for the problem's mode. */
function largestGroupSize(problem: KMapProblem): number {
  const groups = problem.mode === 'sop' ? problem.expected.sopGroups : problem.expected.posGroups
  let max = 0
  for (const g of groups) if (g.length > max) max = g.length
  return max
}

export function hintsForProblem(problem: KMapProblem): readonly Hint[] {
  const ones = problem.mode === 'sop'
  const target = ones ? '1' : '0'
  const largest = largestGroupSize(problem)

  const hints: Hint[] = [
    {
      level: 1,
      kind: 'concept',
      text: `What are you trying to cover? For ${problem.mode.toUpperCase()}, find every cell that holds a ${target}.`,
    },
    {
      level: 2,
      kind: 'direction',
      text: 'Look for adjacent cells — neighbours that differ in only one variable — and try to form small groups first.',
    },
    {
      level: 3,
      kind: 'stronger',
      text:
        largest >= 2
          ? `Can these ${target}s (${largest >= 4 ? 'or even more' : 'a pair'}) be combined into a single larger group?`
          : 'Does a single cell already form a necessary group?',
    },
    {
      level: 4,
      kind: 'reasoning',
      text: 'Compare the variables across one group: the ones that stay constant will appear in the term, the ones that flip will be eliminated.',
    },
    {
      level: 5,
      kind: 'solution-reasoning',
      text: `Almost there — a variable that changes inside a group is eliminated, and the constant variables form the term (complement ${ones ? 'the ones that are 0' : 'the ones that are 1'}). Combine every group term with ${ones ? 'OR (+)' : 'AND (\u00b7)'}.`,
    },
  ]
  return hints
}

export function hintAtLevel(problem: KMapProblem, level: number): Hint {
  const hints = hintsForProblem(problem)
  const idx = Math.min(Math.max(1, level), 5)
  return hints[idx - 1]!
}

/** How far the student has progressed up the hint ladder (0 = none used). */
export function hintLevelUsed(hintsUsed: number): number {
  return Math.min(hintsUsed, 5)
}

/** Ready-to-show hint list, capped at the problem's allowance. */
export function availableHints(problem: KMapProblem, hintsUsed: number): readonly Hint[] {
  const all = hintsForProblem(problem)
  return all.slice(hintsUsed, Math.max(hintsUsed, problem.allowedHints))
}