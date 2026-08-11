import { describe, it, expect } from 'vitest'
import { getModeConfig, canShowSolution, canShowHints } from '../../../application/kmap/modes'

describe('KMapMode Configuration', () => {
  describe('getModeConfig', () => {
    it('should return correct config for explore mode', () => {
      const config = getModeConfig('explore')
      expect(config.showSolution).toBe(true)
      expect(config.hintsAvailable).toBe(true)
      expect(config.autoAssist).toBe(true)
      expect(config.validationStrictness).toBe('lenient')
      expect(config.feedbackDetail).toBe('detailed')
    })

    it('should return correct config for learn mode', () => {
      const config = getModeConfig('learn')
      expect(config.showSolution).toBe(false)
      expect(config.hintsAvailable).toBe(true)
      expect(config.autoAssist).toBe(true)
      expect(config.validationStrictness).toBe('lenient')
      expect(config.feedbackDetail).toBe('detailed')
    })

    it('should return correct config for practice mode', () => {
      const config = getModeConfig('practice')
      expect(config.showSolution).toBe(false)
      expect(config.hintsAvailable).toBe(true)
      expect(config.autoAssist).toBe(false)
      expect(config.validationStrictness).toBe('strict')
      expect(config.feedbackDetail).toBe('normal')
    })

    it('should return correct config for challenge mode', () => {
      const config = getModeConfig('challenge')
      expect(config.showSolution).toBe(false)
      expect(config.hintsAvailable).toBe(false)
      expect(config.autoAssist).toBe(false)
      expect(config.validationStrictness).toBe('strict')
      expect(config.feedbackDetail).toBe('minimal')
    })

    it('should return correct config for solution mode', () => {
      const config = getModeConfig('solution')
      expect(config.showSolution).toBe(true)
      expect(config.hintsAvailable).toBe(true)
      expect(config.autoAssist).toBe(true)
      expect(config.validationStrictness).toBe('lenient')
      expect(config.feedbackDetail).toBe('detailed')
    })
  })

  describe('canShowSolution', () => {
    it('should return true for explore mode', () => {
      expect(canShowSolution('explore')).toBe(true)
    })

    it('should return false for learn mode', () => {
      expect(canShowSolution('learn')).toBe(false)
    })

    it('should return false for practice mode', () => {
      expect(canShowSolution('practice')).toBe(false)
    })

    it('should return false for challenge mode', () => {
      expect(canShowSolution('challenge')).toBe(false)
    })

    it('should return true for solution mode', () => {
      expect(canShowSolution('solution')).toBe(true)
    })
  })

  describe('canShowHints', () => {
    it('should return true for explore mode', () => {
      expect(canShowHints('explore')).toBe(true)
    })

    it('should return true for learn mode', () => {
      expect(canShowHints('learn')).toBe(true)
    })

    it('should return true for practice mode', () => {
      expect(canShowHints('practice')).toBe(true)
    })

    it('should return false for challenge mode', () => {
      expect(canShowHints('challenge')).toBe(false)
    })

    it('should return true for solution mode', () => {
      expect(canShowHints('solution')).toBe(true)
    })
  })
})