import type { InputState, LessonStep, TruthTableSpec } from './types'

/**
 * Guided lesson steps for "Why SOP uses 1s and POS uses 0s?".
 * Each step maps to a dedicated visual; the component branches on `kind`.
 */
export const LESSON_STEPS: readonly LessonStep[] = [
  {
    id: 'goal',
    title: 'What are we trying to represent?',
    subtitle:
      'A Boolean function is just a rule that turns every input combination into 0 or 1. The truth table lists all of those combinations.',
    kind: 'truth-table-intro',
  },
  {
    id: 'sop-goal',
    title: 'SOP: we want output = 1',
    subtitle:
      'Sum of Products describes the combinations where the function must be 1. Find one of those rows.',
    kind: 'sop-goal',
  },
  {
    id: 'sop-and',
    title: 'Why does AND build a product?',
    subtitle:
      'A product term is true only when EVERY input of the AND gate is 1. That is exactly one input combination.',
    kind: 'sop-transformation',
  },
  {
    id: 'sop-minterm',
    title: 'That product term is a MINTERM',
    subtitle:
      'A minterm is a product of literals that is 1 for exactly one input combination.',
    kind: 'sop-minterm',
  },
  {
    id: 'sop-to-cell',
    title: 'A truth-table row becomes a K-map cell',
    subtitle:
      'The K-map is not a mystery grid: every cell is just a truth-table row arranged visually.',
    kind: 'sop-to-cell',
  },
  {
    id: 'sop-group-ones',
    title: 'So we group 1s',
    subtitle:
      'Because SOP is built from minterms, and minterms represent the combinations where F = 1, we mark and group those 1-cells.',
    kind: 'sop-group-ones',
  },
  {
    id: 'pos-goal',
    title: 'POS: we want output = 0',
    subtitle:
      'Product of Sums describes the combinations where the function must be 0. Start from the opposite goal.',
    kind: 'pos-goal',
  },
  {
    id: 'pos-or',
    title: 'Why does OR build a sum?',
    subtitle:
      'A sum term is false only when EVERY input of the OR gate is 0. That is exactly one input combination.',
    kind: 'pos-transformation',
  },
  {
    id: 'pos-maxterm',
    title: 'That sum term is a MAXTERM',
    subtitle:
      'A maxterm is a sum of literals that is 0 for exactly one input combination.',
    kind: 'pos-maxterm',
  },
  {
    id: 'pos-to-cell',
    title: 'That row also becomes a K-map cell',
    subtitle:
      'The same input combination has the same cell. Only the meaning of the notation flips.',
    kind: 'pos-to-cell',
  },
  {
    id: 'pos-group-zeros',
    title: 'So we group 0s',
    subtitle:
      'Because POS is built from maxterms, and maxterms represent the combinations where F = 0, we mark and group those 0-cells.',
    kind: 'pos-group-zeros',
  },
  {
    id: 'comparison',
    title: 'Side by side',
    subtitle:
      'The SAME complement operation, but with a different reason in each pathway. Click SOP or POS to highlight it.',
    kind: 'comparison',
  },
  {
    id: 'bridge',
    title: 'Now the real question',
    subtitle:
      'Now you know WHY we work with 1s for SOP and 0s for POS. The next step is HOW we simplify them.',
    kind: 'bridge',
  },
]

/** Convenience lookup for jumping straight to a step (e.g. from a cell popup). */
export function findLessonStep(id: string): LessonStep {
  const step = LESSON_STEPS.find((s) => s.id === id)
  if (!step) throw new RangeError(`unknown lesson step "${id}"`)
  return step
}

/** The lesson always starts at the beginning. */
export function lessonStepIndex(id: string): number {
  const index = LESSON_STEPS.findIndex((s) => s.id === id)
  return index < 0 ? 0 : index
}

/**
 * SOP example: only row A=0, B=1 is a 1. This focuses the whole SOP story on
 * the single minterm A'B.
 */
export const SOP_TRUTH_TABLE: TruthTableSpec = {
  variables: ['A', 'B'],
  outputs: [0, 1, 0, 0],
  highlightMinterm: 1,
}

/** The input combination the SOP lesson works through: A=0, B=1. */
export const SOP_INPUT: InputState = {
  variables: ['A', 'B'],
  bits: [0, 1],
}

/**
 * POS example: the same style, but the working row A=0, B=1 has F=0.
 * Its maxterm is A + B' (0 + 0 = 0).
 */
export const POS_TRUTH_TABLE: TruthTableSpec = {
  variables: ['A', 'B'],
  outputs: [1, 0, 1, 1],
  highlightMinterm: 1,
}

/** The input combination the POS lesson works through: A=0, B=1. */
export const POS_INPUT: InputState = {
  variables: ['A', 'B'],
  bits: [0, 1],
}

/**
 * A truth table that has 1s in adjacent cells (minterms 1 and 3) so the
 * "group the 1s" step can show that neighbouring 1-cells merge into one term.
 */
export const GROUP_ONES_TRUTH_TABLE: TruthTableSpec = {
  variables: ['A', 'B'],
  outputs: [0, 1, 0, 1],
  highlightMinterm: null,
}

/**
 * A truth table that has 0s at minterms 0 and 2 so the "group the 0s" step can
 * show neighbouring 0-cells merging into one sum term.
 */
export const GROUP_ZEROS_TRUTH_TABLE: TruthTableSpec = {
  variables: ['A', 'B'],
  outputs: [0, 1, 0, 1],
  highlightMinterm: null,
}

/** Rows used by the guided steps that need to select a 1- or 0-cell. */
export const SOP_ONES_SCATTER: readonly number[] = [1, 3]
export const POS_ZEROS_SCATTER: readonly number[] = [0, 2]

/** Alias used by the SOP "group the 1s" step (1s in adjacent cells 1 and 3). */
export const SOP_GROUP_TRUTH_TABLE = GROUP_ONES_TRUTH_TABLE

/** Alias used by the POS "group the 0s" step (0s in adjacent cells 0 and 2). */
export const POS_GROUP_TRUTH_TABLE = GROUP_ZEROS_TRUTH_TABLE