import type { GateType } from '../../core/gates/types'

/**
 * Educational data model for gates (LG-04). Pure TypeScript — free of React.
 * These types shape per-gate learning content and "why it works" explanations.
 * All gate mathematics stays in `src/core/gates`; this layer only interprets it.
 */

/**
 * One complete learning concept for a single gate, following the master
 * plan's concept schema: title, objective, prerequisite, explanation,
 * visualization, interaction, common mistakes, hints, assessment.
 */
export interface GateConcept {
  readonly id: GateType
  readonly title: string
  /** What the student will be able to do after mastering this gate. */
  readonly objective: string
  /** Concepts the student is expected to know first. */
  readonly prerequisites: readonly string[]
  /** "Why it works" concept explanation, plain-English paragraphs. */
  readonly explanation: readonly string[]
  /** What to look at in the simulator. */
  readonly visualization: readonly string[]
  /** How to interact to discover the behavior. */
  readonly interaction: readonly string[]
  /** Common student mistakes. */
  readonly commonMistakes: readonly string[]
  /** Useful nudges when a student is stuck. */
  readonly hints: readonly string[]
  /** Self-check questions to test understanding. */
  readonly assessment: readonly string[]
}

/** A dynamic, input-specific explanation of why a gate produced its output. */
export interface GateExplanation {
  /** "What happened", e.g. "Y = 1 · 0 = 0". */
  readonly what: string
  /** "Why", in plain English referencing the actual inputs. */
  readonly why: string
  /** The rule / law being applied. */
  readonly rule: string
  /** What the student should notice. */
  readonly notice: readonly string[]
}