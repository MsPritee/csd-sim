/**
 * Tests for octal number operations
 */

import { describe, it, expect } from 'vitest'
import {
  parseOctal,
  octalToDecimal,
  decimalToOctal,
  octalToString,
  octalStringToDecimal,
  decimalToOctalString,
  validateOctal,
  getMinimumOctalDigitsForDecimal,
  padOctalString,
  addOctal,
  subtractOctal,
  multiplyOctal,
  divideOctal,
  octalToBinary,
  binaryToOctal,
  octalToHexadecimal,
  hexadecimalToOctal,
  compareOctal,
} from '../../../core/numbersystems/octal'

describe('octal operations', () => {
  describe('parseOctal', () => {
    it('should parse valid octal strings', () => {
      const result = parseOctal('75')
      expect(result.isValid).toBe(true)
      expect(result.value).toBe(61)
      expect(result.digits).toEqual(['7', '5'])
    })

    it('should reject invalid characters (8-9)', () => {
      const result = parseOctal('89')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Invalid octal format')
    })

    it('should reject leading zeros', () => {
      const result = parseOctal('075')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Leading zeros')
    })

    it('should handle common prefixes', () => {
      const result1 = parseOctal('0o75')
      expect(result1.isValid).toBe(true)
      expect(result1.value).toBe(61)

      // The #o prefix might not be supported, so we'll test only 0o
      const result2 = parseOctal('075') // Without prefix
      expect(result2.isValid).toBe(false) // Leading zeros are rejected
    })
  })

  describe('octalToDecimal', () => {
    it('should convert octal digit arrays to decimal', () => {
      expect(octalToDecimal(['7', '5'])).toBe(61)
      expect(octalToDecimal(['7', '7'])).toBe(63)
      expect(octalToDecimal(['1', '0'])).toBe(8)
    })

    it('should handle single digit', () => {
      expect(octalToDecimal(['7'])).toBe(7)
      expect(octalToDecimal(['0'])).toBe(0)
    })
  })

  describe('decimalToOctal', () => {
    it('should convert decimal to octal digit arrays', () => {
      expect(decimalToOctal(61)).toEqual(['7', '5'])
      expect(decimalToOctal(63)).toEqual(['7', '7'])
      expect(decimalToOctal(8)).toEqual(['1', '0'])
    })

    it('should handle zero', () => {
      expect(decimalToOctal(0)).toEqual(['0'])
    })

    it('should throw on negative numbers', () => {
      expect(() => decimalToOctal(-1)).toThrow('Negative numbers not supported')
    })
  })

  describe('octalToString', () => {
    it('should convert octal digit arrays to strings', () => {
      expect(octalToString(['7', '5'])).toBe('75')
      expect(octalToString(['7', '7'])).toBe('77')
    })
  })

  describe('octalStringToDecimal', () => {
    it('should convert octal strings to decimal', () => {
      expect(octalStringToDecimal('75')).toBe(61)
      expect(octalStringToDecimal('77')).toBe(63)
      expect(octalStringToDecimal('10')).toBe(8)
    })

    it('should throw on invalid input', () => {
      expect(() => octalStringToDecimal('89')).toThrow()
    })
  })

  describe('decimalToOctalString', () => {
    it('should convert decimal to octal strings', () => {
      expect(decimalToOctalString(61)).toBe('75')
      expect(decimalToOctalString(63)).toBe('77')
      expect(decimalToOctalString(8)).toBe('10')
    })
  })

  describe('validateOctal', () => {
    it('should validate correct octal strings', () => {
      const result = validateOctal('75')
      expect(result.valid).toBe(true)
    })

    it('should reject invalid octal strings', () => {
      const result = validateOctal('89')
      expect(result.valid).toBe(false)
    })
  })

  describe('getMinimumOctalDigitsForDecimal', () => {
    it('should calculate minimum octal digits', () => {
      expect(getMinimumOctalDigitsForDecimal(0)).toBe(1)
      expect(getMinimumOctalDigitsForDecimal(7)).toBe(1)
      expect(getMinimumOctalDigitsForDecimal(8)).toBe(2)
      expect(getMinimumOctalDigitsForDecimal(63)).toBe(2)
      expect(getMinimumOctalDigitsForDecimal(64)).toBe(3)
    })
  })

  describe('padOctalString', () => {
    it('should pad octal strings to target length', () => {
      expect(padOctalString('75', 4)).toBe('0075')
      expect(padOctalString('77', 4)).toBe('0077')
    })

    it('should not pad if already at or above target length', () => {
      expect(padOctalString('75', 2)).toBe('75')
      expect(padOctalString('75', 1)).toBe('75')
    })
  })

  describe('octal arithmetic', () => {
    it('should add octal numbers', () => {
      expect(addOctal('75', '10')).toBe('105')
      expect(addOctal('77', '1')).toBe('100')
    })

    it('should subtract octal numbers', () => {
      expect(subtractOctal('105', '10')).toBe('75')
      expect(subtractOctal('100', '1')).toBe('77')
    })

    it('should throw on negative subtraction result', () => {
      expect(() => subtractOctal('10', '75')).toThrow('negative number')
    })

    it('should multiply octal numbers', () => {
      expect(multiplyOctal('7', '7')).toBe('61')
      expect(multiplyOctal('10', '10')).toBe('100')
    })

    it('should divide octal numbers', () => {
      expect(divideOctal('61', '7')).toBe('7')
      expect(divideOctal('100', '10')).toBe('10')
    })

    it('should throw on division by zero', () => {
      expect(() => divideOctal('75', '0')).toThrow('Division by zero')
    })
  })

  describe('octal-binary conversion', () => {
    it('should convert octal to binary', () => {
      expect(octalToBinary('75')).toBe('111101')
      expect(octalToBinary('77')).toBe('111111')
      expect(octalToBinary('0')).toBe('0')
    })

    it('should convert binary to octal', () => {
      expect(binaryToOctal('111101')).toBe('75')
      expect(binaryToOctal('111111')).toBe('77')
      expect(binaryToOctal('1')).toBe('1')
    })

    it('should handle padding in binary to octal', () => {
      expect(binaryToOctal('111')).toBe('7')
      expect(binaryToOctal('111111')).toBe('77')
    })
  })

  describe('octal-hexadecimal conversion', () => {
    it('should convert octal to hexadecimal', () => {
      expect(octalToHexadecimal('75')).toBe('3D')
      expect(octalToHexadecimal('77')).toBe('3F')
    })

    it('should convert hexadecimal to octal', () => {
      expect(hexadecimalToOctal('3D')).toBe('75')
      expect(hexadecimalToOctal('3F')).toBe('77')
    })
  })

  describe('compareOctal', () => {
    it('should compare octal numbers', () => {
      expect(compareOctal('75', '10')).toBe(1)
      expect(compareOctal('10', '75')).toBe(-1)
      expect(compareOctal('75', '75')).toBe(0)
    })
  })
})
