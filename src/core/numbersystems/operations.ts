/**
 * Basic arithmetic operations in decimal and binary number systems.
 * Pure TypeScript — no framework dependencies.
 */

import type { Bit, ArithmeticResult, NumberSystemConfig } from './types'
import { getMaxDecimalForBits } from './decimal'
import { bitsToDecimal } from './binary'

const DEFAULT_CONFIG: NumberSystemConfig = {
  maxBits: 32,
  allowNegative: false,
}

/**
 * Adds two decimal numbers with overflow detection.
 */
export function addDecimal(
  a: number,
  b: number,
  config: NumberSystemConfig = DEFAULT_CONFIG,
): ArithmeticResult {
  if (typeof a !== 'number' || typeof b !== 'number' || !Number.isInteger(a) || !Number.isInteger(b)) {
    return { result: 0, overflow: false, success: false, error: 'Both operands must be integers' }
  }

  if (!config.allowNegative && (a < 0 || b < 0)) {
    return { result: 0, overflow: false, success: false, error: 'Negative numbers not allowed' }
  }

  const result = a + b
  const maxBits = config.maxBits ?? 32
  const maxValue = getMaxDecimalForBits(maxBits)

  // Check for overflow
  const overflow = result > maxValue || result < 0

  return {
    result,
    overflow,
    success: true,
  }
}

/**
 * Subtracts two decimal numbers with overflow detection.
 */
export function subtractDecimal(
  a: number,
  b: number,
  config: NumberSystemConfig = DEFAULT_CONFIG,
): ArithmeticResult {
  if (typeof a !== 'number' || typeof b !== 'number' || !Number.isInteger(a) || !Number.isInteger(b)) {
    return { result: 0, overflow: false, success: false, error: 'Both operands must be integers' }
  }

  if (!config.allowNegative && (a < 0 || b < 0)) {
    return { result: 0, overflow: false, success: false, error: 'Negative numbers not allowed' }
  }

  const result = a - b

  // Check for negative result if not allowed
  if (!config.allowNegative && result < 0) {
    return {
      result: 0,
      overflow: true,
      success: true,
      error: 'Subtraction resulted in negative number',
    }
  }

  const maxBits = config.maxBits ?? 32
  const maxValue = getMaxDecimalForBits(maxBits)

  // Check for overflow
  const overflow = result > maxValue

  return {
    result,
    overflow,
    success: true,
  }
}

/**
 * Multiplies two decimal numbers with overflow detection.
 */
export function multiplyDecimal(
  a: number,
  b: number,
  config: NumberSystemConfig = DEFAULT_CONFIG,
): ArithmeticResult {
  if (typeof a !== 'number' || typeof b !== 'number' || !Number.isInteger(a) || !Number.isInteger(b)) {
    return { result: 0, overflow: false, success: false, error: 'Both operands must be integers' }
  }

  if (!config.allowNegative && (a < 0 || b < 0)) {
    return { result: 0, overflow: false, success: false, error: 'Negative numbers not allowed' }
  }

  const result = a * b
  const maxBits = config.maxBits ?? 32
  const maxValue = getMaxDecimalForBits(maxBits)

  // Check for overflow
  const overflow = result > maxValue || result < 0

  return {
    result,
    overflow,
    success: true,
  }
}

/**
 * Divides two decimal numbers with validation.
 */
export function divideDecimal(
  a: number,
  b: number,
  config: NumberSystemConfig = DEFAULT_CONFIG,
): ArithmeticResult {
  if (typeof a !== 'number' || typeof b !== 'number' || !Number.isInteger(a) || !Number.isInteger(b)) {
    return { result: 0, overflow: false, success: false, error: 'Both operands must be integers' }
  }

  if (!config.allowNegative && (a < 0 || b < 0)) {
    return { result: 0, overflow: false, success: false, error: 'Negative numbers not allowed' }
  }

  if (b === 0) {
    return { result: 0, overflow: false, success: false, error: 'Division by zero' }
  }

  const result = Math.floor(a / b)
  const maxBits = config.maxBits ?? 32
  const maxValue = getMaxDecimalForBits(maxBits)

  // Check for overflow
  const overflow = result > maxValue

  return {
    result,
    overflow,
    success: true,
  }
}

/**
 * Adds two binary numbers using bit arrays.
 */
export function addBinary(
  a: readonly Bit[],
  b: readonly Bit[],
  config: NumberSystemConfig = DEFAULT_CONFIG,
): ArithmeticResult {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) {
    return { result: 0, overflow: false, success: false, error: 'Both operands must be non-empty bit arrays' }
  }

  // Validate bits
  if (!a.every((bit) => bit === 0 || bit === 1) || !b.every((bit) => bit === 0 || bit === 1)) {
    return { result: 0, overflow: false, success: false, error: 'Invalid bit arrays' }
  }

  const maxBits = config.maxBits ?? 32

  // Convert to decimal for addition
  const decimalA = bitsToDecimal(a)
  const decimalB = bitsToDecimal(b)

  // Perform addition
  const decimalResult = decimalA + decimalB

  // Check for overflow
  const maxValue = getMaxDecimalForBits(maxBits)
  const overflow = decimalResult > maxValue

  return {
    result: decimalResult,
    overflow,
    success: true,
  }
}

/**
 * Subtracts two binary numbers using bit arrays.
 */
export function subtractBinary(
  a: readonly Bit[],
  b: readonly Bit[],
  config: NumberSystemConfig = DEFAULT_CONFIG,
): ArithmeticResult {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) {
    return { result: 0, overflow: false, success: false, error: 'Both operands must be non-empty bit arrays' }
  }

  // Validate bits
  if (!a.every((bit) => bit === 0 || bit === 1) || !b.every((bit) => bit === 0 || bit === 1)) {
    return { result: 0, overflow: false, success: false, error: 'Invalid bit arrays' }
  }

  const maxBits = config.maxBits ?? 32

  // Convert to decimal for subtraction
  const decimalA = bitsToDecimal(a)
  const decimalB = bitsToDecimal(b)

  // Perform subtraction
  const decimalResult = decimalA - decimalB

  // Check for negative result if not allowed
  if (!config.allowNegative && decimalResult < 0) {
    return {
      result: 0,
      overflow: true,
      success: true,
      error: 'Subtraction resulted in negative number',
    }
  }

  // Check for overflow
  const maxValue = getMaxDecimalForBits(maxBits)
  const overflow = decimalResult > maxValue

  return {
    result: decimalResult,
    overflow,
    success: true,
  }
}

/**
 * Multiplies two binary numbers using bit arrays.
 */
export function multiplyBinary(
  a: readonly Bit[],
  b: readonly Bit[],
  config: NumberSystemConfig = DEFAULT_CONFIG,
): ArithmeticResult {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) {
    return { result: 0, overflow: false, success: false, error: 'Both operands must be non-empty bit arrays' }
  }

  // Validate bits
  if (!a.every((bit) => bit === 0 || bit === 1) || !b.every((bit) => bit === 0 || bit === 1)) {
    return { result: 0, overflow: false, success: false, error: 'Invalid bit arrays' }
  }

  const maxBits = config.maxBits ?? 32

  // Convert to decimal for multiplication
  const decimalA = bitsToDecimal(a)
  const decimalB = bitsToDecimal(b)

  // Perform multiplication
  const decimalResult = decimalA * decimalB

  // Check for overflow
  const maxValue = getMaxDecimalForBits(maxBits)
  const overflow = decimalResult > maxValue

  return {
    result: decimalResult,
    overflow,
    success: true,
  }
}

/**
 * Divides two binary numbers using bit arrays.
 */
export function divideBinary(
  a: readonly Bit[],
  b: readonly Bit[],
  config: NumberSystemConfig = DEFAULT_CONFIG,
): ArithmeticResult {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) {
    return { result: 0, overflow: false, success: false, error: 'Both operands must be non-empty bit arrays' }
  }

  // Validate bits
  if (!a.every((bit) => bit === 0 || bit === 1) || !b.every((bit) => bit === 0 || bit === 1)) {
    return { result: 0, overflow: false, success: false, error: 'Invalid bit arrays' }
  }

  // Convert to decimal for division
  const decimalA = bitsToDecimal(a)
  const decimalB = bitsToDecimal(b)

  // Check for division by zero
  if (decimalB === 0) {
    return { result: 0, overflow: false, success: false, error: 'Division by zero' }
  }

  const maxBits = config.maxBits ?? 32

  // Perform division (integer division)
  const decimalResult = Math.floor(decimalA / decimalB)

  // Check for overflow
  const maxValue = getMaxDecimalForBits(maxBits)
  const overflow = decimalResult > maxValue

  return {
    result: decimalResult,
    overflow,
    success: true,
  }
}

/**
 * Performs bitwise AND on two binary numbers.
 */
export function bitwiseAnd(a: readonly Bit[], b: readonly Bit[]): ArithmeticResult {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) {
    return { result: 0, overflow: false, success: false, error: 'Both operands must be non-empty bit arrays' }
  }

  // Validate bits
  if (!a.every((bit) => bit === 0 || bit === 1) || !b.every((bit) => bit === 0 || bit === 1)) {
    return { result: 0, overflow: false, success: false, error: 'Invalid bit arrays' }
  }

  // Pad shorter array with zeros on the right (LSB side)
  const maxLength = Math.max(a.length, b.length)
  const paddedA = [...a, ...Array(maxLength - a.length).fill(0)] as Bit[]
  const paddedB = [...b, ...Array(maxLength - b.length).fill(0)] as Bit[]

  // Perform bitwise AND
  const resultBits: Bit[] = []
  for (let i = 0; i < maxLength; i++) {
    resultBits.push((paddedA[i]! && paddedB[i]!) ? 1 : 0)
  }

  const decimalResult = bitsToDecimal(resultBits)

  return {
    result: decimalResult,
    overflow: false,
    success: true,
  }
}

/**
 * Performs bitwise OR on two binary numbers.
 */
export function bitwiseOr(a: readonly Bit[], b: readonly Bit[]): ArithmeticResult {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) {
    return { result: 0, overflow: false, success: false, error: 'Both operands must be non-empty bit arrays' }
  }

  // Validate bits
  if (!a.every((bit) => bit === 0 || bit === 1) || !b.every((bit) => bit === 0 || bit === 1)) {
    return { result: 0, overflow: false, success: false, error: 'Invalid bit arrays' }
  }

  // Pad shorter array with zeros on the right (LSB side)
  const maxLength = Math.max(a.length, b.length)
  const paddedA = [...a, ...Array(maxLength - a.length).fill(0)] as Bit[]
  const paddedB = [...b, ...Array(maxLength - b.length).fill(0)] as Bit[]

  // Perform bitwise OR
  const resultBits: Bit[] = []
  for (let i = 0; i < maxLength; i++) {
    resultBits.push((paddedA[i]! || paddedB[i]!) ? 1 : 0)
  }

  const decimalResult = bitsToDecimal(resultBits)

  return {
    result: decimalResult,
    overflow: false,
    success: true,
  }
}

/**
 * Performs bitwise XOR on two binary numbers.
 */
export function bitwiseXor(a: readonly Bit[], b: readonly Bit[]): ArithmeticResult {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) {
    return { result: 0, overflow: false, success: false, error: 'Both operands must be non-empty bit arrays' }
  }

  // Validate bits
  if (!a.every((bit) => bit === 0 || bit === 1) || !b.every((bit) => bit === 0 || bit === 1)) {
    return { result: 0, overflow: false, success: false, error: 'Invalid bit arrays' }
  }

  // Pad shorter array with zeros on the right (LSB side)
  const maxLength = Math.max(a.length, b.length)
  const paddedA = [...a, ...Array(maxLength - a.length).fill(0)] as Bit[]
  const paddedB = [...b, ...Array(maxLength - b.length).fill(0)] as Bit[]

  // Perform bitwise XOR
  const resultBits: Bit[] = []
  for (let i = 0; i < maxLength; i++) {
    resultBits.push((paddedA[i]! !== paddedB[i]!) ? 1 : 0)
  }

  const decimalResult = bitsToDecimal(resultBits)

  return {
    result: decimalResult,
    overflow: false,
    success: true,
  }
}
