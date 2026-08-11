import { describe, it, expect } from 'vitest'
import { isValidAction, type KMapAction } from '../../../application/kmap/actions'

describe('KMapAction Model', () => {
  describe('isValidAction', () => {
    it('should validate CELL_SELECTED action', () => {
      const action: KMapAction = { type: 'CELL_SELECTED', minterm: 5 }
      expect(isValidAction(action)).toBe(true)
    })

    it('should reject CELL_SELECTED with invalid minterm', () => {
      const action = { type: 'CELL_SELECTED', minterm: 'invalid' }
      expect(isValidAction(action)).toBe(false)
    })

    it('should validate CELL_VALUE_CHANGED action', () => {
      const action: KMapAction = { type: 'CELL_VALUE_CHANGED', minterm: 3, value: 1 }
      expect(isValidAction(action)).toBe(true)
    })

    it('should validate CELL_VALUE_CHANGED with X value', () => {
      const action: KMapAction = { type: 'CELL_VALUE_CHANGED', minterm: 3, value: 'X' }
      expect(isValidAction(action)).toBe(true)
    })

    it('should validate CELL_VALUE_CHANGED with null value', () => {
      const action: KMapAction = { type: 'CELL_VALUE_CHANGED', minterm: 3, value: null }
      expect(isValidAction(action)).toBe(true)
    })

    it('should reject CELL_VALUE_CHANGED with invalid value', () => {
      const action = { type: 'CELL_VALUE_CHANGED', minterm: 3, value: 2 }
      expect(isValidAction(action)).toBe(false)
    })

    it('should validate GROUP_CREATED action', () => {
      const action: KMapAction = { type: 'GROUP_CREATED', cells: [1, 2, 3] }
      expect(isValidAction(action)).toBe(true)
    })

    it('should reject GROUP_CREATED with non-array cells', () => {
      const action = { type: 'GROUP_CREATED', cells: 'not-an-array' }
      expect(isValidAction(action)).toBe(false)
    })

    it('should validate GROUP_VALIDATED action', () => {
      const action: KMapAction = {
        type: 'GROUP_VALIDATED',
        group: [1, 2, 3],
        result: { valid: true, issues: [] }
      }
      expect(isValidAction(action)).toBe(true)
    })

    it('should validate HINT_REQUESTED action', () => {
      const action: KMapAction = { type: 'HINT_REQUESTED', level: 2 }
      expect(isValidAction(action)).toBe(true)
    })

    it('should validate STEP_STARTED action', () => {
      const action: KMapAction = { type: 'STEP_STARTED', stepId: 'step-1' }
      expect(isValidAction(action)).toBe(true)
    })

    it('should validate MISTAKE_DETECTED action', () => {
      const action: KMapAction = {
        type: 'MISTAKE_DETECTED',
        action: { type: 'CELL_SELECTED', minterm: 5 },
        explanation: 'Invalid grouping'
      }
      expect(isValidAction(action)).toBe(true)
    })

    it('should validate SOLUTION_REVEALED action', () => {
      const action: KMapAction = { type: 'SOLUTION_REVEALED' }
      expect(isValidAction(action)).toBe(true)
    })

    it('should validate MODE_CHANGED action', () => {
      const action: KMapAction = {
        type: 'MODE_CHANGED',
        from: 'explore',
        to: 'practice'
      }
      expect(isValidAction(action)).toBe(true)
    })

    it('should reject invalid action type', () => {
      const action = { type: 'INVALID_ACTION', minterm: 5 }
      expect(isValidAction(action)).toBe(false)
    })

    it('should reject null action', () => {
      expect(isValidAction(null)).toBe(false)
    })

    it('should reject undefined action', () => {
      expect(isValidAction(undefined)).toBe(false)
    })

    it('should reject non-object action', () => {
      expect(isValidAction('string')).toBe(false)
    })
  })
})