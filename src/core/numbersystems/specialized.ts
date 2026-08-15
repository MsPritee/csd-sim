/**
 * Specialized operations for bit grouping, nibble manipulation, and advanced binary operations.
 * Pure TypeScript — no framework dependencies.
 */

import type { Bit, Nibble, BitGroupingResult, NumberSystemComparison, OctalDigit } from './types'
import { bitsToDecimal } from './binary'
import { binaryStringToHex, binaryStringToOctal } from './converters'
import { hexToBinary, parseHexadecimal, hexToString } from './hexadecimal'
import { octalToBinary, parseOctal, octalToString } from './octal'

/**
 * Groups bits into nibbles (4-bit groups) for hexadecimal conversion.
 */
export function groupBitsIntoNibbles(bits: readonly Bit[]): Nibble[] {
  // Pad with leading zeros to make length a multiple of 4
  const paddedLength = Math.ceil(bits.length / 4) * 4
  const padded = [...Array(paddedLength - bits.length).fill(0), ...bits] as Bit[]

  const nibbles: Nibble[] = []
  for (let i = 0; i < padded.length; i += 4) {
    const nibbleBits = padded.slice(i, i + 4)
    const decimalValue = bitsToDecimal(nibbleBits)
    const hexDigit = decimalValue.toString(16).toUpperCase() as Nibble['hexDigit']
    
    nibbles.push({
      bits: nibbleBits,
      hexDigit,
      decimalValue,
    })
  }

  return nibbles
}

/**
 * Groups bits into octal groups (3-bit groups).
 */
export function groupBitsIntoOctalGroups(bits: readonly Bit[]): readonly OctalDigit[] {
  // Pad with leading zeros to make length a multiple of 3
  const paddedLength = Math.ceil(bits.length / 3) * 3
  const padded = [...Array(paddedLength - bits.length).fill(0), ...bits] as Bit[]

  const groups: OctalDigit[] = []
  for (let i = 0; i < padded.length; i += 3) {
    const groupBits = padded.slice(i, i + 3)
    const decimalValue = bitsToDecimal(groupBits)
    groups.push(decimalValue.toString(8) as OctalDigit)
  }

  return groups
}

/**
 * Creates a comprehensive bit grouping result for visualization.
 */
export function createBitGroupingResult(binary: string): BitGroupingResult {
  if (!/^[01]+$/.test(binary)) {
    return {
      success: false,
      nibbles: [],
      octalGroups: [],
      groupedBinary: '',
      error: 'Invalid binary format: must contain only 0s and 1s',
    }
  }

  try {
    const bits: Bit[] = binary.split('').map(b => (b === '1' ? 1 : 0)) as Bit[]
    const nibbles = groupBitsIntoNibbles(bits)
    const octalGroups = groupBitsIntoOctalGroups(bits)
    
    // Create grouped binary string with spaces for visualization
    const nibbleGrouped = binary.padStart(Math.ceil(binary.length / 4) * 4, '0')
    const groupedBinary = nibbleGrouped.match(/.{1,4}/g)?.join(' ') || nibbleGrouped

    return {
      success: true,
      nibbles,
      octalGroups,
      groupedBinary,
    }
  } catch (error) {
    return {
      success: false,
      nibbles: [],
      octalGroups: [],
      groupedBinary: '',
      error: error instanceof Error ? error.message : 'Unknown grouping error',
    }
  }
}

/**
 * Converts a decimal number to all supported number systems for comparison.
 */
export function compareAcrossSystems(decimal: number): NumberSystemComparison {
  if (decimal < 0) throw new Error('Negative numbers not supported')
  
  const binary = decimal.toString(2)
  const hexadecimal = decimal.toString(16).toUpperCase()
  const octal = decimal.toString(8)
  
  return {
    decimal,
    binary,
    hexadecimal,
    octal,
    bitLength: binary.length,
  }
}

/**
 * Extracts a specific nibble from a binary number.
 */
export function extractNibble(binary: string, nibbleIndex: number): string {
  if (!/^[01]+$/.test(binary)) {
    throw new Error('Invalid binary format')
  }

  const padded = binary.padStart(Math.ceil(binary.length / 4) * 4, '0')
  const nibbles = padded.match(/.{1,4}/g) || []
  
  if (nibbleIndex < 0 || nibbleIndex >= nibbles.length) {
    throw new Error(`Nibble index ${nibbleIndex} out of range (0-${nibbles.length - 1})`)
  }

  // Nibbles are indexed from left (MSB) to right (LSB)
  return nibbles[nibbleIndex]!
}

/**
 * Combines nibbles into a binary number.
 */
export function combineNibbles(nibbles: string[]): string {
  const validNibbles = nibbles.map(nibble => {
    if (!/^[01]{1,4}$/.test(nibble)) {
      throw new Error(`Invalid nibble: ${nibble}`)
    }
    return nibble.padStart(4, '0')
  })

  const combined = validNibbles.join('')
  // Remove leading zeros while keeping at least one digit
  return combined.replace(/^0+(?!$)/, '') || '0'
}

/**
 * Performs bit manipulation for educational demonstrations.
 */
export function demonstrateBitOperation(
  binary: string,
  operation: 'shift-left' | 'shift-right' | 'rotate-left' | 'rotate-right',
  count: number = 1,
): string {
  if (!/^[01]+$/.test(binary)) {
    throw new Error('Invalid binary format')
  }

  const bits = binary.split('')
  
  switch (operation) {
    case 'shift-left':
      // Shift left, add zeros on the right
      return [...bits.slice(count), ...Array(count).fill('0')].join('')
    
    case 'shift-right':
      // Shift right, add zeros on the left
      return [...Array(count).fill('0'), ...bits.slice(0, -count)].join('')
    
    case 'rotate-left':
      // Rotate left (circular)
      const rotatedLeft = [...bits.slice(count), ...bits.slice(0, count)]
      return rotatedLeft.join('')
    
    case 'rotate-right':
      // Rotate right (circular)
      const rotatedRight = [...bits.slice(-count), ...bits.slice(0, -count)]
      return rotatedRight.join('')
    
    default:
      throw new Error(`Unknown operation: ${operation}`)
  }
}

/**
 * Calculates the two's complement of a binary number.
 */
export function twosComplement(binary: string): string {
  if (!/^[01]+$/.test(binary)) {
    throw new Error('Invalid binary format')
  }

  // Invert all bits
  const inverted = binary.split('').map(bit => bit === '0' ? '1' : '0').join('')
  
  // Add 1
  const invertedBits = inverted.split('').map(b => parseInt(b, 10))
  let carry = 1
  const result: string[] = []

  for (let i = invertedBits.length - 1; i >= 0; i--) {
    const sum = invertedBits[i]! + carry
    result.unshift((sum % 2).toString())
    carry = Math.floor(sum / 2)
  }

  // If there's still a carry, add it at the front
  if (carry > 0) {
    result.unshift('1')
  }

  return result.join('')
}

/**
 * Demonstrates the relationship between binary, hexadecimal, and octal.
 */
export function demonstrateSystemRelationship(decimal: number): {
  decimal: number
  binary: string
  binaryGrouped: string
  hexadecimal: string
  octal: string
  explanation: string[]
} {
  const binary = decimal.toString(2)
  const binaryGrouped = binary.padStart(Math.ceil(binary.length / 4) * 4, '0')
    .match(/.{1,4}/g)?.join(' ') || binary
  const hexadecimal = decimal.toString(16).toUpperCase()
  const octal = decimal.toString(8)

  const explanation: string[] = [
    `Decimal ${decimal} can be represented in multiple number systems.`,
    `Binary: ${binary} (base-2, each digit is 0 or 1)`,
    `Binary grouped for hex: ${binaryGrouped} (each group of 4 bits = 1 hex digit)`,
    `Hexadecimal: ${hexadecimal} (base-16, each digit represents 4 bits)`,
    `Octal: ${octal} (base-8, each digit represents 3 bits)`,
    `Hexadecimal is useful because each digit represents exactly 4 bits (a nibble).`,
    `Octal is useful because each digit represents exactly 3 bits.`,
  ]

  return {
    decimal,
    binary,
    binaryGrouped,
    hexadecimal,
    octal,
    explanation,
  }
}

/**
 * Converts between systems showing the bit-level transformation.
 */
export function showBitLevelConversion(
  from: string,
  fromSystem: 'binary' | 'hexadecimal' | 'octal',
  toSystem: 'binary' | 'hexadecimal' | 'octal',
): {
  result: string
  steps: string[]
} {
  const steps: string[] = []

  let binary: string
  
  // Convert to binary first
  switch (fromSystem) {
    case 'binary':
      binary = from
      steps.push(`Input binary: ${from}`)
      break
    case 'hexadecimal':
      const hexParsed = parseHexadecimal(from)
      binary = hexToBinary(hexToString(hexParsed.digits))
      steps.push(`Input hexadecimal: ${from}`)
      steps.push(`Convert to binary: ${binary} (each hex digit → 4 bits)`)
      break
    case 'octal':
      const octalParsed = parseOctal(from)
      binary = octalToBinary(octalToString(octalParsed.digits))
      steps.push(`Input octal: ${from}`)
      steps.push(`Convert to binary: ${binary} (each octal digit → 3 bits)`)
      break
  }

  // Convert from binary to target
  let result: string
  switch (toSystem) {
    case 'binary':
      result = binary
      steps.push(`Target is binary: ${result}`)
      break
    case 'hexadecimal':
      const hexResult = binaryStringToHex(binary)
      if (!hexResult.success) {
        throw new Error(hexResult.error || 'Hex conversion failed')
      }
      result = hexResult.result as string
      steps.push(`Group binary into 4-bit nibbles: ${binary.padStart(Math.ceil(binary.length / 4) * 4, '0').match(/.{1,4}/g)?.join(' ')}`)
      steps.push(`Convert each nibble to hex: ${result}`)
      break
    case 'octal':
      const octalResult = binaryStringToOctal(binary)
      if (!octalResult.success) {
        throw new Error(octalResult.error || 'Octal conversion failed')
      }
      result = octalResult.result as string
      steps.push(`Group binary into 3-bit groups: ${binary.padStart(Math.ceil(binary.length / 3) * 3, '0').match(/.{1,3}/g)?.join(' ')}`)
      steps.push(`Convert each group to octal: ${result}`)
      break
  }

  return { result, steps }
}

/**
 * Analyzes the bit patterns in a number.
 */
export function analyzeBitPatterns(decimal: number): {
  binary: string
  bitCount: number
  onesCount: number
  zerosCount: number
  mostSignificantBit: number
  leastSignificantBit: number
  isPowerOfTwo: boolean
  nibbles: string[]
} {
  const binary = decimal.toString(2)
  const bits = binary.split('')
  
  const onesCount = bits.filter(b => b === '1').length
  const zerosCount = bits.filter(b => b === '0').length
  const mostSignificantBit = parseInt(bits[0]!, 10)
  const leastSignificantBit = parseInt(bits[bits.length - 1]!, 10)
  const isPowerOfTwo = onesCount === 1 && decimal > 0

  // Get nibbles
  const padded = binary.padStart(Math.ceil(binary.length / 4) * 4, '0')
  const nibbles = padded.match(/.{1,4}/g) || []

  return {
    binary,
    bitCount: bits.length,
    onesCount,
    zerosCount,
    mostSignificantBit,
    leastSignificantBit,
    isPowerOfTwo,
    nibbles,
  }
}
