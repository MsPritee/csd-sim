/**
 * Educational data model for number systems. Pure TypeScript — free of React.
 * These types shape learning content and explanations for number systems.
 * All mathematical operations stay in `src/core/numbersystems`; this layer only interprets them.
 */

import type { NumberSystem } from '../../core/numbersystems/types'
export type { NumberSystem } from '../../core/numbersystems/types'

/**
 * One complete learning concept for a number system, following the master
 * plan's concept schema: title, objective, prerequisite, explanation,
 * visualization, interaction, common mistakes, hints, assessment.
 */
export interface NumberSystemConcept {
  readonly id: NumberSystem
  readonly title: string
  /** What the student will be able to do after mastering this number system. */
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

/**
 * A dynamic, value-specific explanation of a conversion.
 */
export interface ConversionExplanation {
  /** "What happened", e.g. "Decimal 10 → Binary 1010". */
  readonly what: string
  /** "Why", in plain English referencing the actual conversion process. */
  readonly why: string
  /** The rule / algorithm being applied. */
  readonly rule: string
  /** What the student should notice. */
  readonly notice: readonly string[]
}

/**
 * Conversion shortcut for mental math.
 */
export interface ConversionShortcut {
  readonly from: NumberSystem
  readonly to: NumberSystem
  readonly name: string
  readonly description: string
  readonly applicableRange: string
  readonly examples: readonly { readonly input: string; readonly output: string; readonly explanation: string }[]
}

/**
 * Educational conversion result with step-by-step explanation.
 */
export interface EducationalConversionResult {
  readonly success: boolean
  readonly fromSystem: NumberSystem
  readonly toSystem: NumberSystem
  readonly result?: string
  readonly explanation?: ConversionExplanation
  readonly shortcuts?: readonly ConversionShortcut[]
  readonly error?: string
}
