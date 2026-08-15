/**
 * Validation service for number systems input.
 * Provides validation and normalization for user input.
 */

import type { 
  ValidationRequest, 
  ValidationResponse,
  NumberSystem 
} from './types'
import { 
  parseHexadecimal,
  parseOctal,
  validateHexadecimal,
  validateOctal
} from '../../core/numbersystems'

/**
 * Validates input for a specific number system.
 */
export function validateNumberSystemInput(request: ValidationRequest): ValidationResponse {
  const { value, system } = request

  try {
    const valueStr = value.toString().trim()

    if (valueStr === '') {
      return {
        success: true,
        isValid: false,
        error: 'Input cannot be empty',
      }
    }

    let isValid = true
    let error: string | undefined
    let normalizedValue: string | undefined

    switch (system) {
      case 'decimal':
        // Validate decimal: only digits 0-9, no leading zeros
        if (!/^[0-9]+$/.test(valueStr)) {
          isValid = false
          error = 'Decimal must contain only digits 0-9'
        } else if (valueStr.length > 1 && valueStr.startsWith('0')) {
          isValid = false
          error = 'Leading zeros are not allowed in decimal'
        } else {
          // Check for valid number range
          const numValue = parseInt(valueStr, 10)
          if (isNaN(numValue)) {
            isValid = false
            error = 'Invalid decimal number'
          } else {
            normalizedValue = numValue.toString()
          }
        }
        break

      case 'binary':
        // Validate binary: only 0s and 1s, no leading zeros
        if (!/^[01]+$/.test(valueStr)) {
          isValid = false
          error = 'Binary must contain only 0s and 1s'
        } else if (valueStr.length > 1 && valueStr.startsWith('0')) {
          isValid = false
          error = 'Leading zeros are not allowed in binary'
        } else {
          normalizedValue = valueStr
        }
        break

      case 'hexadecimal':
        // Validate hexadecimal: 0-9 and A-F, case-insensitive
        const hexValidation = validateHexadecimal(valueStr)
        if (!hexValidation.valid) {
          isValid = false
          error = hexValidation.error
        } else {
          // Normalize to uppercase
          const parsed = parseHexadecimal(valueStr)
          if (parsed.isValid) {
            normalizedValue = valueStr.toUpperCase()
          }
        }
        break

      case 'octal':
        // Validate octal: only 0-7, no leading zeros
        const octalValidation = validateOctal(valueStr)
        if (!octalValidation.valid) {
          isValid = false
          error = octalValidation.error
        } else {
          const parsed = parseOctal(valueStr)
          if (parsed.isValid) {
            normalizedValue = valueStr
          }
        }
        break

      default:
        isValid = false
        error = 'Unknown number system'
    }

    return {
      success: true,
      isValid,
      error,
      normalizedValue,
    }
  } catch (error) {
    return {
      success: false,
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    }
  }
}

/**
 * Normalizes input to a consistent format.
 */
export function normalizeInput(value: string, system: NumberSystem): string {
  const trimmed = value.toString().trim()

  switch (system) {
    case 'hexadecimal':
      return trimmed.toUpperCase()
    case 'decimal':
    case 'binary':
    case 'octal':
      return trimmed
    default:
      return trimmed
  }
}

/**
 * Checks if a value is within a valid range for a given bit length.
 */
export function checkBitLengthRange(
  value: string,
  system: NumberSystem,
  maxBits: number,
): { valid: boolean; error?: string } {
  try {
    // Convert to decimal to check range
    let decimalValue: number

    switch (system) {
      case 'decimal':
        decimalValue = parseInt(value, 10)
        break
      case 'binary':
        decimalValue = parseInt(value, 2)
        break
      case 'hexadecimal':
        decimalValue = parseInt(value, 16)
        break
      case 'octal':
        decimalValue = parseInt(value, 8)
        break
      default:
        return { valid: false, error: 'Unknown number system' }
    }

    if (isNaN(decimalValue)) {
      return { valid: false, error: 'Invalid number' }
    }

    const maxValue = Math.pow(2, maxBits) - 1

    if (decimalValue > maxValue) {
      return {
        valid: false,
        error: `Value exceeds maximum for ${maxBits} bits (${maxValue})`,
      }
    }

    if (decimalValue < 0) {
      return { valid: false, error: 'Negative values not supported' }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown range check error',
    }
  }
}

/**
 * Validates a conversion request before processing.
 */
export function validateConversionRequest(
  value: string | number,
  fromSystem: NumberSystem,
  toSystem: NumberSystem,
): { valid: boolean; error?: string } {
  // Check if systems are the same
  if (fromSystem === toSystem) {
    return { valid: true } // Same system is valid, just no conversion needed
  }

  // Validate input value
  const valueStr = typeof value === 'number' ? value.toString() : value.toString().trim()
  const validation = validateNumberSystemInput({ value: valueStr, system: fromSystem })

  if (!validation.isValid) {
    return {
      valid: false,
      error: `Invalid ${fromSystem} input: ${validation.error}`,
    }
  }

  return { valid: true }
}
