import { describe, it, expect } from 'vitest'
import {
  nextCellValue,
  validateVariables,
  createKMapWithVariables,
  setCellValue,
  cycleCellValue,
  isActionAllowed,
  deriveKMapValues,
  type KMapMode,
  type KMapAction,
} from '../../../application/kmap'
import { createKMap } from '../../../core/kmap'

describe('KMap Use Cases', () => {
  describe('nextCellValue', () => {
    it('should cycle from null to 1', () => {
      expect(nextCellValue(null)).toBe(1)
    })

    it('should cycle from 1 to 0', () => {
      expect(nextCellValue(1)).toBe(0)
    })

    it('should cycle from 0 to X', () => {
      expect(nextCellValue(0)).toBe('X')
    })

    it('should cycle from X to null', () => {
      expect(nextCellValue('X')).toBe(null)
    })
  })

  describe('validateVariables', () => {
    it('should accept valid single-letter variables', () => {
      expect(validateVariables(['A', 'B', 'C'])).toEqual(['A', 'B', 'C'])
    })

    it('should filter out invalid variable names', () => {
      expect(validateVariables(['A', 'B1', 'C', ''])).toEqual(['A', 'C'])
    })

    it('should limit to 4 variables', () => {
      expect(validateVariables(['A', 'B', 'C', 'D', 'E'])).toEqual(['A', 'B', 'C', 'D'])
    })

    it('should provide default variables if less than 2', () => {
      expect(validateVariables(['A'])).toEqual(['A', 'B'])
    })

    it('should provide default variables if empty', () => {
      expect(validateVariables([])).toEqual(['A', 'B'])
    })
  })

  describe('createKMapWithVariables', () => {
    it('should create K-map with validated variables', () => {
      const kmap = createKMapWithVariables(['A', 'B', 'C'])
      expect(kmap.layout.variables).toEqual(['A', 'B', 'C'])
    })

    it('should handle invalid variable names', () => {
      const kmap = createKMapWithVariables(['A', 'invalid', 'C'])
      expect(kmap.layout.variables).toEqual(['A', 'C'])
    })
  })

  describe('setCellValue', () => {
    it('should set cell value for valid minterm', () => {
      const kmap = createKMap(['A', 'B'])
      const updated = setCellValue(kmap, 0, 1)
      expect(updated.cells[0][0].value).toBe(1)
    })

    it('should not change K-map for invalid minterm', () => {
      const kmap = createKMap(['A', 'B'])
      const updated = setCellValue(kmap, 999, 1)
      expect(updated).toBe(kmap)
    })
  })

  describe('cycleCellValue', () => {
    it('should cycle cell value', () => {
      const kmap = createKMap(['A', 'B'])
      const updated = cycleCellValue(kmap, 0)
      expect(updated.cells[0][0].value).toBe(1)
    })

    it('should cycle through all values', () => {
      let kmap = createKMap(['A', 'B'])
      kmap = cycleCellValue(kmap, 0) // null -> 1
      expect(kmap.cells[0][0].value).toBe(1)
      
      kmap = cycleCellValue(kmap, 0) // 1 -> 0
      expect(kmap.cells[0][0].value).toBe(0)
      
      kmap = cycleCellValue(kmap, 0) // 0 -> X
      expect(kmap.cells[0][0].value).toBe('X')
      
      kmap = cycleCellValue(kmap, 0) // X -> null
      expect(kmap.cells[0][0].value).toBe(null)
    })
  })

  describe('isActionAllowed', () => {
    it('should allow CELL_SELECTED in all modes', () => {
      const action: KMapAction = { type: 'CELL_SELECTED', minterm: 5 }
      const modes: KMapMode[] = ['explore', 'learn', 'practice', 'challenge', 'solution']
      
      modes.forEach(mode => {
        expect(isActionAllowed(action, mode)).toBe(true)
      })
    })

    it('should allow HINT_REQUESTED only in modes with hints', () => {
      const action: KMapAction = { type: 'HINT_REQUESTED', level: 1 }
      
      expect(isActionAllowed(action, 'explore')).toBe(true)
      expect(isActionAllowed(action, 'learn')).toBe(true)
      expect(isActionAllowed(action, 'practice')).toBe(true)
      expect(isActionAllowed(action, 'challenge')).toBe(false)
      expect(isActionAllowed(action, 'solution')).toBe(true)
    })

    it('should allow SOLUTION_REVEALED only in modes with solution visibility', () => {
      const action: KMapAction = { type: 'SOLUTION_REVEALED' }
      
      expect(isActionAllowed(action, 'explore')).toBe(true)
      expect(isActionAllowed(action, 'learn')).toBe(false)
      expect(isActionAllowed(action, 'practice')).toBe(false)
      expect(isActionAllowed(action, 'challenge')).toBe(false)
      expect(isActionAllowed(action, 'solution')).toBe(true)
    })
  })

  describe('deriveKMapValues', () => {
    it('should derive correct values from K-map', () => {
      const kmap = createKMap(['A', 'B'])
      const updated = setCellValue(kmap, 0, 1)
      const updated2 = setCellValue(updated, 1, 0)
      
      const derived = deriveKMapValues(updated2)
      
      expect(derived.ones).toContain(0)
      expect(derived.zeros).toContain(1)
      expect(derived.dontcares).not.toContain(0)
      expect(derived.unset).toContain(2)
      expect(derived.unset).toContain(3)
    })

    it('should handle empty K-map', () => {
      const kmap = createKMap(['A', 'B'])
      const derived = deriveKMapValues(kmap)
      
      expect(derived.ones).toEqual([])
      expect(derived.zeros).toEqual([])
      expect(derived.dontcares).toEqual([])
      expect(derived.unset).toEqual([0, 1, 2, 3])
    })
  })
})