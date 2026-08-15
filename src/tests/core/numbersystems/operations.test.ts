import { describe, it, expect } from 'vitest'
import type { Bit } from '../../../core/numbersystems/types'
import {
  addDecimal,
  subtractDecimal,
  multiplyDecimal,
  divideDecimal,
  addBinary,
  subtractBinary,
  multiplyBinary,
  divideBinary,
  bitwiseAnd,
  bitwiseOr,
  bitwiseXor,
} from '../../../core/numbersystems/operations'

describe('addDecimal', () => {
  it('adds two positive integers', () => {
    const result = addDecimal(5, 3)
    expect(result.success).toBe(true)
    expect(result.result).toBe(8)
    expect(result.overflow).toBe(false)
  })

  it('adds zero', () => {
    const result = addDecimal(5, 0)
    expect(result.success).toBe(true)
    expect(result.result).toBe(5)
    expect(result.overflow).toBe(false)
  })

  it('detects overflow', () => {
    const result = addDecimal(200, 100, { maxBits: 8 })
    expect(result.success).toBe(true)
    expect(result.result).toBe(300)
    expect(result.overflow).toBe(true)
  })

  it('rejects non-integer input', () => {
    const result = addDecimal(5.5, 3)
    expect(result.success).toBe(false)
    expect(result.error).toContain('must be integers')
  })

  it('rejects negative numbers when not allowed', () => {
    const result = addDecimal(-5, 3)
    expect(result.success).toBe(false)
    expect(result.error).toContain('Negative numbers not allowed')
  })
})

describe('subtractDecimal', () => {
  it('subtracts two positive integers', () => {
    const result = subtractDecimal(8, 3)
    expect(result.success).toBe(true)
    expect(result.result).toBe(5)
    expect(result.overflow).toBe(false)
  })

  it('subtracts to zero', () => {
    const result = subtractDecimal(5, 5)
    expect(result.success).toBe(true)
    expect(result.result).toBe(0)
    expect(result.overflow).toBe(false)
  })

  it('detects negative result when not allowed', () => {
    const result = subtractDecimal(3, 8)
    expect(result.success).toBe(true)
    expect(result.overflow).toBe(true)
    expect(result.error).toContain('negative number')
  })

  it('rejects non-integer input', () => {
    const result = subtractDecimal(8.5, 3)
    expect(result.success).toBe(false)
    expect(result.error).toContain('must be integers')
  })
})

describe('multiplyDecimal', () => {
  it('multiplies two positive integers', () => {
    const result = multiplyDecimal(5, 3)
    expect(result.success).toBe(true)
    expect(result.result).toBe(15)
    expect(result.overflow).toBe(false)
  })

  it('multiplies by zero', () => {
    const result = multiplyDecimal(5, 0)
    expect(result.success).toBe(true)
    expect(result.result).toBe(0)
    expect(result.overflow).toBe(false)
  })

  it('multiplies by one', () => {
    const result = multiplyDecimal(5, 1)
    expect(result.success).toBe(true)
    expect(result.result).toBe(5)
    expect(result.overflow).toBe(false)
  })

  it('detects overflow', () => {
    const result = multiplyDecimal(100, 100, { maxBits: 8 })
    expect(result.success).toBe(true)
    expect(result.result).toBe(10000)
    expect(result.overflow).toBe(true)
  })

  it('rejects non-integer input', () => {
    const result = multiplyDecimal(5.5, 3)
    expect(result.success).toBe(false)
    expect(result.error).toContain('must be integers')
  })
})

describe('divideDecimal', () => {
  it('divides two positive integers', () => {
    const result = divideDecimal(10, 2)
    expect(result.success).toBe(true)
    expect(result.result).toBe(5)
    expect(result.overflow).toBe(false)
  })

  it('performs integer division', () => {
    const result = divideDecimal(7, 2)
    expect(result.success).toBe(true)
    expect(result.result).toBe(3)
    expect(result.overflow).toBe(false)
  })

  it('rejects division by zero', () => {
    const result = divideDecimal(10, 0)
    expect(result.success).toBe(false)
    expect(result.error).toContain('Division by zero')
  })

  it('divides zero by non-zero', () => {
    const result = divideDecimal(0, 5)
    expect(result.success).toBe(true)
    expect(result.result).toBe(0)
    expect(result.overflow).toBe(false)
  })

  it('rejects non-integer input', () => {
    const result = divideDecimal(10.5, 2)
    expect(result.success).toBe(false)
    expect(result.error).toContain('must be integers')
  })
})

describe('addBinary', () => {
  it('adds two binary numbers', () => {
    const result = addBinary([1, 0, 1], [1, 1])
    expect(result.success).toBe(true)
    expect(result.result).toBe(8) // 5 + 3 = 8
    expect(result.overflow).toBe(false)
  })

  it('adds binary zeros', () => {
    const result = addBinary([1, 0, 1], [0])
    expect(result.success).toBe(true)
    expect(result.result).toBe(5)
    expect(result.overflow).toBe(false)
  })

  it('detects overflow', () => {
    const result = addBinary([1, 1, 1, 1, 1, 1, 1, 1], [1], { maxBits: 8 })
    expect(result.success).toBe(true)
    expect(result.result).toBe(256) // 255 + 1 = 256
    expect(result.overflow).toBe(true)
  })

  it('rejects invalid bit arrays', () => {
    const result = addBinary([1, 0, 2] as unknown as Bit[], [1, 1])
    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid bit arrays')
  })

  it('rejects empty arrays', () => {
    const result = addBinary([], [1, 1])
    expect(result.success).toBe(false)
    expect(result.error).toContain('non-empty bit arrays')
  })
})

describe('subtractBinary', () => {
  it('subtracts two binary numbers', () => {
    const result = subtractBinary([1, 1, 1], [1, 0])
    expect(result.success).toBe(true)
    expect(result.result).toBe(5) // 7 - 2 = 5
    expect(result.overflow).toBe(false)
  })

  it('subtracts to zero', () => {
    const result = subtractBinary([1, 0, 1], [1, 0, 1])
    expect(result.success).toBe(true)
    expect(result.result).toBe(0)
    expect(result.overflow).toBe(false)
  })

  it('detects negative result when not allowed', () => {
    const result = subtractBinary([1, 0], [1, 1, 1])
    expect(result.success).toBe(true)
    expect(result.overflow).toBe(true)
    expect(result.error).toContain('negative number')
  })

  it('rejects invalid bit arrays', () => {
    const result = subtractBinary([1, 0, 2] as unknown as Bit[], [1, 1])
    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid bit arrays')
  })
})

describe('multiplyBinary', () => {
  it('multiplies two binary numbers', () => {
    const result = multiplyBinary([1, 0, 1], [1, 1])
    expect(result.success).toBe(true)
    expect(result.result).toBe(15) // 5 * 3 = 15
    expect(result.overflow).toBe(false)
  })

  it('multiplies by zero', () => {
    const result = multiplyBinary([1, 0, 1], [0])
    expect(result.success).toBe(true)
    expect(result.result).toBe(0)
    expect(result.overflow).toBe(false)
  })

  it('multiplies by one', () => {
    const result = multiplyBinary([1, 0, 1], [1])
    expect(result.success).toBe(true)
    expect(result.result).toBe(5)
    expect(result.overflow).toBe(false)
  })

  it('detects overflow', () => {
    const result = multiplyBinary([1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], { maxBits: 8 })
    expect(result.success).toBe(true)
    expect(result.result).toBe(65025) // 255 * 255 = 65025
    expect(result.overflow).toBe(true)
  })

  it('rejects invalid bit arrays', () => {
    const result = multiplyBinary([1, 0, 2] as unknown as Bit[], [1, 1])
    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid bit arrays')
  })
})

describe('divideBinary', () => {
  it('divides two binary numbers', () => {
    const result = divideBinary([1, 0, 1, 0], [1, 0])
    expect(result.success).toBe(true)
    expect(result.result).toBe(5) // 10 / 2 = 5
    expect(result.overflow).toBe(false)
  })

  it('performs integer division', () => {
    const result = divideBinary([1, 1, 1], [1, 0])
    expect(result.success).toBe(true)
    expect(result.result).toBe(3) // 7 / 2 = 3
    expect(result.overflow).toBe(false)
  })

  it('rejects division by zero', () => {
    const result = divideBinary([1, 0, 1], [0])
    expect(result.success).toBe(false)
    expect(result.error).toContain('Division by zero')
  })

  it('divides zero by non-zero', () => {
    const result = divideBinary([0], [1, 0, 1])
    expect(result.success).toBe(true)
    expect(result.result).toBe(0)
    expect(result.overflow).toBe(false)
  })

  it('rejects invalid bit arrays', () => {
    const result = divideBinary([1, 0, 2] as unknown as Bit[], [1, 1])
    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid bit arrays')
  })
})

describe('bitwiseAnd', () => {
  it('performs bitwise AND on binary numbers', () => {
    const result = bitwiseAnd([1, 1, 0, 0], [1, 0, 1, 0])
    expect(result.success).toBe(true)
    expect(result.result).toBe(8) // 12 & 10 = 8 (1100 & 1010 = 1000)
    expect(result.overflow).toBe(false)
  })

  it('handles different length arrays', () => {
    const result = bitwiseAnd([1, 1], [1, 0, 1, 0])
    expect(result.success).toBe(true)
    expect(result.result).toBe(8) // [1,1] padded to [1,1,0,0] (12), [1,0,1,0] (10): 1100 & 1010 = 1000 = 8
  })

  it('AND with zeros results in zero', () => {
    const result = bitwiseAnd([1, 1, 1], [0, 0, 0])
    expect(result.success).toBe(true)
    expect(result.result).toBe(0)
  })

  it('rejects invalid bit arrays', () => {
    const result = bitwiseAnd([1, 0, 2] as unknown as Bit[], [1, 1])
    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid bit arrays')
  })
})

describe('bitwiseOr', () => {
  it('performs bitwise OR on binary numbers', () => {
    const result = bitwiseOr([1, 1, 0, 0], [1, 0, 1, 0])
    expect(result.success).toBe(true)
    expect(result.result).toBe(14) // 12 | 10 = 14 (1100 | 1010 = 1110)
    expect(result.overflow).toBe(false)
  })

  it('handles different length arrays', () => {
    const result = bitwiseOr([1, 1], [1, 0, 1, 0])
    expect(result.success).toBe(true)
    expect(result.result).toBe(14) // [1,1] padded to [1,1,0,0] (12), [1,0,1,0] (10): 1100 | 1010 = 1110 = 14
  })

  it('OR with zeros results in original', () => {
    const result = bitwiseOr([1, 1, 1], [0, 0, 0])
    expect(result.success).toBe(true)
    expect(result.result).toBe(7)
  })

  it('rejects invalid bit arrays', () => {
    const result = bitwiseOr([1, 0, 2] as unknown as Bit[], [1, 1])
    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid bit arrays')
  })
})

describe('bitwiseXor', () => {
  it('performs bitwise XOR on binary numbers', () => {
    const result = bitwiseXor([1, 1, 0, 0], [1, 0, 1, 0])
    expect(result.success).toBe(true)
    expect(result.result).toBe(6) // 12 ^ 10 = 6 (1100 ^ 1010 = 0110)
    expect(result.overflow).toBe(false)
  })

  it('handles different length arrays', () => {
    const result = bitwiseXor([1, 1], [1, 0, 1, 0])
    expect(result.success).toBe(true)
    expect(result.result).toBe(6) // [1,1] padded to [1,1,0,0] (12), [1,0,1,0] (10): 1100 ^ 1010 = 0110 = 6
  })

  it('XOR with itself results in zero', () => {
    const result = bitwiseXor([1, 1, 1], [1, 1, 1])
    expect(result.success).toBe(true)
    expect(result.result).toBe(0)
  })

  it('rejects invalid bit arrays', () => {
    const result = bitwiseXor([1, 0, 2] as unknown as Bit[], [1, 1])
    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid bit arrays')
  })
})
