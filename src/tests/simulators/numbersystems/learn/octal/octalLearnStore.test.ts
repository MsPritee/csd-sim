/**
 * Tests for octalLearnStore
 * Tests state management and actions for octal learn module
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useOctalLearnStore } from '../../../../../stores/octalLearnStore'

describe('octalLearnStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useOctalLearnStore.getState().resetProgress()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useOctalLearnStore.getState()
      
      expect(state.currentLesson).toBe(1)
      expect(state.completedLessons).toBeInstanceOf(Set)
      expect(state.completedLessons.size).toBe(0)
      expect(state.lessonProgress).toEqual({})
      expect(state.animationSpeed).toBe('normal')
      expect(state.soundEnabled).toBe(false)
      expect(state.showHints).toBe(true)
    })
  })

  describe('setCurrentLesson', () => {
    it('should set current lesson', () => {
      const store = useOctalLearnStore.getState()
      store.setCurrentLesson(3)
      
      expect(useOctalLearnStore.getState().currentLesson).toBe(3)
    })

    it('should accept valid lesson numbers', () => {
      const store = useOctalLearnStore.getState();
      
      [1, 2, 3, 4, 5, 6].forEach(lesson => {
        store.setCurrentLesson(lesson as any)
        expect(useOctalLearnStore.getState().currentLesson).toBe(lesson)
      })
    })
  })

  describe('markLessonComplete', () => {
    it('should mark lesson as completed', () => {
      const store = useOctalLearnStore.getState()
      store.markLessonComplete(2)
      
      const state = useOctalLearnStore.getState()
      expect(state.completedLessons.has(2)).toBe(true)
      expect(state.lessonProgress[2]).toBe(100)
    })

    it('should mark multiple lessons as completed', () => {
      const store = useOctalLearnStore.getState()
      store.markLessonComplete(1)
      store.markLessonComplete(3)
      store.markLessonComplete(5)
      
      const state = useOctalLearnStore.getState()
      expect(state.completedLessons.size).toBe(3)
      expect(state.completedLessons.has(1)).toBe(true)
      expect(state.completedLessons.has(3)).toBe(true)
      expect(state.completedLessons.has(5)).toBe(true)
    })

    it('should set lesson progress to 100 when marked complete', () => {
      const store = useOctalLearnStore.getState()
      store.markLessonComplete(4)
      
      expect(useOctalLearnStore.getState().lessonProgress[4]).toBe(100)
    })
  })

  describe('updateLessonProgress', () => {
    it('should update lesson progress', () => {
      const store = useOctalLearnStore.getState()
      store.updateLessonProgress(2, 50)
      
      expect(useOctalLearnStore.getState().lessonProgress[2]).toBe(50)
    })

    it('should update progress for multiple lessons', () => {
      const store = useOctalLearnStore.getState()
      store.updateLessonProgress(1, 25)
      store.updateLessonProgress(2, 50)
      store.updateLessonProgress(3, 75)
      
      const state = useOctalLearnStore.getState()
      expect(state.lessonProgress[1]).toBe(25)
      expect(state.lessonProgress[2]).toBe(50)
      expect(state.lessonProgress[3]).toBe(75)
    })

    it('should handle progress updates for same lesson', () => {
      const store = useOctalLearnStore.getState()
      store.updateLessonProgress(1, 30)
      store.updateLessonProgress(1, 60)
      store.updateLessonProgress(1, 90)
      
      expect(useOctalLearnStore.getState().lessonProgress[1]).toBe(90)
    })
  })

  describe('resetProgress', () => {
    it('should reset all progress', () => {
      const store = useOctalLearnStore.getState()
      
      // Set some progress
      store.setCurrentLesson(4)
      store.markLessonComplete(1)
      store.markLessonComplete(2)
      store.updateLessonProgress(3, 50)
      
      // Reset
      store.resetProgress()
      
      const state = useOctalLearnStore.getState()
      expect(state.currentLesson).toBe(1)
      expect(state.completedLessons.size).toBe(0)
      expect(state.lessonProgress).toEqual({})
    })

    it('should not reset user preferences', () => {
      const store = useOctalLearnStore.getState()
      
      // Set user preferences
      store.setAnimationSpeed('fast')
      store.setSoundEnabled(true)
      store.setShowHints(false)
      
      // Reset progress
      store.resetProgress()
      
      const state = useOctalLearnStore.getState()
      expect(state.animationSpeed).toBe('fast')
      expect(state.soundEnabled).toBe(true)
      expect(state.showHints).toBe(false)
    })
  })

  describe('setAnimationSpeed', () => {
    it('should set animation speed to slow', () => {
      const store = useOctalLearnStore.getState()
      store.setAnimationSpeed('slow')
      
      expect(useOctalLearnStore.getState().animationSpeed).toBe('slow')
    })

    it('should set animation speed to normal', () => {
      const store = useOctalLearnStore.getState()
      store.setAnimationSpeed('normal')
      
      expect(useOctalLearnStore.getState().animationSpeed).toBe('normal')
    })

    it('should set animation speed to fast', () => {
      const store = useOctalLearnStore.getState()
      store.setAnimationSpeed('fast')
      
      expect(useOctalLearnStore.getState().animationSpeed).toBe('fast')
    })
  })

  describe('setSoundEnabled', () => {
    it('should enable sound', () => {
      const store = useOctalLearnStore.getState()
      store.setSoundEnabled(true)
      
      expect(useOctalLearnStore.getState().soundEnabled).toBe(true)
    })

    it('should disable sound', () => {
      const store = useOctalLearnStore.getState()
      store.setSoundEnabled(false)
      
      expect(useOctalLearnStore.getState().soundEnabled).toBe(false)
    })
  })

  describe('setShowHints', () => {
    it('should enable hints', () => {
      const store = useOctalLearnStore.getState()
      store.setShowHints(true)
      
      expect(useOctalLearnStore.getState().showHints).toBe(true)
    })

    it('should disable hints', () => {
      const store = useOctalLearnStore.getState()
      store.setShowHints(false)
      
      expect(useOctalLearnStore.getState().showHints).toBe(false)
    })
  })

  describe('Integration Tests', () => {
    it('should handle complete learning flow', () => {
      const store = useOctalLearnStore.getState()
      
      // Start lesson 1
      store.setCurrentLesson(1)
      store.updateLessonProgress(1, 50)
      store.updateLessonProgress(1, 100)
      store.markLessonComplete(1)
      
      // Move to lesson 2
      store.setCurrentLesson(2)
      store.updateLessonProgress(2, 100)
      store.markLessonComplete(2)
      
      // Continue through lessons
      store.setCurrentLesson(3)
      store.markLessonComplete(3)
      
      store.setCurrentLesson(4)
      store.markLessonComplete(4)
      
      store.setCurrentLesson(5)
      store.markLessonComplete(5)
      
      const state = useOctalLearnStore.getState()
      expect(state.completedLessons.size).toBe(5)
      expect(state.currentLesson).toBe(5)
    })

    it('should maintain state consistency', () => {
      const store = useOctalLearnStore.getState()
      
      // Complete lesson 1
      store.markLessonComplete(1)
      
      // Set preferences
      store.setAnimationSpeed('fast')
      store.setSoundEnabled(true)
      
      // Update progress for lesson 2
      store.updateLessonProgress(2, 75)
      
      const state = useOctalLearnStore.getState()
      expect(state.completedLessons.has(1)).toBe(true)
      expect(state.lessonProgress[2]).toBe(75)
      expect(state.animationSpeed).toBe('fast')
      expect(state.soundEnabled).toBe(true)
    })
  })
})