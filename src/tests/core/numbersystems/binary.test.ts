import { describe, it, expect } from 'vitest'
import type { Bit } from '../../../core/numbersystems/types'
import {
  validateBinaryString,
  parseBinary,
  bitsToString,
  decimalToBits,
  bitsToDecimal,
  leftShift,
  rightShift,
  rotateLeft,
  rotateRight,
  complement,
  countSetBits,
  getBitAt,
  setBitAt,
  isValidBinary,
} from '../../../core/numbersystems/binary'

describe('validateBinaryString', () => {
  it('accepts valid binary strings', () => {
    expect(validateBinaryString('101').valid).toBe(true)
    expect(validateBinaryString('0').valid).toBe(true)
    expect(validateBinaryString('1').valid).toBe(true)
    expect(validateBinaryString('11010').valid).toBe(true)
  })

  it('rejects empty strings', () => {
    const result = validateBinaryString('')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('non-empty string')
  })

  it('rejects strings with non-binary characters', () => {
    const result = validateBinaryString('102')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('only 0s and 1s')
  })

  it('rejects strings with leading zeros', () => {
    const result = validateBinaryString('0101')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('no leading zeros')
  })
})

describe('parseBinary', () => {
  it('parses valid binary strings', () => {
    const result = parseBinary('101')
    expect(result.isValid).toBe(true)
    expect(result.bits).toEqual([1, 0, 1])
  })

  it('parses single bit', () => {
    const result = parseBinary('1')
    expect(result.isValid).toBe(true)
    expect(result.bits).toEqual([1])
  })

  it('parses zero', () => {
    const result = parseBinary('0')
    expect(result.isValid).toBe(true)
    expect(result.bits).toEqual([0])
  })

  it('rejects invalid format', () => {
    const result = parseBinary('102')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('Invalid binary format')
  })

  it('rejects strings exceeding max bits', () => {
    const result = parseBinary('1'.repeat(33), { maxBits: 32 })
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('exceeds maximum length')
  })
})

describe('bitsToString', () => {
  it('converts bit arrays to strings', () => {
    expect(bitsToString([1, 0, 1])).toBe('101')
    expect(bitsToString([0])).toBe('0')
    expect(bitsToString([1, 1, 1, 1])).toBe('1111')
  })
})

describe('decimalToBits', () => {
  it('converts decimal to bits', () => {
    expect(decimalToBits(5)).toEqual([1, 0, 1])
    expect(decimalToBits(0)).toEqual([0])
    expect(decimalToBits(1)).toEqual([1])
    expect(decimalToBits(15)).toEqual([1, 1, 1, 1])
  })

  it('pads to specified bit length', () => {
    expect(decimalToBits(5, 8)).toEqual([0, 0, 0, 0, 0, 1, 0, 1])
    expect(decimalToBits(1, 4)).toEqual([0, 0, 0, 1])
  })

  it('throws error for negative numbers', () => {
    expect(() => decimalToBits(-1)).toThrow('Negative numbers not supported')
  })
})

describe('bitsToDecimal', () => {
  it('converts bits to decimal', () => {
    expect(bitsToDecimal([1, 0, 1])).toBe(5)
    expect(bitsToDecimal([0])).toBe(0)
    expect(bitsToDecimal([1])).toBe(1)
    expect(bitsToDecimal([1, 1, 1, 1])).toBe(15)
  })

  it('handles empty array', () => {
    expect(bitsToDecimal([])).toBe(0)
  })
})

describe('leftShift', () => {
  it('shifts bits left by specified positions', () => {
    const result = leftShift([1, 0, 1], 2)
    expect(result.success).toBe(true)
    expect(result.result).toEqual([1, 0, 1, 0, 0])
  })

  it('returns original for zero shift', () => {
    const result = leftShift([1, 0, 1], 0)
    expect(result.success).toBe(true)
    expect(result.result).toEqual([1, 0, 1])
  })

  it('rejects negative shift positions', () => {
    const result = leftShift([1, 0, 1], -1)
    expect(result.success).toBe(false)
    expect(result.error).toContain('non-negative')
  })
})

describe('rightShift', () => {
  it('shifts bits right by specified positions', () => {
    const result = rightShift([1, 0, 1, 0, 0], 2)
    expect(result.success).toBe(true)
    expect(result.result).toEqual([1, 0, 1])
  })

  it('returns single zero when shifting beyond length', () => {
    const result = rightShift([1, 0, 1], 5)
    expect(result.success).toBe(true)
    expect(result.result).toEqual([0])
  })

  it('returns original for zero shift', () => {
    const result = rightShift([1, 0, 1], 0)
    expect(result.success).toBe(true)
    expect(result.result).toEqual([1, 0, 1])
  })

  it('rejects negative shift positions', () => {
    const result = rightShift([1, 0, 1], -1)
    expect(result.success).toBe(false)
    expect(result.error).toContain('non-negative')
  })
})

describe('rotateLeft', () => {
  it('rotates bits left by specified positions', () => {
    const result = rotateLeft([1, 0, 1, 1], 1)
    expect(result.success).toBe(true)
    expect(result.result).toEqual([0, 1, 1, 1])
  })

  it('handles rotation greater than array length', () => {
    const result = rotateLeft([1, 0, 1, 1], 5)
    expect(result.success).toBe(true)
    expect(result.result).toEqual([0, 1, 1, 1])
  })

  it('returns original for zero rotation', () => {
    const result = rotateLeft([1, 0, 1], 0)
    expect(result.success).toBe(true)
    expect(result.result).toEqual([1, 0, 1])
  })

  it('rejects empty bit array', () => {
    const result = rotateLeft([], 1)
    expect(result.success).toBe(false)
    expect(result.error).toContain('empty bit array')
  })
})

describe('rotateRight', () => {
  it('rotates bits right by specified positions', () => {
    const result = rotateRight([1, 0, 1, 1], 1)
    expect(result.success).toBe(true)
    expect(result.result).toEqual([1, 1, 0, 1])
  })

  it('handles rotation greater than array length', () => {
    const result = rotateRight([1, 0, 1, 1], 5)
    expect(result.success).toBe(true)
    expect(result.result).toEqual([1, 1, 0, 1])
  })

  it('returns original for zero rotation', () => {
    const result = rotateRight([1, 0, 1], 0)
    expect(result.success).toBe(true)
    expect(result.result).toEqual([1, 0, 1])
  })

  it('rejects empty bit array', () => {
    const result = rotateRight([], 1)
    expect(result.success).toBe(false)
    expect(result.error).toContain('empty bit array')
  })
})

describe('complement', () => {
  it('performs bitwise complement', () => {
    const result = complement([1, 0, 1, 0])
    expect(result.success).toBe(true)
    expect(result.result).toEqual([0, 1, 0, 1])
  })

  it('complements all zeros', () => {
    const result = complement([0, 0, 0])
    expect(result.success).toBe(true)
    expect(result.result).toEqual([1, 1, 1])
  })

  it('complements all ones', () => {
    const result = complement([1, 1, 1])
    expect(result.success).toBe(true)
    expect(result.result).toEqual([0, 0, 0])
  })
})

describe('countSetBits', () => {
  it('counts set bits (1s)', () => {
    expect(countSetBits([1, 0, 1, 1])).toBe(3)
    expect(countSetBits([0, 0, 0])).toBe(0)
    expect(countSetBits([1, 1, 1])).toBe(3)
    expect(countSetBits([1, 0, 0, 1, 0, 1])).toBe(3)
  })
})

describe('getBitAt', () => {
  it('gets bit at valid position', () => {
    expect(getBitAt([1, 0, 1], 0)).toBe(1)
    expect(getBitAt([1, 0, 1], 1)).toBe(0)
    expect(getBitAt([1, 0, 1], 2)).toBe(1)
  })

  it('throws error for invalid position', () => {
    expect(() => getBitAt([1, 0, 1], 5)).toThrow('out of range')
    expect(() => getBitAt([1, 0, 1], -1)).toThrow('out of range')
  })
})

describe('setBitAt', () => {
  it('sets bit at valid position', () => {
    expect(setBitAt([1, 0, 1], 1, 1)).toEqual([1, 1, 1])
    expect(setBitAt([1, 0, 1], 0, 0)).toEqual([0, 0, 1])
  })

  it('throws error for invalid position', () => {
    expect(() => setBitAt([1, 0, 1], 5, 1)).toThrow('out of range')
    expect(() => setBitAt([1, 0, 1], -1, 1)).toThrow('out of range')
  })
})

describe('isValidBinary', () => {
  it('validates correct bit arrays', () => {
    expect(isValidBinary([1, 0, 1])).toBe(true)
    expect(isValidBinary([0])).toBe(true)
    expect(isValidBinary([1, 1, 1, 1])).toBe(true)
  })

  it('rejects arrays with invalid bits', () => {
    expect(isValidBinary([1, 0, 2] as unknown as Bit[])).toBe(false)
    expect(isValidBinary([1, -1, 0] as unknown as Bit[])).toBe(false)
  })

  it('rejects empty arrays', () => {
    expect(isValidBinary([])).toBe(false)
  })

  it('respects max bits constraint', () => {
    expect(isValidBinary([1, 0, 1], { maxBits: 2 })).toBe(false)
    expect(isValidBinary([1, 0], { maxBits: 2 })).toBe(true)
  })
})
