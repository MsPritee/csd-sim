/**
 * Hexadecimal number operations and validation.
 * Pure TypeScript — no framework dependencies.
 */

import type { HexDigit, HexadecimalNumber, ValidationResult, NumberSystemConfig } from './types'

const HEX_DIGIT_VALUES: Record<string, number> = {
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, 'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15,
  'a': 10, 'b': 11, 'c': 12, 'd': 13, 'e': 14, 'f': 15,
}

const VALUE_TO_HEX_DIGIT: Record<number, string> = {
  0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
  8: '8', 9: '9', 10: 'A', 11: 'B', 12: 'C', 13: 'D', 14: 'E', 15: 'F',
}

/**
 * Validates a hexadecimal digit.
 */
export function isValidHexDigit(digit: string): digit is HexDigit {
  return /^[0-9A-Fa-f]$/.test(digit)
}

/**
 * Parses a hexadecimal string into a HexadecimalNumber.
 */
export function parseHexadecimal(hex: string, config: NumberSystemConfig = {}): HexadecimalNumber {
  if (typeof hex !== 'string' || hex.trim() === '') {
    return { digits: [], value: 0, isValid: false, error: 'Input must be a non-empty string' }
  }

  const trimmed = hex.trim()
  
  // Remove common prefixes
  const withoutPrefix = trimmed.replace(/^(0x|0X|#|\\h)/, '')

  // Validate hexadecimal format
  if (!/^[0-9A-Fa-f]+$/.test(withoutPrefix)) {
    return { digits: [], value: 0, isValid: false, error: 'Invalid hexadecimal format: must contain only 0-9 and A-F' }
  }

  // Check for leading zeros
  if (withoutPrefix.length > 1 && withoutPrefix.startsWith('0')) {
    return { digits: [], value: 0, isValid: false, error: 'Leading zeros are not allowed' }
  }

  try {
    const digits: HexDigit[] = withoutPrefix.split('').map(d => d.toUpperCase() as HexDigit)
    const value = hexToDecimal(digits)
    
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
 * Converts a hexadecimal digit array to its decimal value.
 */
export function hexToDecimal(digits: readonly HexDigit[]): number {
  let value = 0
  for (const digit of digits) {
    value = value * 16 + HEX_DIGIT_VALUES[digit]
  }
  return value
}

/**
 * Converts a decimal number to a hexadecimal digit array.
 */
export function decimalToHex(decimal: number): HexDigit[] {
  if (decimal < 0) throw new Error('Negative numbers not supported')
  if (decimal === 0) return ['0']

  const digits: HexDigit[] = []
  let temp = decimal

  while (temp > 0) {
    const remainder = temp % 16
    digits.unshift(VALUE_TO_HEX_DIGIT[remainder] as HexDigit)
    temp = Math.floor(temp / 16)
  }

  return digits
}

/**
 * Converts a hexadecimal digit array to a string.
 */
export function hexToString(digits: readonly HexDigit[]): string {
  return digits.join('')
}

/**
 * Converts a hexadecimal string to a decimal number.
 */
export function hexStringToDecimal(hex: string): number {
  const parsed = parseHexadecimal(hex)
  if (!parsed.isValid) {
    throw new Error(parsed.error || 'Invalid hexadecimal string')
  }
  return parsed.value
}

/**
 * Converts a decimal number to a hexadecimal string.
 */
export function decimalToHexString(decimal: number): string {
  return hexToString(decimalToHex(decimal))
}

/**
 * Validates a hexadecimal number with range checking.
 */
export function validateHexadecimal(
  hex: string,
  config: NumberSystemConfig = {},
): ValidationResult {
  const parsed = parseHexadecimal(hex, config)
  return {
    valid: parsed.isValid,
    error: parsed.error,
  }
}

/**
 * Gets the minimum number of hex digits required to represent a decimal number.
 */
export function getMinimumHexDigitsForDecimal(decimal: number): number {
  if (decimal < 0) throw new Error('Negative numbers not supported')
  if (decimal === 0) return 1

  let digits = 0
  let temp = decimal
  while (temp > 0) {
    digits++
    temp = Math.floor(temp / 16)
  }
  return digits
}

/**
 * Pads a hexadecimal string with leading zeros to reach a specified length.
 */
export function padHexString(hex: string, targetLength: number): string {
  const parsed = parseHexadecimal(hex)
  if (!parsed.isValid) {
    throw new Error(parsed.error || 'Invalid hexadecimal string')
  }

  const currentString = hexToString(parsed.digits)
  if (targetLength <= currentString.length) {
    return currentString
  }

  const padding = targetLength - currentString.length
  return '0'.repeat(padding) + currentString
}

/**
 * Performs hexadecimal addition.
 */
export function addHexadecimal(a: string, b: string): string {
  const decimalA = hexStringToDecimal(a)
  const decimalB = hexStringToDecimal(b)
  const result = decimalA + decimalB
  return decimalToHexString(result)
}

/**
 * Performs hexadecimal subtraction.
 */
export function subtractHexadecimal(a: string, b: string): string {
  const decimalA = hexStringToDecimal(a)
  const decimalB = hexStringToDecimal(b)
  const result = decimalA - decimalB
  if (result < 0) throw new Error('Subtraction resulted in negative number')
  return decimalToHexString(result)
}

/**
 * Performs hexadecimal multiplication.
 */
export function multiplyHexadecimal(a: string, b: string): string {
  const decimalA = hexStringToDecimal(a)
  const decimalB = hexStringToDecimal(b)
  const result = decimalA * decimalB
  return decimalToHexString(result)
}

/**
 * Performs hexadecimal division (integer division).
 */
export function divideHexadecimal(a: string, b: string): string {
  const decimalA = hexStringToDecimal(a)
  const decimalB = hexStringToDecimal(b)
  if (decimalB === 0) throw new Error('Division by zero')
  const result = Math.floor(decimalA / decimalB)
  return decimalToHexString(result)
}

/**
 * Converts hexadecimal to binary (each hex digit becomes 4 bits).
 */
export function hexToBinary(hex: string): string {
  const parsed = parseHexadecimal(hex)
  if (!parsed.isValid) {
    throw new Error(parsed.error || 'Invalid hexadecimal string')
  }

  const binaryDigits: string[] = []
  for (const digit of parsed.digits) {
    const value = HEX_DIGIT_VALUES[digit]
    const binary4 = value.toString(2).padStart(4, '0')
    binaryDigits.push(binary4)
  }

  // Remove leading zeros while keeping at least one digit
  const result = binaryDigits.join('').replace(/^0+(?!$)/, '')
  return result
}

/**
 * Converts binary to hexadecimal (groups of 4 bits).
 */
export function binaryToHex(binary: string): string {
  // Validate binary format
  if (!/^[01]+$/.test(binary)) {
    throw new Error('Invalid binary format: must contain only 0s and 1s')
  }

  // Pad to multiple of 4 bits
  const padded = binary.padStart(Math.ceil(binary.length / 4) * 4, '0')
  
  const hexDigits: string[] = []
  for (let i = 0; i < padded.length; i += 4) {
    const group = padded.slice(i, i + 4)
    const value = parseInt(group, 2)
    hexDigits.push(VALUE_TO_HEX_DIGIT[value])
  }

  // Remove leading zeros while keeping at least one digit
  const result = hexDigits.join('').replace(/^0+(?!$)/, '')
  return result || '0'
}

/**
 * Normalizes a hexadecimal digit to uppercase.
 */
export function normalizeHexDigit(digit: HexDigit): HexDigit {
  return digit.toUpperCase() as HexDigit
}

/**
 * Compares two hexadecimal numbers.
 */
export function compareHexadecimal(a: string, b: string): number {
  const decimalA = hexStringToDecimal(a)
  const decimalB = hexStringToDecimal(b)
  
  if (decimalA < decimalB) return -1
  if (decimalA > decimalB) return 1
  return 0
}
