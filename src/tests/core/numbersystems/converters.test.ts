import { describe, it, expect } from 'vitest'
import type { Bit } from '../../../core/numbersystems/types'
import {
  decimalToBinaryString,
  decimalToBinaryBits,
  binaryStringToDecimal,
  binaryBitsToDecimal,
  binaryStringToBits,
  padBinaryString,
  validateConversionRange,
  getMinimumBitsForDecimal,
} from '../../../core/numbersystems/converters'

describe('decimalToBinaryString', () => {
  it('converts decimal to binary string', () => {
    const result = decimalToBinaryString(5)
    expect(result.success).toBe(true)
    expect(result.result).toBe('101')
  })

  it('converts zero to binary string', () => {
    const result = decimalToBinaryString(0)
    expect(result.success).toBe(true)
    expect(result.result).toBe('0')
  })

  it('converts one to binary string', () => {
    const result = decimalToBinaryString(1)
    expect(result.success).toBe(true)
    expect(result.result).toBe('1')
  })

  it('converts larger numbers', () => {
    const result = decimalToBinaryString(255)
    expect(result.success).toBe(true)
    expect(result.result).toBe('11111111')
  })

  it('rejects non-integer input', () => {
    const result = decimalToBinaryString(5.5)
    expect(result.success).toBe(false)
    expect(result.error).toContain('must be an integer')
  })

  it('rejects negative numbers when not allowed', () => {
    const result = decimalToBinaryString(-5)
    expect(result.success).toBe(false)
    expect(result.error).toContain('Negative numbers not allowed')
  })

  it('detects overflow for large numbers', () => {
    const result = decimalToBinaryString(256, { maxBits: 8 })
    expect(result.success).toBe(false)
    expect(result.error).toContain('exceeds maximum value')
  })
})

describe('decimalToBinaryBits', () => {
  it('converts decimal to bit array', () => {
    const result = decimalToBinaryBits(5)
    expect(result.success).toBe(true)
    expect(result.result).toEqual([1, 0, 1])
  })

  it('converts zero to bit array', () => {
    const result = decimalToBinaryBits(0)
    expect(result.success).toBe(true)
    expect(result.result).toEqual([0])
  })

  it('converts larger numbers', () => {
    const result = decimalToBinaryBits(255)
    expect(result.success).toBe(true)
    expect(result.result).toEqual([1, 1, 1, 1, 1, 1, 1, 1])
  })

  it('rejects non-integer input', () => {
    const result = decimalToBinaryBits(5.5)
    expect(result.success).toBe(false)
    expect(result.error).toContain('must be an integer')
  })

  it('detects overflow for large numbers', () => {
    const result = decimalToBinaryBits(256, { maxBits: 8 })
    expect(result.success).toBe(false)
    expect(result.error).toContain('exceeds maximum value')
  })
})

describe('binaryStringToDecimal', () => {
  it('converts binary string to decimal', () => {
    const result = binaryStringToDecimal('101')
    expect(result.success).toBe(true)
    expect(result.result).toBe(5)
  })

  it('converts zero to decimal', () => {
    const result = binaryStringToDecimal('0')
    expect(result.success).toBe(true)
    expect(result.result).toBe(0)
  })

  it('converts larger binary strings', () => {
    const result = binaryStringToDecimal('11111111')
    expect(result.success).toBe(true)
    expect(result.result).toBe(255)
  })

  it('rejects empty string', () => {
    const result = binaryStringToDecimal('')
    expect(result.success).toBe(false)
    expect(result.error).toContain('non-empty string')
  })

  it('rejects invalid binary format', () => {
    const result = binaryStringToDecimal('102')
    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid binary format')
  })
})

describe('binaryBitsToDecimal', () => {
  it('converts bit array to decimal', () => {
    const result = binaryBitsToDecimal([1, 0, 1])
    expect(result.success).toBe(true)
    expect(result.result).toBe(5)
  })

  it('converts zero bits to decimal', () => {
    const result = binaryBitsToDecimal([0])
    expect(result.success).toBe(true)
    expect(result.result).toBe(0)
  })

  it('converts larger bit arrays', () => {
    const result = binaryBitsToDecimal([1, 1, 1, 1, 1, 1, 1, 1])
    expect(result.success).toBe(true)
    expect(result.result).toBe(255)
  })

  it('rejects empty array', () => {
    const result = binaryBitsToDecimal([])
    expect(result.success).toBe(false)
    expect(result.error).toContain('non-empty bit array')
  })

  it('rejects invalid bit values', () => {
    const result = binaryBitsToDecimal([1, 0, 2] as unknown as Bit[])
    expect(result.success).toBe(false)
    expect(result.error).toContain('must contain only 0s and 1s')
  })
})

describe('binaryStringToBits', () => {
  it('converts binary string to bit array', () => {
    const result = binaryStringToBits('101')
    expect(result.success).toBe(true)
    expect(result.result).toEqual([1, 0, 1])
  })

  it('converts zero to bit array', () => {
    const result = binaryStringToBits('0')
    expect(result.success).toBe(true)
    expect(result.result).toEqual([0])
  })

  it('rejects empty string', () => {
    const result = binaryStringToBits('')
    expect(result.success).toBe(false)
    expect(result.error).toContain('non-empty string')
  })

  it('rejects invalid binary format', () => {
    const result = binaryStringToBits('102')
    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid binary format')
  })
})

describe('padBinaryString', () => {
  it('pads binary string to target length', () => {
    const result = padBinaryString('101', 8)
    expect(result.success).toBe(true)
    expect(result.result).toBe('00000101')
  })

  it('does not pad if already at target length', () => {
    const result = padBinaryString('101', 3)
    expect(result.success).toBe(true)
    expect(result.result).toBe('101')
  })

  it('does not pad if longer than target', () => {
    const result = padBinaryString('10101', 3)
    expect(result.success).toBe(true)
    expect(result.result).toBe('10101')
  })

  it('rejects empty string', () => {
    const result = padBinaryString('', 8)
    expect(result.success).toBe(false)
    expect(result.error).toContain('non-empty string')
  })

  it('rejects invalid binary format', () => {
    const result = padBinaryString('102', 8)
    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid binary format')
  })
})

describe('validateConversionRange', () => {
  it('validates conversion within range', () => {
    const result = validateConversionRange(5, 8)
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('rejects negative numbers', () => {
    const result = validateConversionRange(-5, 8)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Negative numbers not supported')
  })

  it('rejects numbers exceeding max bits', () => {
    const result = validateConversionRange(256, 8)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('exceeds maximum')
  })

  it('validates edge case (max value)', () => {
    const result = validateConversionRange(255, 8)
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })
})

describe('getMinimumBitsForDecimal', () => {
  it('calculates minimum bits for decimal', () => {
    expect(getMinimumBitsForDecimal(0)).toBe(1)
    expect(getMinimumBitsForDecimal(1)).toBe(1)
    expect(getMinimumBitsForDecimal(2)).toBe(2)
    expect(getMinimumBitsForDecimal(5)).toBe(3)
    expect(getMinimumBitsForDecimal(8)).toBe(4)
    expect(getMinimumBitsForDecimal(255)).toBe(8)
  })

  it('throws error for negative numbers', () => {
    expect(() => getMinimumBitsForDecimal(-1)).toThrow('Negative numbers not supported')
  })
})
