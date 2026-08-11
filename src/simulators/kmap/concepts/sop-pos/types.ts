import type { CellValue } from '../../../../core/kmap'

/**
 * A single row of input values (MSB first) plus the variables they map to.
 * This is the shared "what an input combination looks like" description that
 * both the SOP (minterm) and POS (maxterm) pathways build from.
 */
export interface InputState {
  readonly variables: readonly string[]
  /** One bit per variable, most-significant bit first. */
  readonly bits: readonly number[]
}

/**
 * The kind of visual used for each guided step. Each kind maps to a dedicated
 * representation so that every step communicates one concept (rather than a
 * wall of text).
 */
export type LessonStepKind =
  | 'truth-table-intro'
  | 'sop-goal'
  | 'sop-transformation'
  | 'sop-minterm'
  | 'sop-to-cell'
  | 'sop-group-ones'
  | 'pos-goal'
  | 'pos-transformation'
  | 'pos-maxterm'
  | 'pos-to-cell'
  | 'pos-group-zeros'
  | 'comparison'
  | 'bridge'

/**
 * A single guided step in the "Why SOP uses 1s and POS uses 0s?" lesson.
 */
export interface LessonStep {
  readonly id: string
  readonly title: string
  readonly subtitle: string
  readonly kind: LessonStepKind
}

/** A small truth-table plus which row (minterm) should be highlighted. */
export interface TruthTableSpec {
  readonly variables: readonly string[]
  /** Outputs indexed by minterm 0..2^n - 1. */
  readonly outputs: readonly CellValue[]
  readonly highlightMinterm: number | null
}