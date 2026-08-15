/**
 * Tests for hexadecimal number operations
 */

import { describe, it, expect } from 'vitest'
import {
  parseHexadecimal,
  hexToDecimal,
  decimalToHex,
  hexToString,
  hexStringToDecimal,
  decimalToHexString,
  validateHexadecimal,
  getMinimumHexDigitsForDecimal,
  padHexString,
  addHexadecimal,
  subtractHexadecimal,
  multiplyHexadecimal,
  divideHexadecimal,
  hexToBinary,
  binaryToHex,
  compareHexadecimal,
} from '../../../core/numbersystems/hexadecimal'

describe('hexadecimal operations', () => {
  describe('parseHexadecimal', () => {
    it('should parse valid hexadecimal strings', () => {
      const result = parseHexadecimal('A3')
      expect(result.isValid).toBe(true)
      expect(result.value).toBe(163)
      expect(result.digits).toEqual(['A', '3'])
    })

    it('should handle lowercase input', () => {
      const result = parseHexadecimal('a3')
      expect(result.isValid).toBe(true)
      expect(result.value).toBe(163)
    })

    it('should reject invalid characters', () => {
      const result = parseHexadecimal('G1')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Invalid hexadecimal format')
    })

    it('should reject leading zeros', () => {
      const result = parseHexadecimal('0A3')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Leading zeros')
    })

    it('should handle common prefixes', () => {
      const result1 = parseHexadecimal('0xA3')
      expect(result1.isValid).toBe(true)
      expect(result1.value).toBe(163)

      const result2 = parseHexadecimal('#A3')
      expect(result2.isValid).toBe(true)
      expect(result2.value).toBe(163)
    })
  })

  describe('hexToDecimal', () => {
    it('should convert hex digit arrays to decimal', () => {
      expect(hexToDecimal(['A', '3'])).toBe(163)
      expect(hexToDecimal(['F', 'F'])).toBe(255)
      expect(hexToDecimal(['1', '0'])).toBe(16)
    })

    it('should handle single digit', () => {
      expect(hexToDecimal(['A'])).toBe(10)
      expect(hexToDecimal(['F'])).toBe(15)
    })
  })

  describe('decimalToHex', () => {
    it('should convert decimal to hex digit arrays', () => {
      expect(decimalToHex(163)).toEqual(['A', '3'])
      expect(decimalToHex(255)).toEqual(['F', 'F'])
      expect(decimalToHex(16)).toEqual(['1', '0'])
    })

    it('should handle zero', () => {
      expect(decimalToHex(0)).toEqual(['0'])
    })

    it('should throw on negative numbers', () => {
      expect(() => decimalToHex(-1)).toThrow('Negative numbers not supported')
    })
  })

  describe('hexToString', () => {
    it('should convert hex digit arrays to strings', () => {
      expect(hexToString(['A', '3'])).toBe('A3')
      expect(hexToString(['F', 'F'])).toBe('FF')
    })
  })

  describe('hexStringToDecimal', () => {
    it('should convert hex strings to decimal', () => {
      expect(hexStringToDecimal('A3')).toBe(163)
      expect(hexStringToDecimal('FF')).toBe(255)
      expect(hexStringToDecimal('10')).toBe(16)
    })

    it('should throw on invalid input', () => {
      expect(() => hexStringToDecimal('G1')).toThrow()
    })
  })

  describe('decimalToHexString', () => {
    it('should convert decimal to hex strings', () => {
      expect(decimalToHexString(163)).toBe('A3')
      expect(decimalToHexString(255)).toBe('FF')
      expect(decimalToHexString(16)).toBe('10')
    })
  })

  describe('validateHexadecimal', () => {
    it('should validate correct hex strings', () => {
      const result = validateHexadecimal('A3')
      expect(result.valid).toBe(true)
    })

    it('should reject invalid hex strings', () => {
      const result = validateHexadecimal('G1')
      expect(result.valid).toBe(false)
    })
  })

  describe('getMinimumHexDigitsForDecimal', () => {
    it('should calculate minimum hex digits', () => {
      expect(getMinimumHexDigitsForDecimal(0)).toBe(1)
      expect(getMinimumHexDigitsForDecimal(15)).toBe(1)
      expect(getMinimumHexDigitsForDecimal(16)).toBe(2)
      expect(getMinimumHexDigitsForDecimal(255)).toBe(2)
      expect(getMinimumHexDigitsForDecimal(256)).toBe(3)
    })
  })

  describe('padHexString', () => {
    it('should pad hex strings to target length', () => {
      expect(padHexString('A3', 4)).toBe('00A3')
      expect(padHexString('FF', 4)).toBe('00FF')
    })

    it('should not pad if already at or above target length', () => {
      expect(padHexString('A3', 2)).toBe('A3')
      expect(padHexString('A3', 1)).toBe('A3')
    })
  })

  describe('hexadecimal arithmetic', () => {
    it('should add hexadecimal numbers', () => {
      expect(addHexadecimal('A3', '10')).toBe('B3')
      expect(addHexadecimal('FF', '1')).toBe('100')
    })

    it('should subtract hexadecimal numbers', () => {
      expect(subtractHexadecimal('B3', '10')).toBe('A3')
      expect(subtractHexadecimal('100', '1')).toBe('FF')
    })

    it('should throw on negative subtraction result', () => {
      expect(() => subtractHexadecimal('10', 'A3')).toThrow('negative number')
    })

    it('should multiply hexadecimal numbers', () => {
      expect(multiplyHexadecimal('A', 'B')).toBe('6E')
      expect(multiplyHexadecimal('10', '10')).toBe('100')
    })

    it('should divide hexadecimal numbers', () => {
      expect(divideHexadecimal('6E', 'A')).toBe('B') // 110 / 10 = 11 = B
      expect(divideHexadecimal('100', '10')).toBe('10') // 256 / 16 = 16 = 10
    })

    it('should throw on division by zero', () => {
      expect(() => divideHexadecimal('A3', '0')).toThrow('Division by zero')
    })
  })

  describe('hex-binary conversion', () => {
    it('should convert hex to binary', () => {
      expect(hexToBinary('A3')).toBe('10100011')
      expect(hexToBinary('FF')).toBe('11111111')
      expect(hexToBinary('0')).toBe('0')
    })

    it('should convert binary to hex', () => {
      expect(binaryToHex('10100011')).toBe('A3')
      expect(binaryToHex('11111111')).toBe('FF')
      expect(binaryToHex('1')).toBe('1')
    })

    it('should handle padding in binary to hex', () => {
      expect(binaryToHex('111')).toBe('7')
      expect(binaryToHex('1111')).toBe('F')
    })
  })

  describe('compareHexadecimal', () => {
    it('should compare hex numbers', () => {
      expect(compareHexadecimal('A3', '10')).toBe(1)
      expect(compareHexadecimal('10', 'A3')).toBe(-1)
      expect(compareHexadecimal('A3', 'A3')).toBe(0)
    })
  })
})
