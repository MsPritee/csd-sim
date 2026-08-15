/**
 * Tests for number systems application layer conversion orchestration
 */

import { describe, it, expect } from 'vitest'
import {
  orchestrateConversion,
  convertToAllSystems,
  quickConvert,
  educationalConvert,
  validateConversionPath,
} from '../../../application/numbersystems/conversion'

describe('application layer conversion', () => {
  describe('orchestrateConversion', () => {
    it('should orchestrate simple conversion', () => {
      const result = orchestrateConversion({
        value: 10,
        fromSystem: 'decimal',
        toSystem: 'binary',
      })
      
      expect(result.success).toBe(true)
      expect(result.result).toBe('1010')
      expect(result.fromSystem).toBe('decimal')
      expect(result.toSystem).toBe('binary')
    })

    it('should include steps when requested', () => {
      const result = orchestrateConversion({
        value: 10,
        fromSystem: 'decimal',
        toSystem: 'binary',
        showSteps: true,
      })
      
      expect(result.success).toBe(true)
      expect(result.steps).toBeDefined()
      expect(result.steps!.length).toBeGreaterThan(0)
    })

    it('should include explanation when steps requested', () => {
      const result = orchestrateConversion({
        value: 10,
        fromSystem: 'decimal',
        toSystem: 'binary',
        showSteps: true,
      })
      
      expect(result.success).toBe(true)
      expect(result.explanation).toBeDefined()
      expect(result.explanation!.length).toBeGreaterThan(0)
    })

    it('should include shortcuts when requested', () => {
      const result = orchestrateConversion({
        value: 10,
        fromSystem: 'decimal',
        toSystem: 'binary',
        useShortcuts: true,
      })
      
      expect(result.success).toBe(true)
      expect(result.shortcuts).toBeDefined()
      expect(result.shortcuts!.length).toBeGreaterThan(0)
    })

    it('should handle invalid conversion', () => {
      const result = orchestrateConversion({
        value: 'GH',
        fromSystem: 'hexadecimal',
        toSystem: 'decimal',
      })
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle same system conversion', () => {
      const result = orchestrateConversion({
        value: '1010',
        fromSystem: 'binary',
        toSystem: 'binary',
      })
      
      expect(result.success).toBe(true)
      expect(result.result).toBe('1010')
    })
  })

  describe('convertToAllSystems', () => {
    it('should convert to all other systems', () => {
      const results = convertToAllSystems(10, 'decimal')
      
      expect(results).toHaveLength(3) // All except decimal itself
      
      const binaryResult = results.find(r => r.toSystem === 'binary')
      expect(binaryResult).toBeDefined()
      expect(binaryResult!.result).toBe('1010')
      
      const hexResult = results.find(r => r.toSystem === 'hexadecimal')
      expect(hexResult).toBeDefined()
      expect(hexResult!.result).toBe('A')
      
      const octalResult = results.find(r => r.toSystem === 'octal')
      expect(octalResult).toBeDefined()
      expect(octalResult!.result).toBe('12')
    })

    it('should include steps for all conversions', () => {
      const results = convertToAllSystems(10, 'decimal')
      
      results.forEach(result => {
        expect(result.steps).toBeDefined()
        expect(result.steps!.length).toBeGreaterThan(0)
      })
    })
  })

  describe('quickConvert', () => {
    it('should perform quick conversion without educational content', () => {
      const result = quickConvert(10, 'decimal', 'binary')
      
      expect(result.success).toBe(true)
      expect(result.result).toBe('1010')
      expect(result.steps).toBeUndefined()
      expect(result.explanation).toBeUndefined()
      expect(result.shortcuts).toBeUndefined()
    })
  })

  describe('educationalConvert', () => {
    it('should perform conversion with full educational content', () => {
      const result = educationalConvert(10, 'decimal', 'binary')
      
      expect(result.success).toBe(true)
      expect(result.result).toBe('1010')
      expect(result.steps).toBeDefined()
      expect(result.explanation).toBeDefined()
      expect(result.shortcuts).toBeDefined()
    })

    it('should include comprehensive steps', () => {
      const result = educationalConvert(255, 'decimal', 'hexadecimal')
      
      expect(result.success).toBe(true)
      expect(result.steps).toBeDefined()
      expect(result.steps!.length).toBeGreaterThan(0)
    })

    it('should include shortcuts', () => {
      const result = educationalConvert('1010', 'binary', 'hexadecimal')
      
      expect(result.success).toBe(true)
      expect(result.shortcuts).toBeDefined()
      expect(result.shortcuts!.length).toBeGreaterThan(0)
    })
  })

  describe('validateConversionPath', () => {
    it('should validate same system conversion', () => {
      const result = validateConversionPath('decimal', 'decimal')
      
      expect(result.valid).toBe(true)
      expect(result.path).toEqual(['decimal'])
    })

    it('should validate different system conversion', () => {
      const result = validateConversionPath('decimal', 'binary')
      
      expect(result.valid).toBe(true)
      expect(result.path).toContain('decimal')
      expect(result.path).toContain('binary')
      expect(result.reason).toBeDefined()
    })

    it('should support all system combinations', () => {
      const systems = ['decimal', 'binary', 'hexadecimal', 'octal'] as const
      
      systems.forEach(from => {
        systems.forEach(to => {
          const result = validateConversionPath(from, to)
          expect(result.valid).toBe(true)
        })
      })
    })
  })

  describe('error handling', () => {
    it('should handle invalid input gracefully', () => {
      const result = orchestrateConversion({
        value: '',
        fromSystem: 'decimal',
        toSystem: 'binary',
      })
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle invalid system combinations', () => {
      const result = orchestrateConversion({
        value: 10,
        fromSystem: 'decimal' as any,
        toSystem: 'invalid' as any,
      })
      
      expect(result.success).toBe(false)
    })
  })
})
