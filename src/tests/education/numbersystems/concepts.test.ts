/**
 * Tests for number systems educational concepts
 */

import { describe, it, expect } from 'vitest'
import {
  NUMBER_SYSTEM_CONCEPTS,
  getNumberSystemConcept,
  NUMBER_SYSTEM_CONCEPT_LIST,
} from '../../../education/numbersystems/concepts'

describe('number systems concepts', () => {
  describe('NUMBER_SYSTEM_CONCEPTS', () => {
    it('should have concepts for all number systems', () => {
      expect(NUMBER_SYSTEM_CONCEPTS).toHaveProperty('decimal')
      expect(NUMBER_SYSTEM_CONCEPTS).toHaveProperty('binary')
      expect(NUMBER_SYSTEM_CONCEPTS).toHaveProperty('hexadecimal')
      expect(NUMBER_SYSTEM_CONCEPTS).toHaveProperty('octal')
    })

    it('should have valid concept structure for decimal', () => {
      const concept = NUMBER_SYSTEM_CONCEPTS.decimal
      expect(concept.id).toBe('decimal')
      expect(concept.title).toBe('Decimal (Base-10)')
      expect(concept.objective).toBeDefined()
      expect(concept.prerequisites).toBeDefined()
      expect(concept.explanation).toBeDefined()
      expect(concept.visualization).toBeDefined()
      expect(concept.interaction).toBeDefined()
      expect(concept.commonMistakes).toBeDefined()
      expect(concept.hints).toBeDefined()
      expect(concept.assessment).toBeDefined()
    })

    it('should have valid concept structure for binary', () => {
      const concept = NUMBER_SYSTEM_CONCEPTS.binary
      expect(concept.id).toBe('binary')
      expect(concept.title).toBe('Binary (Base-2)')
      expect(concept.objective).toBeDefined()
      expect(concept.prerequisites).toBeDefined()
      expect(concept.explanation).toBeDefined()
      expect(concept.visualization).toBeDefined()
      expect(concept.interaction).toBeDefined()
      expect(concept.commonMistakes).toBeDefined()
      expect(concept.hints).toBeDefined()
      expect(concept.assessment).toBeDefined()
    })

    it('should have valid concept structure for hexadecimal', () => {
      const concept = NUMBER_SYSTEM_CONCEPTS.hexadecimal
      expect(concept.id).toBe('hexadecimal')
      expect(concept.title).toBe('Hexadecimal (Base-16)')
      expect(concept.objective).toBeDefined()
      expect(concept.prerequisites).toBeDefined()
      expect(concept.explanation).toBeDefined()
      expect(concept.visualization).toBeDefined()
      expect(concept.interaction).toBeDefined()
      expect(concept.commonMistakes).toBeDefined()
      expect(concept.hints).toBeDefined()
      expect(concept.assessment).toBeDefined()
    })

    it('should have valid concept structure for octal', () => {
      const concept = NUMBER_SYSTEM_CONCEPTS.octal
      expect(concept.id).toBe('octal')
      expect(concept.title).toBe('Octal (Base-8)')
      expect(concept.objective).toBeDefined()
      expect(concept.prerequisites).toBeDefined()
      expect(concept.explanation).toBeDefined()
      expect(concept.visualization).toBeDefined()
      expect(concept.interaction).toBeDefined()
      expect(concept.commonMistakes).toBeDefined()
      expect(concept.hints).toBeDefined()
      expect(concept.assessment).toBeDefined()
    })
  })

  describe('getNumberSystemConcept', () => {
    it('should return correct concept for valid id', () => {
      const concept = getNumberSystemConcept('decimal')
      expect(concept.id).toBe('decimal')
      expect(concept.title).toBe('Decimal (Base-10)')
    })

    it('should throw for unknown id', () => {
      expect(() => getNumberSystemConcept('invalid' as any)).toThrow('unknown number system concept')
    })
  })

  describe('NUMBER_SYSTEM_CONCEPT_LIST', () => {
    it('should contain all concepts', () => {
      expect(NUMBER_SYSTEM_CONCEPT_LIST).toHaveLength(4)
      expect(NUMBER_SYSTEM_CONCEPT_LIST.map(c => c.id)).toEqual([
        'decimal',
        'binary',
        'hexadecimal',
        'octal',
      ])
    })

    it('should be in teaching order', () => {
      expect(NUMBER_SYSTEM_CONCEPT_LIST[0]!.id).toBe('decimal')
      expect(NUMBER_SYSTEM_CONCEPT_LIST[1]!.id).toBe('binary')
      expect(NUMBER_SYSTEM_CONCEPT_LIST[2]!.id).toBe('hexadecimal')
      expect(NUMBER_SYSTEM_CONCEPT_LIST[3]!.id).toBe('octal')
    })
  })

  describe('concept content quality', () => {
    it('should have meaningful explanations', () => {
      const concept = NUMBER_SYSTEM_CONCEPTS.hexadecimal
      expect(concept.explanation.length).toBeGreaterThan(0)
      expect(concept.explanation[0]!.length).toBeGreaterThan(10)
    })

    it('should have practical examples in assessment', () => {
      const concept = NUMBER_SYSTEM_CONCEPTS.binary
      expect(concept.assessment.length).toBeGreaterThan(0)
      expect(concept.assessment[0]!.length).toBeGreaterThan(0)
    })

    it('should have relevant common mistakes', () => {
      const concept = NUMBER_SYSTEM_CONCEPTS.hexadecimal
      expect(concept.commonMistakes.length).toBeGreaterThan(0)
      expect(concept.commonMistakes.some(m => m.includes('A-F'))).toBe(true)
    })

    it('should have helpful hints', () => {
      const concept = NUMBER_SYSTEM_CONCEPTS.binary
      expect(concept.hints.length).toBeGreaterThan(0)
      expect(concept.hints[0]!.length).toBeGreaterThan(0)
    })
  })
})
