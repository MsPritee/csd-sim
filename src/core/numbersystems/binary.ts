/**
 * Binary number operations, validation, and bit manipulation.
 * Pure TypeScript — no framework dependencies.
 */

import type {
  Bit,
  BinaryNumber,
  ValidationResult,
  BitOperationResult,
  NumberSystemConfig,
  DivisionStep,
} from './types'

const DEFAULT_CONFIG: NumberSystemConfig = {
  maxBits: 32,
}

/**
 * Validates if a string represents a valid binary number (only 0s and 1s).
 */
export function validateBinaryString(input: string): ValidationResult {
  if (typeof input !== 'string' || input.trim() === '') {
    return { valid: false, error: 'Input must be a non-empty string' }
  }

  const trimmed = input.trim()
  
  // Check if it contains only 0s and 1s
  if (!/^[01]+$/.test(trimmed)) {
    return { valid: false, error: 'Invalid binary format: must contain only 0s and 1s' }
  }

  // Check for leading zeros (except for single zero)
  if (trimmed.length > 1 && trimmed.startsWith('0')) {
    return { valid: false, error: 'Invalid binary format: no leading zeros allowed' }
  }

  return { valid: true }
}

/**
 * Parses a binary string into a BinaryNumber object.
 */
export function parseBinary(input: string, config: NumberSystemConfig = DEFAULT_CONFIG): BinaryNumber {
  const validation = validateBinaryString(input)
  if (!validation.valid) {
    return { bits: [], isValid: false, error: validation.error }
  }

  const trimmed = input.trim()
  const maxBits = config.maxBits ?? 32

  // Check length constraint
  if (trimmed.length > maxBits) {
    return {
      bits: [],
      isValid: false,
      error: `Binary string exceeds maximum length of ${maxBits} bits`,
    }
  }

  // Convert string to bit array (MSB first)
  const bits: Bit[] = trimmed.split('').map((char) => (char === '1' ? 1 : 0)) as Bit[]

  return { bits, isValid: true }
}

/**
 * Converts a bit array to a binary string.
 */
export function bitsToString(bits: readonly Bit[]): string {
  return bits.join('')
}

/**
 * Converts a decimal number to a bit array.
 */
export function decimalToBits(value: number, bitLength?: number): Bit[] {
  if (value < 0) throw new Error('Negative numbers not supported')
  if (value === 0) return [0]

  const bits: Bit[] = []
  let temp = value

  while (temp > 0) {
    bits.unshift((temp % 2) as Bit)
    temp = Math.floor(temp / 2)
  }

  // Pad to specified length if needed
  if (bitLength !== undefined && bits.length < bitLength) {
    const padding = bitLength - bits.length
    for (let i = 0; i < padding; i++) {
      bits.unshift(0)
    }
  }

  return bits
}

/**
 * Converts a bit array to a decimal number.
 */
export function bitsToDecimal(bits: readonly Bit[]): number {
  let result = 0
  for (let i = 0; i < bits.length; i++) {
    result = result * 2 + bits[i]!
  }
  return result
}

/**
 * Performs a left shift operation on binary bits.
 */
export function leftShift(bits: readonly Bit[], positions: number): BitOperationResult {
  if (positions < 0) {
    return {
      result: bits,
      operation: 'shift',
      success: false,
      error: 'Shift positions must be non-negative',
    }
  }

  if (positions === 0) {
    return { result: bits, operation: 'shift', success: true }
  }

  const shifted = [...bits, ...Array(positions).fill(0)] as Bit[]
  return { result: shifted, operation: 'shift', success: true }
}

/**
 * Performs a right shift operation on binary bits.
 */
export function rightShift(bits: readonly Bit[], positions: number): BitOperationResult {
  if (positions < 0) {
    return {
      result: bits,
      operation: 'shift',
      success: false,
      error: 'Shift positions must be non-negative',
    }
  }

  if (positions >= bits.length) {
    return { result: [0], operation: 'shift', success: true }
  }

  if (positions === 0) {
    return { result: bits, operation: 'shift', success: true }
  }

  const shifted = bits.slice(0, bits.length - positions)
  return { result: shifted, operation: 'shift', success: true }
}

/**
 * Performs a left rotation on binary bits.
 */
export function rotateLeft(bits: readonly Bit[], positions: number): BitOperationResult {
  if (bits.length === 0) {
    return { result: [], operation: 'rotate', success: false, error: 'Cannot rotate empty bit array' }
  }

  if (positions < 0) {
    return {
      result: bits,
      operation: 'rotate',
      success: false,
      error: 'Rotation positions must be non-negative',
    }
  }

  const effectivePositions = positions % bits.length
  if (effectivePositions === 0) {
    return { result: bits, operation: 'rotate', success: true }
  }

  const rotated = [...bits.slice(effectivePositions), ...bits.slice(0, effectivePositions)] as Bit[]
  return { result: rotated, operation: 'rotate', success: true }
}

/**
 * Performs a right rotation on binary bits.
 */
export function rotateRight(bits: readonly Bit[], positions: number): BitOperationResult {
  if (bits.length === 0) {
    return { result: [], operation: 'rotate', success: false, error: 'Cannot rotate empty bit array' }
  }

  if (positions < 0) {
    return {
      result: bits,
      operation: 'rotate',
      success: false,
      error: 'Rotation positions must be non-negative',
    }
  }

  const effectivePositions = positions % bits.length
  if (effectivePositions === 0) {
    return { result: bits, operation: 'rotate', success: true }
  }

  const rotated = [
    ...bits.slice(-effectivePositions),
    ...bits.slice(0, -effectivePositions),
  ] as Bit[]
  return { result: rotated, operation: 'rotate', success: true }
}

/**
 * Performs a bitwise complement (NOT) operation on binary bits.
 */
export function complement(bits: readonly Bit[]): BitOperationResult {
  const complemented = bits.map((bit) => (bit === 0 ? 1 : 0)) as Bit[]
  return { result: complemented, operation: 'complement', success: true }
}

/**
 * Counts the number of set bits (1s) in a binary number.
 */
export function countSetBits(bits: readonly Bit[]): number {
  return bits.filter((bit) => bit === 1).length
}

/**
 * Gets the bit at a specific position (0-indexed from left/MSB).
 */
export function getBitAt(bits: readonly Bit[], position: number): Bit {
  if (position < 0 || position >= bits.length) {
    throw new Error(`Bit position ${position} out of range [0, ${bits.length - 1}]`)
  }
  return bits[position]!
}

/**
 * Sets a bit at a specific position (0-indexed from left/MSB).
 */
export function setBitAt(bits: readonly Bit[], position: number, value: Bit): Bit[] {
  if (position < 0 || position >= bits.length) {
    throw new Error(`Bit position ${position} out of range [0, ${bits.length - 1}]`)
  }
  const result = [...bits]
  result[position] = value
  return result
}

/**
 * Checks if a binary number is valid within the specified constraints.
 */
export function isValidBinary(bits: readonly Bit[], config: NumberSystemConfig = DEFAULT_CONFIG): boolean {
  const maxBits = config.maxBits ?? 32
  return bits.length > 0 && bits.length <= maxBits && bits.every((bit) => bit === 0 || bit === 1)
}

/**
 * Generates division steps for converting decimal to a target base (2, 8, or 16).
 * This is used for educational visualization of the conversion process.
 */
export function generateDivisionSteps(
  decimal: number,
  targetBase: 2 | 8 | 16,
): { success: boolean; steps: DivisionStep[]; result: string; error?: string } {
  if (decimal < 0) {
    return { success: false, steps: [], result: '', error: 'Negative numbers not supported' }
  }

  if (decimal === 0) {
    return {
      success: true,
      steps: [
        {
          dividend: 0,
          divisor: targetBase,
          quotient: 0,
          remainder: 0,
          stepNumber: 1,
          isFinalStep: true,
        },
      ],
      result: '0',
    }
  }

  const steps: DivisionStep[] = []
  let currentDividend = decimal
  let stepNumber = 1

  while (currentDividend > 0) {
    const quotient = Math.floor(currentDividend / targetBase)
    const remainder = currentDividend % targetBase

    steps.push({
      dividend: currentDividend,
      divisor: targetBase,
      quotient,
      remainder,
      stepNumber,
      isFinalStep: quotient === 0,
    })

    currentDividend = quotient
    stepNumber++
  }

  // Build result by reading remainders from bottom to top
  const remainders = steps.map((step) => step.remainder).reverse()
  let result: string

  if (targetBase === 16) {
    result = remainders
      .map((r) => (r >= 10 ? r.toString(16).toUpperCase() : r.toString()))
      .join('')
  } else {
    result = remainders.join('')
  }

  return { success: true, steps, result }
}
