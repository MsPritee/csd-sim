/**
 * P2 — Mistake classification (Feature 9).
 *
 * Maps validated facts about a submitted group or expression to the P2 mistake
 * taxonomy, producing the WHAT / WHY / CORRECT CONCEPT / TRY AGAIN structure.
 * It uses the results of the shared core engines (`validateGroup`,
 * `validateSopGroup`, coverage, minimality) — it does NOT re-derive K-map math.
 */

import type { MistakeCategory, MistakeDetail, KMapMode } from './types'
import { validateGroup, validateSopGroup, uncoveredRequired, type KMapModel } from '../../core/kmap'
import { assessMinimality } from '../../core/kmap/minimality'

function detail(
  category: MistakeCategory,
  happened: string,
  why: string,
  correctConcept: string,
  tryAgain: string,
): MistakeDetail {
  return { category, happened, why, correctConcept, tryAgain }
}

/**
 * Classify a single submitted group's validity issues into mistakes.
 * `group` has already been structurally validated; we describe each failing
 * issue educationally.
 */
export function classifyGroup(
  kmap: KMapModel,
  mode: KMapMode,
  group: readonly number[],
  checkCoverage = true,
): MistakeDetail[] {
  const cells = [...new Set(group)]
  const out: MistakeDetail[] = []
  const desired = mode === 'sop' ? 1 : 0

  const structural = validateGroup(kmap, cells)
  if (structural.issues.some((i) => i.kind === 'not-power-of-two')) {
    out.push(
      detail(
        'GROUP_SIZE',
        `You selected a group of ${cells.length} cells.`,
        'A valid K-map group must contain a power of two: 1, 2, 4, 8 or 16 cells.',
        'Group sizes are powers of two.',
        'Select a group of 1, 2, 4, 8 or 16 cells.',
      ),
    )
  }
  if (structural.issues.some((i) => i.kind === 'non-rectangular')) {
    out.push(
      detail(
        'GROUP_SHAPE',
        'This set of cells is not a rectangle.',
        'Valid groups must form a rectangle (including wrap-around edges) with power-of-two sides.',
        'Groups are rectangular blocks of adjacent cells.',
        'Select cells that form a neat rectangle.',
      ),
    )
  }
  if (structural.issues.some((i) => i.kind === 'non-adjacent')) {
    out.push(
      detail(
        'ADJACENCY',
        'Some of these cells are not adjacent.',
        'Adjacent K-map cells differ in exactly one variable; diagonal or far-apart cells are not neighbours.',
        'Adjacency means differing in only one variable.',
        'Choose horizontally, vertically, or wrap-around neighbours only.',
      ),
    )
  }

  const sop = validateSopGroup(kmap, cells)
  if (sop.issues.some((i) => i.kind === 'contains-zero')) {
    out.push(
      detail(
        mode === 'sop' ? 'SOP_POS_CONFUSION' : 'MINTERM_MAXTERM_CONFUSION',
        `A ${1 - desired} appears inside the group.`,
        `For ${mode.toUpperCase()}, groups may only contain the required ${desired}s (and don\u2019t-cares).`,
        `${mode.toUpperCase()} groups target the ${desired}s.`,
        `Remove the ${1 - desired} cell(s) from the group.`,
      ),
    )
  }

  const uncovered = uncoveredRequired(kmap, [cells], mode)
  if (checkCoverage && out.length === 0 && uncovered.length > 0) {
    out.push(
      detail(
        'COVERAGE',
        `A required cell (${uncovered.join(', ')}) is not covered by any group.`,
        `Every required ${desired} cell must belong to at least one group.`,
        'Groups must cover all required cells.',
        `Add a group that covers ${uncovered.slice(0, 3).join(', ')} (and any other uncovered cells).`,
      ),
    )
  }

  return out
}

/** Classify why an expression is not the minimal result. */
export function classifyMinimality(
  report: ReturnType<typeof assessMinimality>,
): MistakeDetail[] {
  if (report.result === 'NOT_EQUIVALENT') {
    return [
      detail(
        'VARIABLE_ELIMINATION',
        'Your expression is not equivalent to the K-map.',
        'The output you wrote is different from the function on at least one input combination.',
        'The final expression must match the K-map for every input.',
        'Re-check which variables are constant inside each group and how the terms combine.',
      ),
    ]
  }
  if (report.result === 'SUBOPTIMAL') {
    return [
      detail(
        'MINIMALITY',
        `Your expression uses ${report.studentTerms} term(s) and ${report.studentLiterals} literal(s); the minimal form uses ${report.expectedTerms} term(s) and ${report.expectedLiterals} literal(s).`,
        'A redundant term or an extra literal does not change the output but makes the expression larger than necessary.',
        'A minimal K-map cover eliminates every variable possible and drops redundant terms.',
        'Look for a larger group that absorbs a variable, or remove a group whose cells are already covered.',
      ),
    ]
  }
  return []
}

/**
 * Classify the overall submission (equivalent / minimal) into a mistake, or
 * return none when the expression is both equivalent and minimal.
 */
export function classifySubmission(
  model: KMapModel,
  variables: readonly string[],
  mode: KMapMode,
  expression: string,
  expected: { readonly sop: string; readonly pos: string },
): MistakeDetail[] {
  const report = assessMinimality(model, variables, mode, expression, expected)
  return classifyMinimality(report)
}