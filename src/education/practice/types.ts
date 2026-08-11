/**
 * P2 — K-Map Practice, Guided Learning & Mastery Engine.
 *
 * Pure TypeScript data model for the practice system. These types describe
 * problems, student attempts, actions, mistakes, hints, mastery and progress.
 * They are intentionally free of React and free of any K-map mathematics —
 * the math lives in `src/core/kmap`. This module only shapes the data.
 */

/** 2, 3 or 4 variable K-maps (5+ is out of scope for this milestone). */
export type VariableCount = 2 | 3 | 4

/** K-map simplification target. */
export type KMapMode = 'sop' | 'pos'

/** Where don't-cares appear, if any. */
export type DontCareKind = 'none' | 'optional' | 'required'

/** Difficulty levels 1…5 (based on reasoning complexity, not variable count). */
export type Difficulty = 1 | 2 | 3 | 4 | 5

/** The core concepts a problem may target or a student may master. */
export type ConceptId =
  | 'cell-identification'
  | 'minterms'
  | 'adjacency'
  | 'group-formation'
  | 'group-size'
  | 'wrap-around'
  | 'overlap'
  | 'don-t-care'
  | 'variable-elimination'
  | 'sop'
  | 'pos'
  | 'minimality'
  | 'coverage'

/** A resolved OK/issue line for a submitted group. */
export interface GroupCheck {
  readonly group: readonly number[]
  readonly valid: boolean
  readonly coversRequired: boolean
  readonly isMinimal: boolean
  /** The SOP product term string this group derives to (never empty here). */
  readonly term: string
}

/**
 * A validated K-map problem. `expectedSolutions` are computed by the real
 * simplification engine (never hard-coded), so equivalent alternatives are
 * accepted by the equivalence evaluator rather than by string comparison.
 */
export interface KMapProblem {
  readonly id: string
  /** Deterministic, reproducible seed string. */
  readonly seed: string
  readonly title: string
  readonly prompt: string
  readonly variables: readonly string[]
  readonly variableCount: VariableCount
  readonly mode: KMapMode
  readonly minterms: readonly number[]
  readonly maxterms: readonly number[]
  readonly dontCares: readonly number[]
  readonly dontCareKind: DontCareKind
  readonly difficulty: Difficulty
  readonly learningObjectives: readonly string[]
  /** Concept ids this problem intentionally exercises. */
  readonly concepts: readonly ConceptId[]
  readonly allowedHints: number
  /** The canonical simplification computed with the shared engine. */
  readonly expected: {
    readonly sop: string
    readonly pos: string
    readonly sopGroups: readonly (readonly number[])[]
    readonly posGroups: readonly (readonly number[])[]
  }
  /** Concept ids whose misconception could plausibly appear. */
  readonly likelyMisconceptions: readonly string[]
}

/** A single recorded student action during an attempt. */
export type PracticeAction =
  | { type: 'strategy'; value: string }
  | { type: 'cell-selected'; minterm: number }
  | { type: 'cell-deselected'; minterm: number }
  | { type: 'group-submitted'; group: readonly number[] }
  | { type: 'hint-requested' }
  | { type: 'concept-question'; questionId: string; answerGiven: string; correct: boolean }
  | { type: 'expression-submitted'; expression: string }

/** The P2 mistake taxonomy, aligned with the P1 misconception engine. */
export type MistakeCategory =
  | 'CELL_IDENTIFICATION'
  | 'ADJACENCY'
  | 'GROUP_SIZE'
  | 'GROUP_SHAPE'
  | 'WRAP_AROUND'
  | 'OVERLAP'
  | 'DONT_CARE'
  | 'COVERAGE'
  | 'VARIABLE_ELIMINATION'
  | 'COMPLEMENTATION'
  | 'SOP_POS_CONFUSION'
  | 'MINTERM_MAXTERM_CONFUSION'
  | 'MINIMALITY'

/** Educational explanation structure shared by mistake feedback. */
export interface MistakeDetail {
  readonly category: MistakeCategory
  readonly happened: string
  readonly why: string
  readonly correctConcept: string
  readonly tryAgain: string
}

/** Mastery status for a single concept. */
export type MasteryStatus = 'NOT_STARTED' | 'LEARNING' | 'DEVELOPING' | 'MASTERED'

/** Per-concept running state along the learning path. */
export interface ConceptState {
  readonly conceptId: ConceptId
  /** Deterministic 0–100 learning score. */
  readonly score: number
  readonly attempts: number
  readonly correct: number
  readonly mistakes: number
  readonly mistakesTrack: readonly boolean[]
  readonly hintsUsed: number
  readonly status: MasteryStatus
}

/** Overall concept mastery keyed by ConceptId. */
export type ConceptMastery = Readonly<Record<ConceptId, ConceptState>>

/** A single completed (or attempted) problem attempt. */
export interface PracticeAttempt {
  readonly problemId: string
  readonly startedAt: number
  completedAt?: number
  readonly actions: readonly PracticeAction[]
  /** Number of distinct mistakes seen (after the intro). */
  mistakes: number
  hintsUsed: number
  /** Student-submitted groups. */
  groupsCreated: readonly (readonly number[])[]
  finalExpression?: string
  verified: boolean
  score: number
  masterySignals: readonly ConceptId[]
}

/** Summary of one evaluation of a student submission. */
export interface PracticeEvaluation {
  /** 0–100 score (partial credit). */
  readonly score: number
  readonly groupsValid: boolean
  readonly coversRequired: boolean
  readonly equivalent: boolean
  readonly minimal: boolean
  /** Per submitted group check (already validated by the shared engine). */
  readonly groupChecks: readonly GroupCheck[]
  readonly mistakes: readonly MistakeDetail[]
  readonly feedback: readonly string[]
  readonly masterySignals: readonly ConceptId[]
  /** Did the student require hints on this attempt? */
  readonly usedHints: boolean
}

/** Structured practice feedback shown at the end of an attempt. */
export interface PracticeFeedback {
  readonly score: number
  readonly accuracy: number
  readonly mistakes: number
  readonly hintsUsed: number
  readonly correct: readonly string[]
  readonly review: readonly string[]
  readonly status: MasteryStatus
}

/** Configuration options passed to the problem generator. */
export interface ProblemSeedConfig {
  readonly variableCount: VariableCount
  readonly mode: KMapMode
  readonly difficulty: Difficulty
  readonly dontCare: DontCareKind
  readonly concepts: readonly ConceptId[]
  readonly seed: string
  /** Upper bound of distinct candidate maps to try. */
  readonly maxAttempts?: number
}

/** Public request to start a practice session (Feature 24). */
export interface PracticeSessionConfig {
  readonly mode: 'guided' | 'independent' | 'challenge'
  readonly size: 5 | 10 | 'custom'
  readonly customSize?: number
  readonly difficultyBias?: Difficulty
}