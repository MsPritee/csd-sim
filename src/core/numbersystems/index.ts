/**
 * Number Systems Core Engine - Barrel Exports
 * Pure TypeScript — no React, no Zustand, no UI.
 * 
 * This module provides comprehensive number system operations for:
 * - Decimal number parsing, validation, and operations
 * - Binary number parsing, validation, and bit manipulation
 * - Hexadecimal number parsing, validation, and operations
 * - Octal number parsing, validation, and operations
 * - Bidirectional conversion between all systems
 * - Basic arithmetic operations in all systems
 * - Specialized operations (bit grouping, nibble manipulation)
 */

// Type definitions
export * from './types'

// Decimal operations
export * from './decimal'

// Binary operations
export * from './binary'

// Hexadecimal operations
export * from './hexadecimal'

// Octal operations
export * from './octal'

// Conversion algorithms (exported explicitly to avoid re-export ambiguity with
// the raw `decimalToHexString`/`hexStringToDecimal`/`decimalToOctalString`/
// `octalStringToDecimal` helpers in ./hexadecimal and ./octal).
export {
  decimalToBinaryString,
  decimalToBinaryBits,
  binaryStringToDecimal,
  binaryBitsToDecimal,
  binaryStringToBits,
  padBinaryString,
  validateConversionRange,
  getMinimumBitsForDecimal,
  binaryStringToHex,
  hexStringToBinary,
  binaryStringToOctal,
  octalStringToBinary,
  hexStringToOctal,
  octalStringToHex,
  convertBetweenSystems,
} from './converters'

// Arithmetic operations
export * from './operations'

// Specialized operations
export * from './specialized'
