/**
 * Conversion algorithms between decimal, binary, hexadecimal, and octal number systems.
 * Pure TypeScript — no framework dependencies.
 */

import type { Bit, ConversionResult, NumberSystemConfig, CrossSystemConversionResult, NumberSystem } from './types'
import { checkDecimalOverflow, getMaxDecimalForBits } from './decimal'
import { bitsToDecimal, decimalToBits, bitsToString } from './binary'
import { decimalToHex, hexToString, parseHexadecimal, hexToBinary, binaryToHex } from './hexadecimal'
import { decimalToOctal, octalToString, parseOctal, octalToBinary, binaryToOctal } from './octal'

const DEFAULT_CONFIG: NumberSystemConfig = {
  maxBits: 32,
  allowNegative: false,
}

/**
 * Converts a decimal number to a binary string.
 */
export function decimalToBinaryString(
  decimal: number,
  config: NumberSystemConfig = DEFAULT_CONFIG,
): ConversionResult {
  if (typeof decimal !== 'number' || !Number.isInteger(decimal)) {
    return { success: false, error: 'Input must be an integer' }
  }

  if (!config.allowNegative && decimal < 0) {
    return { success: false, error: 'Negative numbers not allowed' }
  }

  if (decimal < 0) {
    return { success: false, error: 'Negative numbers not yet supported' }
  }

  const maxBits = config.maxBits ?? 32

  // Check for overflow
  if (checkDecimalOverflow(decimal, maxBits)) {
    return {
      success: false,
      error: `Decimal ${decimal} exceeds maximum value for ${maxBits} bits (${getMaxDecimalForBits(maxBits)})`,
    }
  }

  try {
    const bits = decimalToBits(decimal)
    return { success: true, result: bitsToString(bits) }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error',
    }
  }
}

/**
 * Converts a decimal number to a binary bit array.
 */
export function decimalToBinaryBits(
  decimal: number,
  config: NumberSystemConfig = DEFAULT_CONFIG,
): ConversionResult {
  if (typeof decimal !== 'number' || !Number.isInteger(decimal)) {
    return { success: false, error: 'Input must be an integer' }
  }

  if (!config.allowNegative && decimal < 0) {
    return { success: false, error: 'Negative numbers not allowed' }
  }

  if (decimal < 0) {
    return { success: false, error: 'Negative numbers not yet supported' }
  }

  const maxBits = config.maxBits ?? 32

  // Check for overflow
  if (checkDecimalOverflow(decimal, maxBits)) {
    return {
      success: false,
      error: `Decimal ${decimal} exceeds maximum value for ${maxBits} bits (${getMaxDecimalForBits(maxBits)})`,
    }
  }

  try {
    const bits = decimalToBits(decimal)
    return { success: true, result: bits }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error',
    }
  }
}

/**
 * Converts a binary string to a decimal number.
 */
export function binaryStringToDecimal(binary: string): ConversionResult {
  if (typeof binary !== 'string' || binary.trim() === '') {
    return { success: false, error: 'Input must be a non-empty string' }
  }

  const trimmed = binary.trim()

  // Validate binary format
  if (!/^[01]+$/.test(trimmed)) {
    return { success: false, error: 'Invalid binary format: must contain only 0s and 1s' }
  }

  try {
    const bits: Bit[] = trimmed.split('').map((char) => (char === '1' ? 1 : 0)) as Bit[]
    const decimal = bitsToDecimal(bits)
    return { success: true, result: decimal }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error',
    }
  }
}

/**
 * Converts a binary bit array to a decimal number.
 */
export function binaryBitsToDecimal(bits: readonly Bit[]): ConversionResult {
  if (!Array.isArray(bits) || bits.length === 0) {
    return { success: false, error: 'Input must be a non-empty bit array' }
  }

  // Validate all bits are 0 or 1
  if (!bits.every((bit) => bit === 0 || bit === 1)) {
    return { success: false, error: 'Invalid bit array: must contain only 0s and 1s' }
  }

  try {
    const decimal = bitsToDecimal(bits)
    return { success: true, result: decimal }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error',
    }
  }
}

/**
 * Converts a binary string to a binary bit array.
 */
export function binaryStringToBits(binary: string): ConversionResult {
  if (typeof binary !== 'string' || binary.trim() === '') {
    return { success: false, error: 'Input must be a non-empty string' }
  }

  const trimmed = binary.trim()

  // Validate binary format
  if (!/^[01]+$/.test(trimmed)) {
    return { success: false, error: 'Invalid binary format: must contain only 0s and 1s' }
  }

  try {
    const bits: Bit[] = trimmed.split('').map((char) => (char === '1' ? 1 : 0)) as Bit[]
    return { success: true, result: bits }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error',
    }
  }
}

/**
 * Pads a binary string with leading zeros to reach a specified length.
 */
export function padBinaryString(binary: string, targetLength: number): ConversionResult {
  if (typeof binary !== 'string' || binary.trim() === '') {
    return { success: false, error: 'Input must be a non-empty string' }
  }

  const trimmed = binary.trim()

  // Validate binary format
  if (!/^[01]+$/.test(trimmed)) {
    return { success: false, error: 'Invalid binary format: must contain only 0s and 1s' }
  }

  if (targetLength <= trimmed.length) {
    return { success: true, result: trimmed }
  }

  const padding = targetLength - trimmed.length
  const padded = '0'.repeat(padding) + trimmed
  return { success: true, result: padded }
}

/**
 * Validates that a decimal-to-binary conversion is within range.
 */
export function validateConversionRange(
  decimal: number,
  maxBits: number,
): { valid: boolean; error?: string } {
  if (decimal < 0) {
    return { valid: false, error: 'Negative numbers not supported' }
  }

  if (checkDecimalOverflow(decimal, maxBits)) {
    return {
      valid: false,
      error: `Value ${decimal} exceeds maximum for ${maxBits} bits (${getMaxDecimalForBits(maxBits)})`,
    }
  }

  return { valid: true }
}

/**
 * Gets the minimum number of bits required to represent a decimal number.
 */
export function getMinimumBitsForDecimal(decimal: number): number {
  if (decimal < 0) throw new Error('Negative numbers not supported')
  if (decimal === 0) return 1

  let bits = 0
  let temp = decimal
  while (temp > 0) {
    bits++
    temp = Math.floor(temp / 2)
  }
  return bits
}

// ==================== HEXADECIMAL CONVERSIONS ====================

/**
 * Converts a decimal number to a hexadecimal string.
 */
export function decimalToHexString(
  decimal: number,
  config: NumberSystemConfig = DEFAULT_CONFIG,
): ConversionResult {
  if (typeof decimal !== 'number' || !Number.isInteger(decimal)) {
    return { success: false, error: 'Input must be an integer' }
  }

  if (!config.allowNegative && decimal < 0) {
    return { success: false, error: 'Negative numbers not allowed' }
  }

  if (decimal < 0) {
    return { success: false, error: 'Negative numbers not yet supported' }
  }

  try {
    const hexDigits = decimalToHex(decimal)
    return { success: true, result: hexToString(hexDigits) }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error',
    }
  }
}

/**
 * Converts a hexadecimal string to a decimal number.
 */
export function hexStringToDecimal(hex: string): ConversionResult {
  if (typeof hex !== 'string' || hex.trim() === '') {
    return { success: false, error: 'Input must be a non-empty string' }
  }

  try {
    const parsed = parseHexadecimal(hex)
    if (!parsed.isValid) {
      return { success: false, error: parsed.error || 'Invalid hexadecimal format' }
    }
    return { success: true, result: parsed.value }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error',
    }
  }
}

/**
 * Converts a binary string to a hexadecimal string.
 */
export function binaryStringToHex(binary: string): ConversionResult {
  if (typeof binary !== 'string' || binary.trim() === '') {
    return { success: false, error: 'Input must be a non-empty string' }
  }

  const trimmed = binary.trim()

  // Validate binary format
  if (!/^[01]+$/.test(trimmed)) {
    return { success: false, error: 'Invalid binary format: must contain only 0s and 1s' }
  }

  try {
    const hex = binaryToHex(trimmed)
    return { success: true, result: hex }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error',
    }
  }
}

/**
 * Converts a hexadecimal string to a binary string.
 */
export function hexStringToBinary(hex: string): ConversionResult {
  if (typeof hex !== 'string' || hex.trim() === '') {
    return { success: false, error: 'Input must be a non-empty string' }
  }

  try {
    const parsed = parseHexadecimal(hex)
    if (!parsed.isValid) {
      return { success: false, error: parsed.error || 'Invalid hexadecimal format' }
    }
    const binary = hexToBinary(hexToString(parsed.digits))
    return { success: true, result: binary }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error',
    }
  }
}

// ==================== OCTAL CONVERSIONS ====================

/**
 * Converts a decimal number to an octal string.
 */
export function decimalToOctalString(
  decimal: number,
  config: NumberSystemConfig = DEFAULT_CONFIG,
): ConversionResult {
  if (typeof decimal !== 'number' || !Number.isInteger(decimal)) {
    return { success: false, error: 'Input must be an integer' }
  }

  if (!config.allowNegative && decimal < 0) {
    return { success: false, error: 'Negative numbers not allowed' }
  }

  if (decimal < 0) {
    return { success: false, error: 'Negative numbers not yet supported' }
  }

  try {
    const octalDigits = decimalToOctal(decimal)
    return { success: true, result: octalToString(octalDigits) }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error',
    }
  }
}

/**
 * Converts an octal string to a decimal number.
 */
export function octalStringToDecimal(octal: string): ConversionResult {
  if (typeof octal !== 'string' || octal.trim() === '') {
    return { success: false, error: 'Input must be a non-empty string' }
  }

  try {
    const parsed = parseOctal(octal)
    if (!parsed.isValid) {
      return { success: false, error: parsed.error || 'Invalid octal format' }
    }
    return { success: true, result: parsed.value }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error',
    }
  }
}

/**
 * Converts a binary string to an octal string.
 */
export function binaryStringToOctal(binary: string): ConversionResult {
  if (typeof binary !== 'string' || binary.trim() === '') {
    return { success: false, error: 'Input must be a non-empty string' }
  }

  const trimmed = binary.trim()

  // Validate binary format
  if (!/^[01]+$/.test(trimmed)) {
    return { success: false, error: 'Invalid binary format: must contain only 0s and 1s' }
  }

  try {
    const octal = binaryToOctal(trimmed)
    return { success: true, result: octal }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error',
    }
  }
}

/**
 * Converts an octal string to a binary string.
 */
export function octalStringToBinary(octal: string): ConversionResult {
  if (typeof octal !== 'string' || octal.trim() === '') {
    return { success: false, error: 'Input must be a non-empty string' }
  }

  try {
    const parsed = parseOctal(octal)
    if (!parsed.isValid) {
      return { success: false, error: parsed.error || 'Invalid octal format' }
    }
    const binary = octalToBinary(octalToString(parsed.digits))
    return { success: true, result: binary }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error',
    }
  }
}

/**
 * Converts a hexadecimal string to an octal string.
 */
export function hexStringToOctal(hex: string): ConversionResult {
  if (typeof hex !== 'string' || hex.trim() === '') {
    return { success: false, error: 'Input must be a non-empty string' }
  }

  try {
    const parsed = parseHexadecimal(hex)
    if (!parsed.isValid) {
      return { success: false, error: parsed.error || 'Invalid hexadecimal format' }
    }
    
    // Convert via binary for educational clarity
    const binary = hexToBinary(hexToString(parsed.digits))
    const octal = binaryToOctal(binary)
    
    return { success: true, result: octal }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error',
    }
  }
}

/**
 * Converts an octal string to a hexadecimal string.
 */
export function octalStringToHex(octal: string): ConversionResult {
  if (typeof octal !== 'string' || octal.trim() === '') {
    return { success: false, error: 'Input must be a non-empty string' }
  }

  try {
    const parsed = parseOctal(octal)
    if (!parsed.isValid) {
      return { success: false, error: parsed.error || 'Invalid octal format' }
    }
    
    // Convert via binary for educational clarity
    const binary = octalToBinary(octalToString(parsed.digits))
    const hex = binaryToHex(binary)
    
    return { success: true, result: hex }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown conversion error',
    }
  }
}

// ==================== CROSS-SYSTEM CONVERSIONS ====================

/**
 * Universal conversion between any two number systems.
 */
export function convertBetweenSystems(
  value: string | number,
  fromSystem: NumberSystem,
  toSystem: NumberSystem,
  _config: NumberSystemConfig = DEFAULT_CONFIG,
): CrossSystemConversionResult {
  const intermediateSteps: string[] = []
  
  try {
    // Normalize input to string
    const inputValue = typeof value === 'number' ? value.toString() : value.toString().trim()
    
    if (inputValue === '') {
      return {
        success: false,
        fromSystem,
        toSystem,
        error: 'Input cannot be empty',
      }
    }

    // If same system, return as-is
    if (fromSystem === toSystem) {
      return {
        success: true,
        fromSystem,
        toSystem,
        result: inputValue,
        intermediateSteps: ['Same system - no conversion needed'],
      }
    }

    // Convert to decimal first (intermediate step)
    let decimalValue: number
    switch (fromSystem) {
      case 'decimal':
        decimalValue = parseInt(inputValue, 10)
        intermediateSteps.push(`${inputValue} (decimal) → ${decimalValue} (decimal)`)
        break
      case 'binary':
        if (!/^[01]+$/.test(inputValue)) {
          return { success: false, fromSystem, toSystem, error: 'Invalid binary format' }
        }
        decimalValue = parseInt(inputValue, 2)
        intermediateSteps.push(`${inputValue} (binary) → ${decimalValue} (decimal)`)
        break
      case 'hexadecimal':
        if (!/^[0-9A-Fa-f]+$/.test(inputValue)) {
          return { success: false, fromSystem, toSystem, error: 'Invalid hexadecimal format' }
        }
        decimalValue = parseInt(inputValue, 16)
        intermediateSteps.push(`${inputValue} (hexadecimal) → ${decimalValue} (decimal)`)
        break
      case 'octal':
        if (!/^[0-7]+$/.test(inputValue)) {
          return { success: false, fromSystem, toSystem, error: 'Invalid octal format' }
        }
        decimalValue = parseInt(inputValue, 8)
        intermediateSteps.push(`${inputValue} (octal) → ${decimalValue} (decimal)`)
        break
      default:
        return { success: false, fromSystem, toSystem, error: 'Unknown source system' }
    }

    // Convert from decimal to target system
    let result: string
    switch (toSystem) {
      case 'decimal':
        result = decimalValue.toString(10)
        intermediateSteps.push(`${decimalValue} (decimal) → ${result} (decimal)`)
        break
      case 'binary':
        result = decimalValue.toString(2)
        intermediateSteps.push(`${decimalValue} (decimal) → ${result} (binary)`)
        break
      case 'hexadecimal':
        result = decimalValue.toString(16).toUpperCase()
        intermediateSteps.push(`${decimalValue} (decimal) → ${result} (hexadecimal)`)
        break
      case 'octal':
        result = decimalValue.toString(8)
        intermediateSteps.push(`${decimalValue} (decimal) → ${result} (octal)`)
        break
      default:
        return { success: false, fromSystem, toSystem, error: 'Unknown target system' }
    }

    return {
      success: true,
      fromSystem,
      toSystem,
      result,
      intermediateSteps,
    }
  } catch (error) {
    return {
      success: false,
      fromSystem,
      toSystem,
      error: error instanceof Error ? error.message : 'Unknown conversion error',
    }
  }
}
