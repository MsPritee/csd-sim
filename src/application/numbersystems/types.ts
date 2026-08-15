/**
 * Application layer types for number systems orchestration.
 * This layer coordinates core and educational engines for the presentation layer.
 */

import type { NumberSystem, DivisionStep } from '../../core/numbersystems/types'
import type { NumberSystemConcept, ConversionShortcut } from '../../education/numbersystems/types'
export type { NumberSystem, DivisionStep, PositionValue, PositionValueResult } from '../../core/numbersystems/types'

/** Conversion request from the UI. */
export interface ConversionRequest {
  readonly value: string | number
  readonly fromSystem: NumberSystem
  readonly toSystem: NumberSystem
  readonly showSteps?: boolean
  readonly useShortcuts?: boolean
}

/** Conversion response for the UI. */
export interface ConversionResponse {
  readonly success: boolean
  readonly result?: string
  readonly fromSystem: NumberSystem
  readonly toSystem: NumberSystem
  readonly steps?: readonly string[]
  readonly explanation?: string
  readonly shortcuts?: readonly ConversionShortcut[]
  readonly divisionSteps?: {
    readonly targetBase: 2 | 8 | 16
    readonly decimalValue: number
    readonly steps: readonly DivisionStep[]
    readonly result: string
  }
  readonly error?: string
}

/** Comparison request for comparing across systems. */
export interface ComparisonRequest {
  readonly value: string | number
  readonly baseSystem: NumberSystem
  readonly includeSystems?: readonly NumberSystem[]
}

/** Comparison response showing the value in multiple systems. */
export interface ComparisonResponse {
  readonly success: boolean
  readonly baseSystem: NumberSystem
  readonly comparisons: Readonly<Partial<Record<NumberSystem, string>>>
  readonly bitLength?: number
  readonly error?: string
}

/** Bit analysis request. */
export interface BitAnalysisRequest {
  readonly value: string | number
  readonly system: NumberSystem
}

/** Bit analysis response. */
export interface BitAnalysisResponse {
  readonly success: boolean
  readonly binary: string
  readonly bitCount: number
  readonly onesCount: number
  readonly zerosCount: number
  readonly nibbles: readonly string[]
  readonly octalGroups: readonly string[]
  readonly isPowerOfTwo: boolean
  readonly error?: string
}

/** Learning request for educational content. */
export interface LearningRequest {
  readonly system: NumberSystem
  readonly includeConcept?: boolean
  readonly includeShortcuts?: boolean
}

/** Learning response with educational content. */
export interface LearningResponse {
  readonly success: boolean
  readonly system: NumberSystem
  readonly concept?: NumberSystemConcept
  readonly shortcuts?: readonly ConversionShortcut[]
  readonly error?: string
}

/** Validation request. */
export interface ValidationRequest {
  readonly value: string
  readonly system: NumberSystem
}

/** Validation response. */
export interface ValidationResponse {
  readonly success: boolean
  readonly isValid: boolean
  readonly error?: string
  readonly normalizedValue?: string
}
