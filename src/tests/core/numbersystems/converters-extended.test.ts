/**
 * Tests for extended conversion algorithms (hexadecimal and octal)
 */

import { describe, it, expect } from 'vitest'
import {
  decimalToHexString,
  hexStringToDecimal,
  binaryStringToHex,
  hexStringToBinary,
  decimalToOctalString,
  octalStringToDecimal,
  binaryStringToOctal,
  octalStringToBinary,
  hexStringToOctal,
  octalStringToHex,
  convertBetweenSystems,
} from '../../../core/numbersystems/converters'

describe('extended conversion algorithms', () => {
  describe('decimal-hexadecimal conversion', () => {
    it('should convert decimal to hex string', () => {
      const result = decimalToHexString(255)
      expect(result.success).toBe(true)
      expect(result.result).toBe('FF')
    })

    it('should convert hex string to decimal', () => {
      const result = hexStringToDecimal('FF')
      expect(result.success).toBe(true)
      expect(result.result).toBe(255)
    })

    it('should handle lowercase hex input', () => {
      const result = hexStringToDecimal('ff')
      expect(result.success).toBe(true)
      expect(result.result).toBe(255)
    })

    it('should reject invalid hex', () => {
      const result = hexStringToDecimal('GH')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid hexadecimal format')
    })
  })

  describe('binary-hexadecimal conversion', () => {
    it('should convert binary to hex', () => {
      const result = binaryStringToHex('11111111')
      expect(result.success).toBe(true)
      expect(result.result).toBe('FF')
    })

    it('should convert hex to binary', () => {
      const result = hexStringToBinary('FF')
      expect(result.success).toBe(true)
      expect(result.result).toBe('11111111')
    })

    it('should handle padding in binary to hex', () => {
      const result = binaryStringToHex('111')
      expect(result.success).toBe(true)
      expect(result.result).toBe('7')
    })
  })

  describe('decimal-octal conversion', () => {
    it('should convert decimal to octal string', () => {
      const result = decimalToOctalString(63)
      expect(result.success).toBe(true)
      expect(result.result).toBe('77')
    })

    it('should convert octal string to decimal', () => {
      const result = octalStringToDecimal('77')
      expect(result.success).toBe(true)
      expect(result.result).toBe(63)
    })

    it('should reject invalid octal', () => {
      const result = octalStringToDecimal('89')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid octal format')
    })
  })

  describe('binary-octal conversion', () => {
    it('should convert binary to octal', () => {
      const result = binaryStringToOctal('111111')
      expect(result.success).toBe(true)
      expect(result.result).toBe('77')
    })

    it('should convert octal to binary', () => {
      const result = octalStringToBinary('77')
      expect(result.success).toBe(true)
      expect(result.result).toBe('111111')
    })

    it('should handle padding in binary to octal', () => {
      const result = binaryStringToOctal('111')
      expect(result.success).toBe(true)
      expect(result.result).toBe('7')
    })
  })

  describe('hexadecimal-octal conversion', () => {
    it('should convert hex to octal', () => {
      const result = hexStringToOctal('FF')
      expect(result.success).toBe(true)
      expect(result.result).toBe('377')
    })

    it('should convert octal to hex', () => {
      const result = octalStringToHex('377')
      expect(result.success).toBe(true)
      expect(result.result).toBe('FF')
    })
  })

  describe('cross-system conversion', () => {
    it('should convert decimal to binary', () => {
      const result = convertBetweenSystems(10, 'decimal', 'binary')
      expect(result.success).toBe(true)
      expect(result.result).toBe('1010')
      expect(result.intermediateSteps).toBeDefined()
    })

    it('should convert binary to decimal', () => {
      const result = convertBetweenSystems('1010', 'binary', 'decimal')
      expect(result.success).toBe(true)
      expect(result.result).toBe('10')
    })

    it('should convert decimal to hexadecimal', () => {
      const result = convertBetweenSystems(255, 'decimal', 'hexadecimal')
      expect(result.success).toBe(true)
      expect(result.result).toBe('FF')
    })

    it('should convert hexadecimal to decimal', () => {
      const result = convertBetweenSystems('FF', 'hexadecimal', 'decimal')
      expect(result.success).toBe(true)
      expect(result.result).toBe('255')
    })

    it('should convert decimal to octal', () => {
      const result = convertBetweenSystems(63, 'decimal', 'octal')
      expect(result.success).toBe(true)
      expect(result.result).toBe('77')
    })

    it('should convert octal to decimal', () => {
      const result = convertBetweenSystems('77', 'octal', 'decimal')
      expect(result.success).toBe(true)
      expect(result.result).toBe('63')
    })

    it('should convert binary to hexadecimal', () => {
      const result = convertBetweenSystems('11111111', 'binary', 'hexadecimal')
      expect(result.success).toBe(true)
      expect(result.result).toBe('FF')
    })

    it('should convert hexadecimal to binary', () => {
      const result = convertBetweenSystems('FF', 'hexadecimal', 'binary')
      expect(result.success).toBe(true)
      expect(result.result).toBe('11111111')
    })

    it('should convert binary to octal', () => {
      const result = convertBetweenSystems('111111', 'binary', 'octal')
      expect(result.success).toBe(true)
      expect(result.result).toBe('77')
    })

    it('should convert octal to binary', () => {
      const result = convertBetweenSystems('77', 'octal', 'binary')
      expect(result.success).toBe(true)
      expect(result.result).toBe('111111')
    })

    it('should handle same system conversion', () => {
      const result = convertBetweenSystems('1010', 'binary', 'binary')
      expect(result.success).toBe(true)
      expect(result.result).toBe('1010')
      expect(result.intermediateSteps).toBeDefined()
      expect(result.intermediateSteps!.length).toBeGreaterThan(0)
    })

    it('should reject invalid binary format', () => {
      const result = convertBetweenSystems('10201', 'binary', 'decimal')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid binary format')
    })

    it('should reject invalid hexadecimal format', () => {
      const result = convertBetweenSystems('GH', 'hexadecimal', 'decimal')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid hexadecimal format')
    })

    it('should reject invalid octal format', () => {
      const result = convertBetweenSystems('89', 'octal', 'decimal')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid octal format')
    })

    it('should reject empty input', () => {
      const result = convertBetweenSystems('', 'decimal', 'binary')
      expect(result.success).toBe(false)
      expect(result.error).toContain('empty')
    })

    it('should provide intermediate steps', () => {
      const result = convertBetweenSystems(10, 'decimal', 'hexadecimal')
      expect(result.success).toBe(true)
      expect(result.intermediateSteps).toBeDefined()
      expect(result.intermediateSteps!.length).toBeGreaterThan(0)
    })
  })
})
