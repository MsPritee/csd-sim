/**
 * Misconceptions module.
 * This will contain misconception detection: matching observed student
 * actions to common mistakes and producing targeted explanations.
 * Placeholder for future educational content.
 */

export interface Misconception {
  id: string
  pattern: string
  explanation: string
  hint: string
}

/**
 * Concrete misconception catalogue for K-map grouping. Each entry states what
 * happened, why it is wrong, the correct concept, and an optional hint.
 */
export const MISCONCEPTIONS: readonly Misconception[] = [
  {
    id: 'diagonal-grouping',
    pattern: 'Grouped diagonally-opposite cells.',
    explanation:
      'Diagonal cells are both one-over and one-down: they differ in two variables, so they are NOT adjacent.',
    hint: 'Adjacent K-map cells may differ in only one variable.',
  },
  {
    id: 'wrong-mode-value',
    pattern: 'Included a cell with the wrong value for the mode.',
    explanation:
      'For SOP, groups may only contain 1s (and X); for POS, only 0s (and X). A 0 in an SOP group (or a 1 in a POS group) is invalid.',
    hint: 'SOP groups the 1s; POS groups the 0s.',
  },
  {
    id: 'non-power-of-two',
    pattern: 'Grouped a non-power-of-two number of cells.',
    explanation:
      'Valid K-map groups must contain 1, 2, 4, 8, or 16 cells and form a rectangle.',
    hint: 'Group sizes must be powers of two.',
  },
  {
    id: 'uncovered-required',
    pattern: 'Left a required cell uncovered.',
    explanation:
      'Every required cell (a 1 for SOP, a 0 for POS) must belong to at least one selected group.',
    hint: 'Check each required cell appears in some group.',
  },
]

/** Short lookups the validate/feedback UI uses to attach a concept to an issue. */
export function misconceptionById(id: string): Misconception | undefined {
  return MISCONCEPTIONS.find((m) => m.id === id)
}

/** Suggest a misconception id for a single grouped-cell issue message. */
export function misconceptionForIssue(message: string): Misconception | undefined {
  if (/not a power of 2|not allowed/.test(message)) return misconceptionById('non-power-of-two')
  if (/rectangle|adjacent|diagonal/.test(message)) return misconceptionById('diagonal-grouping')
  if (/holds 0|cannot be part|0 and cannot/.test(message)) return misconceptionById('wrong-mode-value')
  return undefined
}