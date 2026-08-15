/**
 * Tests for number systems educational explanations
 */

import { describe, it, expect } from 'vitest'
import {
  explainConversion,
  explainAllSystems,
  explainShortcut,
} from '../../../education/numbersystems/explanations'
import { getShortcutsForConversion } from '../../../education/numbersystems/shortcuts'

describe('educational explanations', () => {
  describe('explainConversion', () => {
    it('should explain decimal to binary conversion', () => {
      const result = explainConversion(10, 'decimal', 'binary')
      
      expect(result.success).toBe(true)
      expect(result.result).toBe('1010')
      expect(result.explanation).toBeDefined()
      expect(result.explanation!.what).toContain('10')
      expect(result.explanation!.what).toContain('1010')
      expect(result.explanation!.why).toBeDefined()
      expect(result.explanation!.rule).toBeDefined()
      expect(result.explanation!.notice).toBeDefined()
    })

    it('should explain binary to decimal conversion', () => {
      const result = explainConversion('1010', 'binary', 'decimal')
      
      expect(result.success).toBe(true)
      expect(result.result).toBe('10')
      expect(result.explanation).toBeDefined()
      expect(result.explanation!.what).toContain('1010')
      expect(result.explanation!.what).toContain('10')
    })

    it('should explain decimal to hexadecimal conversion', () => {
      const result = explainConversion(255, 'decimal', 'hexadecimal')
      
      expect(result.success).toBe(true)
      expect(result.result).toBe('FF')
      expect(result.explanation).toBeDefined()
    })

    it('should explain hexadecimal to decimal conversion', () => {
      const result = explainConversion('FF', 'hexadecimal', 'decimal')
      
      expect(result.success).toBe(true)
      expect(result.result).toBe('255')
      expect(result.explanation).toBeDefined()
    })

    it('should explain binary to hexadecimal conversion', () => {
      const result = explainConversion('11111111', 'binary', 'hexadecimal')
      
      expect(result.success).toBe(true)
      expect(result.result).toBe('FF')
      expect(result.explanation).toBeDefined()
      expect(result.explanation!.why).toContain('4')
    })

    it('should explain hexadecimal to binary conversion', () => {
      const result = explainConversion('FF', 'hexadecimal', 'binary')
      
      expect(result.success).toBe(true)
      expect(result.result).toBe('11111111')
      expect(result.explanation).toBeDefined()
      expect(result.explanation!.why).toContain('4')
    })

    it('should include shortcuts when available', () => {
      const result = explainConversion(10, 'decimal', 'binary')
      
      expect(result.shortcuts).toBeDefined()
      expect(result.shortcuts!.length).toBeGreaterThan(0)
    })

    it('should handle invalid conversion', () => {
      const result = explainConversion('GH', 'hexadecimal', 'decimal')
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('explainAllSystems', () => {
    it('should explain all systems for a decimal value', () => {
      const result = explainAllSystems(255)
      
      expect(result.decimal).toBe('255')
      expect(result.binary).toBe('11111111')
      expect(result.hexadecimal).toBe('FF')
      expect(result.octal).toBe('377')
      expect(result.explanation).toBeDefined()
      expect(result.explanation.length).toBeGreaterThan(0)
    })

    it('should handle zero', () => {
      const result = explainAllSystems(0)
      
      expect(result.decimal).toBe('0')
      expect(result.binary).toBe('0')
      expect(result.hexadecimal).toBe('0')
      expect(result.octal).toBe('0')
    })

    it('should provide comprehensive explanation', () => {
      const result = explainAllSystems(10)
      
      // The explanation is an array of strings, so we need to check the joined content
      const explanationText = result.explanation.join(' ')
      expect(explanationText).toContain('Decimal')
      expect(explanationText).toContain('Binary')
      expect(explanationText).toContain('Hexadecimal')
      expect(explanationText).toContain('Octal')
      expect(explanationText).toContain('relationship')
    })
  })

  describe('explainShortcut', () => {
    it('should explain known shortcuts', () => {
      const explanation = explainShortcut('Powers of 2')
      
      expect(explanation).toBeDefined()
      expect(explanation.length).toBeGreaterThan(0)
      expect(explanation).toContain('power of 2')
    })

    it('should explain Counting Method', () => {
      const explanation = explainShortcut('Counting Method')
      
      expect(explanation).toBeDefined()
      expect(explanation).toContain('positional')
    })

    it('should explain Group by 4', () => {
      const explanation = explainShortcut('Group by 4')
      
      expect(explanation).toBeDefined()
      expect(explanation).toContain('4')
    })

    it('should provide default explanation for unknown shortcuts', () => {
      const explanation = explainShortcut('Unknown Shortcut')
      
      expect(explanation).toBeDefined()
      expect(explanation).toContain('mathematical relationship')
    })
  })

  describe('getShortcutsForConversion', () => {
    it('should return shortcuts for binary to decimal', () => {
      const shortcuts = getShortcutsForConversion('binary', 'decimal')
      
      expect(shortcuts).toBeDefined()
      expect(shortcuts.length).toBeGreaterThan(0)
      expect(shortcuts[0]!.from).toBe('binary')
      expect(shortcuts[0]!.to).toBe('decimal')
    })

    it('should return shortcuts for decimal to binary', () => {
      const shortcuts = getShortcutsForConversion('decimal', 'binary')
      
      expect(shortcuts).toBeDefined()
      expect(shortcuts.length).toBeGreaterThan(0)
    })

    it('should return shortcuts for binary to hex', () => {
      const shortcuts = getShortcutsForConversion('binary', 'hexadecimal')
      
      expect(shortcuts).toBeDefined()
      expect(shortcuts.length).toBeGreaterThan(0)
      expect(shortcuts.some(s => s.name === 'Group by 4')).toBe(true)
    })

    it('should return shortcuts for hex to binary', () => {
      const shortcuts = getShortcutsForConversion('hexadecimal', 'binary')
      
      expect(shortcuts).toBeDefined()
      expect(shortcuts.length).toBeGreaterThan(0)
      expect(shortcuts.some(s => s.name === 'Expand Each Digit')).toBe(true)
    })

    it('should return empty array for unsupported conversion', () => {
      const shortcuts = getShortcutsForConversion('decimal' as any, 'decimal' as any)
      
      expect(shortcuts).toBeDefined()
      expect(shortcuts.length).toBe(0)
    })

    it('should have valid shortcut structure', () => {
      const shortcuts = getShortcutsForConversion('binary', 'decimal')
      
      shortcuts.forEach(shortcut => {
        expect(shortcut.from).toBeDefined()
        expect(shortcut.to).toBeDefined()
        expect(shortcut.name).toBeDefined()
        expect(shortcut.description).toBeDefined()
        expect(shortcut.applicableRange).toBeDefined()
        expect(shortcut.examples).toBeDefined()
        expect(shortcut.examples.length).toBeGreaterThan(0)
      })
    })
  })
})
