import { describe, it, expect } from 'vitest'
import {
  nextCellValue,
  validateVariables,
  createKMapWithVariables,
  setCellValue,
  cycleCellValue,
  isActionAllowed,
  deriveKMapValues,
  applyAssignment,
  type KMapMode,
  type KMapAction,
} from '../../../application/kmap'
import { createKMap, buildAssignment, mintermToCell } from '../../../core/kmap'

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

    it('should limit to 5 variables', () => {
      expect(validateVariables(['A', 'B', 'C', 'D', 'E', 'F'])).toEqual(['A', 'B', 'C', 'D', 'E'])
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

    it('should build a 5-variable K-map', () => {
      const kmap = createKMapWithVariables(['A', 'B', 'C', 'D', 'E'])
      expect(kmap.layout.variables).toEqual(['A', 'B', 'C', 'D', 'E'])
      expect(kmap.cells.flat()).toHaveLength(32)
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

  describe('applyAssignment', () => {
    function valueOf(model: ReturnType<typeof createKMap>, minterm: number) {
      for (const row of model.cells) {
        for (const cell of row) {
          if (cell.minterm === minterm) return cell.value
        }
      }
      return null
    }

    it('should rebuild a flat 5-variable map into a plane map with the same variables', () => {
      const flat = createKMap(['A', 'B', 'C', 'D', 'E'])
      const assignment = buildAssignment(['E'], ['A', 'B'], ['C', 'D'])
      const next = applyAssignment(flat, assignment)

      expect(next.layout.variables).toEqual(['A', 'B', 'C', 'D', 'E'])
      expect(next.layout.planes).toBe(2)
      expect(next.layout.planeVariables).toEqual(['E'])
      expect(next.layout.rowVariables).toEqual(['A', 'B'])
      expect(next.layout.colVariables).toEqual(['C', 'D'])
    })

    it('should preserve cell values by minterm when switching to a plane layout', () => {
      let kmap = createKMap(['A', 'B', 'C', 'D', 'E'])
      kmap = setCellValue(kmap, 19, 1)
      kmap = setCellValue(kmap, 0, 0)
      kmap = setCellValue(kmap, 31, 'X')

      const next = applyAssignment(kmap, buildAssignment(['E'], ['A', 'B'], ['C', 'D']))

      expect(mintermToCell(next, 19)).toEqual({ row: 3, col: 1, plane: 1 })
      expect(mintermToCell(next, 31)).toEqual({ row: 2, col: 2, plane: 1 })
      expect(valueOf(next, 19)).toBe(1)
      expect(valueOf(next, 0)).toBe(0)
      expect(valueOf(next, 31)).toBe('X')
    })

    it('should preserve values when the plane variable changes', () => {
      let kmap = createKMap(['A', 'B', 'C', 'D', 'E'])
      kmap = setCellValue(kmap, 19, 1)
      kmap = setCellValue(kmap, 0, 1)

      const ePlane = applyAssignment(kmap, buildAssignment(['E'], ['A', 'B'], ['C', 'D']))
      const cPlane = applyAssignment(ePlane, buildAssignment(['C'], ['A', 'B'], ['D', 'E']))

      expect(mintermToCell(cPlane, 19)).toEqual({ row: 3, col: 2, plane: 0 })
      expect(valueOf(cPlane, 19)).toBe(1)
      expect(valueOf(cPlane, 0)).toBe(1)
    })

    it('should preserve values when rows and columns are swapped', () => {
      let kmap = createKMap(['A', 'B', 'C', 'D', 'E'])
      kmap = setCellValue(kmap, 19, 1)

      const ePlane = applyAssignment(kmap, buildAssignment(['E'], ['A', 'B'], ['C', 'D']))
      const swapped = applyAssignment(ePlane, buildAssignment(['E'], ['C', 'D'], ['A', 'B']))

      expect(mintermToCell(swapped, 19)).toEqual({ row: 1, col: 3, plane: 1 })
      expect(valueOf(swapped, 19)).toBe(1)
    })

    it('should throw for an assignment that does not cover the variables exactly', () => {
      const kmap = createKMap(['A', 'B', 'C', 'D', 'E'])
      expect(() =>
        applyAssignment(kmap, buildAssignment(['E'], ['A', 'B'], ['C', 'F']))
      ).toThrow(RangeError)
      expect(() =>
        applyAssignment(kmap, buildAssignment([], ['A', 'B'], ['C', 'D']))
      ).toThrow(RangeError)
    })

    it('should work for 4-variable custom assignments', () => {
      const kmap = createKMap(['A', 'B', 'C', 'D'])
      const next = applyAssignment(kmap, buildAssignment([], ['A', 'C'], ['B', 'D']))
      expect(next.layout.planes).toBe(1)
      expect(next.layout.rowVariables).toEqual(['A', 'C'])
      expect(next.layout.colVariables).toEqual(['B', 'D'])
      expect(next.cells.flat()).toHaveLength(16)
    })
  })
})