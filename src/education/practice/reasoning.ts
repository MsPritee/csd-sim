/**
 * P2 — Reasoning evaluation (Feature 8, 12, 13, 19).
 *
 * Evaluates the student's REASONING, not just the final Boolean string:
 * - are the submitted groups structurally valid?
 * - do they cover every required cell?
 * - are they mathematically equivalent to the map?
 * - are they minimal, with no redundant groups?
 * - is an alternative-but-equivalent expression accepted?
 *
 * It composes the existing core engines (`verifySolution`, `assessMinimality`,
 * `expressionsEquivalent`) and the P2 misconception classifiers. It does NOT
 * re-implement any K-map math.
 */

import type {
  KMapProblem,
  PracticeEvaluation,
  MistakeDetail,
  ConceptId,
  MistakeCategory,
  GroupCheck,
} from './types'
import {
  verifySolution,
  DEFAULT_VERIFICATION_OPTIONS,
  minterms,
  maxterms,
  type KMapModel,
} from '../../core/kmap'
import { assessMinimality } from '../../core/kmap/minimality'
import { expressionsEquivalent } from '../../core/kmap/equivalence'
import { classifyGroup, classifyMinimality } from './misconceptions'

function categoryToConcept(c: MistakeCategory, mode: 'sop' | 'pos'): ConceptId {
  switch (c) {
    case 'CELL_IDENTIFICATION':
    case 'MINTERM_MAXTERM_CONFUSION':
      return 'cell-identification'
    case 'ADJACENCY':
    case 'GROUP_SHAPE':
      return 'adjacency'
    case 'GROUP_SIZE':
      return 'group-size'
    case 'WRAP_AROUND':
      return 'wrap-around'
    case 'OVERLAP':
      return 'overlap'
    case 'DONT_CARE':
      return 'don-t-care'
    case 'COVERAGE':
      return 'coverage'
    case 'VARIABLE_ELIMINATION':
      return 'variable-elimination'
    case 'COMPLEMENTATION':
      return 'minterms'
    case 'SOP_POS_CONFUSION':
      return mode === 'sop' ? 'sop' : 'pos'
    case 'MINIMALITY':
      return 'minimality'
  }
}

/** Required cells (for the mode) that lie outside the union of the groups. */
function uncovered(model: KMapModel, mode: 'sop' | 'pos', groups: readonly (readonly number[])[]): number[] {
  const covered = new Set<number>()
  for (const g of groups) for (const c of g) covered.add(c)
  const required = mode === 'sop' ? minterms(model) : maxterms(model)
  return required.filter((m) => !covered.has(m)).sort((a, b) => a - b)
}

/** Evaluate a student's submitted GROUPINGS (Guided / Independent before submit). */
export function evaluateGroups(
  model: KMapModel,
  problem: KMapProblem,
  groups: readonly (readonly number[])[],
  usedHints: boolean,
): PracticeEvaluation {
  const mutableGroups = groups.map((g) => [...g])
  const verification = verifySolution(model, mutableGroups, DEFAULT_VERIFICATION_OPTIONS)

  const groupChecks: GroupCheck[] = mutableGroups.map((g) => {
    const single = verifySolution(model, [g], DEFAULT_VERIFICATION_OPTIONS)
    return {
      group: [...g],
      valid: single.valid,
      coversRequired: single.coversRequiredCells,
      isMinimal: single.isMinimal,
      term: '',
    }
  })

  const mistakes: MistakeDetail[] = []
  for (const g of groups) {
    mistakes.push(...classifyGroup(model, problem.mode, g, false))
  }

  const missing = uncovered(model, problem.mode, groups)
  if (!verification.coversRequiredCells && missing.length > 0) {
    mistakes.push({
      category: 'COVERAGE',
      happened: `Not every required cell is inside a selected group. Missing: ${missing.slice(0, 4).join(', ')}.`,
      why: `Every required cell (the 1s for SOP, the 0s for POS) must be covered by at least one group.`,
      correctConcept: 'Coverage: each required cell belongs to some group.',
      tryAgain: `Add or extend a group to cover the uncovered cell${missing.length === 1 ? '' : 's'}.`,
    })
  }
  if (!verification.isMinimal) {
    mistakes.push({
      category: 'MINIMALITY',
      happened: 'One or more of your groups is redundant.',
      why: 'A redundant group only covers cells already covered by other groups, so it adds nothing and can be removed.',
      correctConcept: 'The minimal cover needs each group to cover at least one cell that no other group covers.',
      tryAgain: 'Remove any group whose cells are already fully covered by the others.',
    })
  }

  const deduped = deduplicate(mistakes)
  const score =
    (verification.valid ? 25 : 0) +
    (verification.coversRequiredCells ? 30 : 0) +
    (verification.equivalent ? 35 : 0) +
    (verification.isMinimal ? 10 : 0)

  return {
    score,
    groupsValid: verification.valid,
    coversRequired: verification.coversRequiredCells,
    equivalent: verification.equivalent,
    minimal: verification.isMinimal,
    groupChecks,
    mistakes: deduped,
    feedback: [...verification.feedback],
    masterySignals: masteryFor(problem, verification.equivalent, verification.coversRequiredCells, deduped, usedHints),
    usedHints,
  }
}

/** Evaluate a student's final EXPRESSION (Independent / Challenge submit). */
export function evaluateExpression(
  model: KMapModel,
  problem: KMapProblem,
  expression: string,
  usedHints: boolean,
): PracticeEvaluation {
  const equivalent = expressionsEquivalent(model, [...problem.variables], problem.mode, expression)
  const report = assessMinimality(model, [...problem.variables], problem.mode, expression, problem.expected)
  const minimal = report.result === 'MINIMAL'

  const mistakes = equivalent && minimal ? [] : classifyMinimality(report)
  const score = (equivalent ? 60 : 0) + (equivalent && minimal ? 40 : 0)

  const feedback: string[] = []
  if (equivalent && minimal) feedback.push('✓ Correct — your expression is equivalent and minimal.')
  else if (equivalent) feedback.push('Your expression is logically correct, but it is not minimal.')
  else feedback.push('Your expression is not equivalent to the K-map.')

  return {
    score,
    groupsValid: equivalent,
    coversRequired: equivalent,
    equivalent,
    minimal,
    groupChecks: [],
    mistakes,
    feedback,
    masterySignals: masteryFor(problem, equivalent, equivalent, mistakes, usedHints),
    usedHints,
  }
}

/* --------------------------- helpers --------------------------- */
function deduplicate(mistakes: MistakeDetail[]): MistakeDetail[] {
  const seen = new Set<string>()
  const out: MistakeDetail[] = []
  for (const m of mistakes) {
    const key = `${m.category}:${m.happened}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(m)
  }
  return out
}

function masteryFor(
  problem: KMapProblem,
  equivalent: boolean,
  covers: boolean,
  mistakes: MistakeDetail[],
  usedHints: boolean,
): ConceptId[] {
  const signals = new Set<ConceptId>()
  if (equivalent && covers) {
    for (const c of problem.concepts) signals.add(c)
  } else {
    for (const m of mistakes) signals.add(categoryToConcept(m.category, problem.mode))
  }
  void usedHints
  return [...signals]
}