/**
 * Decimal number operations, validation, and parsing.
 * Pure TypeScript — no framework dependencies.
 */

import type {
  DecimalNumber,
  ValidationResult,
  RangeValidationResult,
  NumberSystemConfig,
} from './types'

const DEFAULT_CONFIG: NumberSystemConfig = {
  allowNegative: false,
  maxDecimalValue: Number.MAX_SAFE_INTEGER,
}

/**
 * Validates if a string represents a valid decimal number.
 */
export function validateDecimalString(input: string): ValidationResult {
  if (typeof input !== 'string' || input.trim() === '') {
    return { valid: false, error: 'Input must be a non-empty string' }
  }

  const trimmed = input.trim()
  
  // Check if it's a valid number format
  if (!/^-?\d+$/.test(trimmed)) {
    return { valid: false, error: 'Invalid decimal format: must contain only digits' }
  }

  // Check for leading zeros (except for zero itself)
  if (trimmed.length > 1 && trimmed.startsWith('0') && !trimmed.startsWith('-0')) {
    return { valid: false, error: 'Invalid decimal format: no leading zeros allowed' }
  }

  // Check for negative zero
  if (trimmed === '-0') {
    return { valid: false, error: 'Invalid decimal format: negative zero not allowed' }
  }

  return { valid: true }
}

/**
 * Parses a decimal string into a DecimalNumber object.
 */
export function parseDecimal(input: string, config: NumberSystemConfig = DEFAULT_CONFIG): DecimalNumber {
  const validation = validateDecimalString(input)
  if (!validation.valid) {
    return { value: 0, isValid: false, error: validation.error }
  }

  const value = Number.parseInt(input.trim(), 10)
  
  // Check for NaN (shouldn't happen after regex validation, but safety check)
  if (Number.isNaN(value)) {
    return { value: 0, isValid: false, error: 'Failed to parse decimal number' }
  }

  // Check for negative numbers if not allowed
  if (!config.allowNegative && value < 0) {
    return { value: 0, isValid: false, error: 'Negative numbers not allowed' }
  }

  // Check for maximum value
  const maxValue = config.maxDecimalValue ?? Number.MAX_SAFE_INTEGER
  if (value > maxValue) {
    return { value: 0, isValid: false, error: `Value exceeds maximum of ${maxValue}` }
  }

  // Check for minimum value (if negative allowed)
  if (config.allowNegative && value < -maxValue) {
    return { value: 0, isValid: false, error: `Value below minimum of -${maxValue}` }
  }

  return { value, isValid: true }
}

/**
 * Validates a decimal number against a range.
 */
export function validateDecimalRange(
  value: number,
  min: number,
  max: number,
): RangeValidationResult {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return {
      valid: false,
      withinRange: false,
      error: 'Value must be an integer',
    }
  }

  if (value < min || value > max) {
    return {
      valid: true,
      withinRange: false,
      minValue: min,
      maxValue: max,
      error: `Value ${value} is outside range [${min}, ${max}]`,
    }
  }

  return {
    valid: true,
    withinRange: true,
    minValue: min,
    maxValue: max,
  }
}

/**
 * Checks if a decimal value would cause overflow when converted to binary with given bits.
 */
export function checkDecimalOverflow(value: number, maxBits: number): boolean {
  if (value < 0) return true
  const maxValue = Math.pow(2, maxBits) - 1
  return value > maxValue
}

/**
 * Gets the maximum decimal value representable with a given number of bits.
 */
export function getMaxDecimalForBits(bits: number): number {
  if (bits <= 0) return 0
  return Math.pow(2, bits) - 1
}

/**
 * Formats a decimal number as a string.
 */
export function formatDecimal(value: number): string {
  return value.toString()
}

/**
 * Checks if a decimal number is valid within the specified constraints.
 */
export function isValidDecimal(value: number, config: NumberSystemConfig = DEFAULT_CONFIG): boolean {
  if (!Number.isInteger(value)) return false
  if (!config.allowNegative && value < 0) return false
  
  const maxValue = config.maxDecimalValue ?? Number.MAX_SAFE_INTEGER
  if (config.allowNegative) {
    return value >= -maxValue && value <= maxValue
  }
  return value >= 0 && value <= maxValue
}
