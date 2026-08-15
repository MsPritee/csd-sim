import { describe, it, expect } from 'vitest'
import {
  validateDecimalString,
  parseDecimal,
  validateDecimalRange,
  checkDecimalOverflow,
  getMaxDecimalForBits,
  formatDecimal,
  isValidDecimal,
} from '../../../core/numbersystems/decimal'

describe('validateDecimalString', () => {
  it('accepts valid decimal strings', () => {
    expect(validateDecimalString('123').valid).toBe(true)
    expect(validateDecimalString('0').valid).toBe(true)
    expect(validateDecimalString('42').valid).toBe(true)
  })

  it('rejects empty strings', () => {
    const result = validateDecimalString('')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('non-empty string')
  })

  it('rejects non-numeric strings', () => {
    const result = validateDecimalString('abc')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Invalid decimal format')
  })

  it('rejects strings with leading zeros', () => {
    const result = validateDecimalString('0123')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('no leading zeros')
  })

  it('rejects negative zero', () => {
    const result = validateDecimalString('-0')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('negative zero')
  })

  it('rejects decimal points', () => {
    const result = validateDecimalString('12.5')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Invalid decimal format')
  })
})

describe('parseDecimal', () => {
  it('parses valid decimal strings', () => {
    const result = parseDecimal('42')
    expect(result.isValid).toBe(true)
    expect(result.value).toBe(42)
  })

  it('parses zero', () => {
    const result = parseDecimal('0')
    expect(result.isValid).toBe(true)
    expect(result.value).toBe(0)
  })

  it('rejects invalid format', () => {
    const result = parseDecimal('abc')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('Invalid decimal format')
  })

  it('rejects negative numbers when not allowed', () => {
    const result = parseDecimal('-42')
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('Negative numbers not allowed')
  })

  it('accepts negative numbers when allowed', () => {
    const result = parseDecimal('-42', { allowNegative: true })
    expect(result.isValid).toBe(true)
    expect(result.value).toBe(-42)
  })

  it('rejects numbers exceeding maximum value', () => {
    const result = parseDecimal('999', { maxDecimalValue: 100 })
    expect(result.isValid).toBe(false)
    expect(result.error).toContain('exceeds maximum')
  })
})

describe('validateDecimalRange', () => {
  it('validates numbers within range', () => {
    const result = validateDecimalRange(5, 0, 10)
    expect(result.valid).toBe(true)
    expect(result.withinRange).toBe(true)
  })

  it('rejects numbers below minimum', () => {
    const result = validateDecimalRange(-1, 0, 10)
    expect(result.valid).toBe(true)
    expect(result.withinRange).toBe(false)
    expect(result.error).toContain('outside range')
  })

  it('rejects numbers above maximum', () => {
    const result = validateDecimalRange(15, 0, 10)
    expect(result.valid).toBe(true)
    expect(result.withinRange).toBe(false)
    expect(result.error).toContain('outside range')
  })

  it('rejects non-integer values', () => {
    const result = validateDecimalRange(5.5, 0, 10)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('must be an integer')
  })
})

describe('checkDecimalOverflow', () => {
  it('detects overflow for large numbers', () => {
    expect(checkDecimalOverflow(256, 8)).toBe(true)
    expect(checkDecimalOverflow(16, 4)).toBe(true)
  })

  it('does not detect overflow for valid numbers', () => {
    expect(checkDecimalOverflow(255, 8)).toBe(false)
    expect(checkDecimalOverflow(15, 4)).toBe(false)
  })

  it('always detects overflow for negative numbers', () => {
    expect(checkDecimalOverflow(-1, 8)).toBe(true)
  })
})

describe('getMaxDecimalForBits', () => {
  it('calculates maximum decimal value for given bits', () => {
    expect(getMaxDecimalForBits(1)).toBe(1)
    expect(getMaxDecimalForBits(4)).toBe(15)
    expect(getMaxDecimalForBits(8)).toBe(255)
    expect(getMaxDecimalForBits(16)).toBe(65535)
  })

  it('returns 0 for zero bits', () => {
    expect(getMaxDecimalForBits(0)).toBe(0)
  })
})

describe('formatDecimal', () => {
  it('formats decimal numbers as strings', () => {
    expect(formatDecimal(42)).toBe('42')
    expect(formatDecimal(0)).toBe('0')
    expect(formatDecimal(123)).toBe('123')
  })
})

describe('isValidDecimal', () => {
  it('validates positive integers', () => {
    expect(isValidDecimal(42)).toBe(true)
    expect(isValidDecimal(0)).toBe(true)
  })

  it('rejects negative integers when not allowed', () => {
    expect(isValidDecimal(-42)).toBe(false)
  })

  it('accepts negative integers when allowed', () => {
    expect(isValidDecimal(-42, { allowNegative: true })).toBe(true)
  })

  it('rejects non-integer values', () => {
    expect(isValidDecimal(42.5)).toBe(false)
    expect(isValidDecimal(NaN)).toBe(false)
  })

  it('respects maximum value constraint', () => {
    expect(isValidDecimal(150, { maxDecimalValue: 100 })).toBe(false)
    expect(isValidDecimal(50, { maxDecimalValue: 100 })).toBe(true)
  })
})
