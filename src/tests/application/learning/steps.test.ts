import { describe, it, expect } from 'vitest'
import {
  createLearningStep,
  validateLearningStep,
  getHint,
  getMaxHintLevel,
  type LearningStep
} from '../../../application/learning/steps'

describe('Learning Step Model', () => {
  describe('createLearningStep', () => {
    it('should create a learning step with auto-assigned hint levels', () => {
      const step = createLearningStep({
        id: 'step-1',
        objective: 'Learn grouping',
        instruction: 'Group adjacent cells',
        hints: [
          { text: 'First hint' },
          { text: 'Second hint' },
        ]
      })

      expect(step.hints).toHaveLength(2)
      expect(step.hints[0].level).toBe(1)
      expect(step.hints[1].level).toBe(2)
      expect(step.prerequisites).toEqual([])
    })

    it('should handle empty hints array', () => {
      const step = createLearningStep({
        id: 'step-1',
        objective: 'Learn grouping',
        instruction: 'Group adjacent cells',
      })

      expect(step.hints).toEqual([])
    })

    it('should preserve provided prerequisites', () => {
      const step = createLearningStep({
        id: 'step-2',
        objective: 'Advanced grouping',
        instruction: 'Group non-adjacent cells',
        prerequisites: ['step-1'],
      })

      expect(step.prerequisites).toEqual(['step-1'])
    })
  })

  describe('validateLearningStep', () => {
    it('should validate a correct learning step', () => {
      const step: LearningStep = {
        id: 'step-1',
        objective: 'Learn grouping',
        instruction: 'Group adjacent cells',
        hints: [],
      }

      const errors = validateLearningStep(step)
      expect(errors).toEqual([])
    })

    it('should reject step with empty id', () => {
      const step: LearningStep = {
        id: '',
        objective: 'Learn grouping',
        instruction: 'Group adjacent cells',
        hints: [],
      }

      const errors = validateLearningStep(step)
      expect(errors).toContain('Step id must not be empty')
    })

    it('should reject step with empty objective', () => {
      const step: LearningStep = {
        id: 'step-1',
        objective: '',
        instruction: 'Group adjacent cells',
        hints: [],
      }

      const errors = validateLearningStep(step)
      expect(errors).toContain('Step objective must not be empty')
    })

    it('should reject step with empty instruction', () => {
      const step: LearningStep = {
        id: 'step-1',
        objective: 'Learn grouping',
        instruction: '',
        hints: [],
      }

      const errors = validateLearningStep(step)
      expect(errors).toContain('Step instruction must not be empty')
    })

    it('should reject hints with duplicate levels', () => {
      const step: LearningStep = {
        id: 'step-1',
        objective: 'Learn grouping',
        instruction: 'Group adjacent cells',
        hints: [
          { level: 1, text: 'First hint' },
          { level: 1, text: 'Second hint' },
        ],
      }

      const errors = validateLearningStep(step)
      expect(errors).toContain('Hint levels must be unique')
    })

    it('should reject hints with level less than 1', () => {
      const step: LearningStep = {
        id: 'step-1',
        objective: 'Learn grouping',
        instruction: 'Group adjacent cells',
        hints: [
          { level: 0, text: 'Invalid hint' },
        ],
      }

      const errors = validateLearningStep(step)
      expect(errors).toContain('Hint at index 0 must have level >= 1')
    })
  })

  describe('getHint', () => {
    it('should return hint by level', () => {
      const step: LearningStep = {
        id: 'step-1',
        objective: 'Learn grouping',
        instruction: 'Group adjacent cells',
        hints: [
          { level: 1, text: 'First hint' },
          { level: 2, text: 'Second hint' },
        ],
      }

      const hint = getHint(step, 1)
      expect(hint?.text).toBe('First hint')
    })

    it('should return undefined for non-existent level', () => {
      const step: LearningStep = {
        id: 'step-1',
        objective: 'Learn grouping',
        instruction: 'Group adjacent cells',
        hints: [
          { level: 1, text: 'First hint' },
        ],
      }

      const hint = getHint(step, 99)
      expect(hint).toBeUndefined()
    })

    it('should return undefined for step with no hints', () => {
      const step: LearningStep = {
        id: 'step-1',
        objective: 'Learn grouping',
        instruction: 'Group adjacent cells',
        hints: [],
      }

      const hint = getHint(step, 1)
      expect(hint).toBeUndefined()
    })
  })

  describe('getMaxHintLevel', () => {
    it('should return the maximum hint level', () => {
      const step: LearningStep = {
        id: 'step-1',
        objective: 'Learn grouping',
        instruction: 'Group adjacent cells',
        hints: [
          { level: 1, text: 'First hint' },
          { level: 3, text: 'Third hint' },
          { level: 2, text: 'Second hint' },
        ],
      }

      expect(getMaxHintLevel(step)).toBe(3)
    })

    it('should return 0 for step with no hints', () => {
      const step: LearningStep = {
        id: 'step-1',
        objective: 'Learn grouping',
        instruction: 'Group adjacent cells',
        hints: [],
      }

      expect(getMaxHintLevel(step)).toBe(0)
    })
  })
})