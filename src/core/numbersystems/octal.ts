/**
 * Octal number operations and validation.
 * Pure TypeScript — no framework dependencies.
 */

import type { OctalDigit, OctalNumber, ValidationResult, NumberSystemConfig } from './types'

const OCTAL_DIGIT_VALUES: Record<string, number> = {
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
}

const VALUE_TO_OCTAL_DIGIT: Record<number, string> = {
  0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
}

/**
 * Validates an octal digit.
 */
export function isValidOctalDigit(digit: string): digit is OctalDigit {
  return /^[0-7]$/.test(digit)
}

/**
 * Parses an octal string into an OctalNumber.
 */
export function parseOctal(octal: string, config: NumberSystemConfig = {}): OctalNumber {
  if (typeof octal !== 'string' || octal.trim() === '') {
    return { digits: [], value: 0, isValid: false, error: 'Input must be a non-empty string' }
  }

  const trimmed = octal.trim()
  
  // Remove common prefixes
  const withoutPrefix = trimmed.replace(/^(0o|0O|#\\o)/, '')

  // Validate octal format
  if (!/^[0-7]+$/.test(withoutPrefix)) {
    return { digits: [], value: 0, isValid: false, error: 'Invalid octal format: must contain only 0-7' }
  }

  // Check for leading zeros
  if (withoutPrefix.length > 1 && withoutPrefix.startsWith('0')) {
    return { digits: [], value: 0, isValid: false, error: 'Leading zeros are not allowed' }
  }

  try {
    const digits: OctalDigit[] = withoutPrefix.split('') as OctalDigit[]
    const value = octalToDecimal(digits)
    
    // Check maximum value if configured
    if (config.maxDecimalValue !== undefined && value > config.maxDecimalValue) {
      return { 
        digits: [], 
        value: 0, 
        isValid: false, 
        error: `Value exceeds maximum allowed (${config.maxDecimalValue})` 
      }
    }

    return { digits, value, isValid: true }
  } catch (error) {
    return {
      digits: [],
      value: 0,
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error',
    }
  }
}

/**
 * Converts an octal digit array to its decimal value.
 */
export function octalToDecimal(digits: readonly OctalDigit[]): number {
  let value = 0
  for (const digit of digits) {
    value = value * 8 + OCTAL_DIGIT_VALUES[digit]
  }
  return value
}

/**
 * Converts a decimal number to an octal digit array.
 */
export function decimalToOctal(decimal: number): OctalDigit[] {
  if (decimal < 0) throw new Error('Negative numbers not supported')
  if (decimal === 0) return ['0']

  const digits: OctalDigit[] = []
  let temp = decimal

  while (temp > 0) {
    const remainder = temp % 8
    digits.unshift(VALUE_TO_OCTAL_DIGIT[remainder] as OctalDigit)
    temp = Math.floor(temp / 8)
  }

  return digits
}

/**
 * Converts an octal digit array to a string.
 */
export function octalToString(digits: readonly OctalDigit[]): string {
  return digits.join('')
}

/**
 * Converts an octal string to a decimal number.
 */
export function octalStringToDecimal(octal: string): number {
  const parsed = parseOctal(octal)
  if (!parsed.isValid) {
    throw new Error(parsed.error || 'Invalid octal string')
  }
  return parsed.value
}

/**
 * Converts a decimal number to an octal string.
 */
export function decimalToOctalString(decimal: number): string {
  return octalToString(decimalToOctal(decimal))
}

/**
 * Validates an octal number with range checking.
 */
export function validateOctal(
  octal: string,
  config: NumberSystemConfig = {},
): ValidationResult {
  const parsed = parseOctal(octal, config)
  return {
    valid: parsed.isValid,
    error: parsed.error,
  }
}

/**
 * Gets the minimum number of octal digits required to represent a decimal number.
 */
export function getMinimumOctalDigitsForDecimal(decimal: number): number {
  if (decimal < 0) throw new Error('Negative numbers not supported')
  if (decimal === 0) return 1

  let digits = 0
  let temp = decimal
  while (temp > 0) {
    digits++
    temp = Math.floor(temp / 8)
  }
  return digits
}

/**
 * Pads an octal string with leading zeros to reach a specified length.
 */
export function padOctalString(octal: string, targetLength: number): string {
  const parsed = parseOctal(octal)
  if (!parsed.isValid) {
    throw new Error(parsed.error || 'Invalid octal string')
  }

  const currentString = octalToString(parsed.digits)
  if (targetLength <= currentString.length) {
    return currentString
  }

  const padding = targetLength - currentString.length
  return '0'.repeat(padding) + currentString
}

/**
 * Performs octal addition.
 */
export function addOctal(a: string, b: string): string {
  const decimalA = octalStringToDecimal(a)
  const decimalB = octalStringToDecimal(b)
  const result = decimalA + decimalB
  return decimalToOctalString(result)
}

/**
 * Performs octal subtraction.
 */
export function subtractOctal(a: string, b: string): string {
  const decimalA = octalStringToDecimal(a)
  const decimalB = octalStringToDecimal(b)
  const result = decimalA - decimalB
  if (result < 0) throw new Error('Subtraction resulted in negative number')
  return decimalToOctalString(result)
}

/**
 * Performs octal multiplication.
 */
export function multiplyOctal(a: string, b: string): string {
  const decimalA = octalStringToDecimal(a)
  const decimalB = octalStringToDecimal(b)
  const result = decimalA * decimalB
  return decimalToOctalString(result)
}

/**
 * Performs octal division (integer division).
 */
export function divideOctal(a: string, b: string): string {
  const decimalA = octalStringToDecimal(a)
  const decimalB = octalStringToDecimal(b)
  if (decimalB === 0) throw new Error('Division by zero')
  const result = Math.floor(decimalA / decimalB)
  return decimalToOctalString(result)
}

/**
 * Converts octal to binary (each octal digit becomes 3 bits).
 */
export function octalToBinary(octal: string): string {
  const parsed = parseOctal(octal)
  if (!parsed.isValid) {
    throw new Error(parsed.error || 'Invalid octal string')
  }

  const binaryDigits: string[] = []
  for (const digit of parsed.digits) {
    const value = OCTAL_DIGIT_VALUES[digit]
    const binary3 = value.toString(2).padStart(3, '0')
    binaryDigits.push(binary3)
  }

  // Remove leading zeros while keeping at least one digit
  const result = binaryDigits.join('').replace(/^0+(?!$)/, '')
  return result
}

/**
 * Converts binary to octal (groups of 3 bits).
 */
export function binaryToOctal(binary: string): string {
  // Validate binary format
  if (!/^[01]+$/.test(binary)) {
    throw new Error('Invalid binary format: must contain only 0s and 1s')
  }

  // Pad to multiple of 3 bits
  const padded = binary.padStart(Math.ceil(binary.length / 3) * 3, '0')
  
  const octalDigits: string[] = []
  for (let i = 0; i < padded.length; i += 3) {
    const group = padded.slice(i, i + 3)
    const value = parseInt(group, 2)
    octalDigits.push(VALUE_TO_OCTAL_DIGIT[value])
  }

  // Remove leading zeros while keeping at least one digit
  const result = octalDigits.join('').replace(/^0+(?!$)/, '')
  return result || '0'
}

/**
 * Converts octal to hexadecimal (via binary or decimal).
 */
export function octalToHexadecimal(octal: string): string {
  const decimal = octalStringToDecimal(octal)
  return decimal.toString(16).toUpperCase()
}

/**
 * Converts hexadecimal to octal (via binary or decimal).
 */
export function hexadecimalToOctal(hex: string): string {
  const decimal = parseInt(hex, 16)
  return decimal.toString(8)
}

/**
 * Compares two octal numbers.
 */
export function compareOctal(a: string, b: string): number {
  const decimalA = octalStringToDecimal(a)
  const decimalB = octalStringToDecimal(b)
  
  if (decimalA < decimalB) return -1
  if (decimalA > decimalB) return 1
  return 0
}
