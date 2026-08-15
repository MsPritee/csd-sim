/**
 * Core number systems engine types. Pure TypeScript — no React, no Zustand, no UI.
 * These types describe number systems, validation, and conversion interfaces
 * for the educational engine and application layers.
 */

/** A single binary digit (bit). */
export type Bit = 0 | 1

/** A single hexadecimal digit. */
export type HexDigit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f'

/** A single octal digit. */
export type OctalDigit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7'

/** Supported number systems in the engine. */
export type NumberSystem = 'decimal' | 'binary' | 'hexadecimal' | 'octal'

/** Validation result for number parsing and operations. */
export interface ValidationResult {
  readonly valid: boolean
  readonly error?: string
}

/** Range validation result with bounds information. */
export interface RangeValidationResult extends ValidationResult {
  readonly withinRange: boolean
  readonly minValue?: number
  readonly maxValue?: number
}

/** Parsed decimal number with metadata. */
export interface DecimalNumber {
  readonly value: number
  readonly isValid: boolean
  readonly error?: string
}

/** Parsed binary number with metadata. */
export interface BinaryNumber {
  readonly bits: readonly Bit[]
  readonly isValid: boolean
  readonly error?: string
}

/** Parsed hexadecimal number with metadata. */
export interface HexadecimalNumber {
  readonly digits: readonly HexDigit[]
  readonly value: number
  readonly isValid: boolean
  readonly error?: string
}

/** Parsed octal number with metadata. */
export interface OctalNumber {
  readonly digits: readonly OctalDigit[]
  readonly value: number
  readonly isValid: boolean
  readonly error?: string
}

/** Conversion result between number systems. */
export interface ConversionResult {
  readonly success: boolean
  readonly result?: number | string | readonly Bit[]
  readonly error?: string
}

/** Bit operation result for binary manipulation. */
export interface BitOperationResult {
  readonly result: readonly Bit[]
  readonly operation: 'shift' | 'rotate' | 'complement'
  readonly success: boolean
  readonly error?: string
}

/** Hexadecimal operation result. */
export interface HexOperationResult {
  readonly result: readonly HexDigit[]
  readonly operation: string
  readonly success: boolean
  readonly error?: string
}

/** Octal operation result. */
export interface OctalOperationResult {
  readonly result: readonly OctalDigit[]
  readonly operation: string
  readonly success: boolean
  readonly error?: string
}

/** Arithmetic operation result. */
export interface ArithmeticResult {
  readonly result: number
  readonly overflow: boolean
  readonly success: boolean
  readonly error?: string
}

/** Configuration for number system operations. */
export interface NumberSystemConfig {
  readonly maxBits?: number
  readonly allowNegative?: boolean
  readonly maxDecimalValue?: number
}

/** Error types for number system operations. */
export type NumberSystemError =
  | 'INVALID_FORMAT'
  | 'OUT_OF_RANGE'
  | 'OVERFLOW'
  | 'INVALID_BITS'
  | 'CONVERSION_ERROR'
  | 'OPERATION_ERROR'

/** Detailed error information. */
export interface NumberSystemErrorInfo {
  readonly type: NumberSystemError
  readonly message: string
  readonly context?: Record<string, unknown>
}

/** Cross-system conversion result with intermediate steps. */
export interface CrossSystemConversionResult {
  readonly success: boolean
  readonly fromSystem: NumberSystem
  readonly toSystem: NumberSystem
  readonly result?: string | number
  readonly intermediateSteps?: string[]
  readonly error?: string
}

/** Nibble (4-bit group) representation. */
export interface Nibble {
  readonly bits: readonly Bit[]
  readonly hexDigit: HexDigit
  readonly decimalValue: number
}

/** Bit grouping result for visualization. */
export interface BitGroupingResult {
  readonly success: boolean
  readonly nibbles: readonly Nibble[]
  readonly octalGroups: readonly OctalDigit[]
  readonly groupedBinary: string
  readonly error?: string
}

/** Number system comparison result. */
export interface NumberSystemComparison {
  readonly decimal: number
  readonly binary: string
  readonly hexadecimal: string
  readonly octal: string
  readonly bitLength: number
}

/** Single division step for decimal to other base conversion. */
export interface DivisionStep {
  readonly dividend: number
  readonly divisor: number
  readonly quotient: number
  readonly remainder: number
  readonly stepNumber: number
  readonly isFinalStep: boolean
}

/** Division steps result with complete conversion process. */
export interface DivisionStepsResult {
  readonly success: boolean
  readonly targetBase: 2 | 8 | 16
  readonly decimalValue: number
  readonly steps: readonly DivisionStep[]
  readonly result: string
  readonly error?: string
}

/** Single position value calculation. */
export interface PositionValue {
  readonly digit: string
  readonly position: number
  readonly base: number
  readonly positionValue: number
  readonly calculation: string
  readonly contribution: number
}

/** Position value breakdown result. */
export interface PositionValueResult {
  readonly success: boolean
  readonly fromSystem: NumberSystem
  readonly inputValue: string
  readonly decimalResult: number
  readonly positions: readonly PositionValue[]
  readonly calculation: string
  readonly error?: string
}
