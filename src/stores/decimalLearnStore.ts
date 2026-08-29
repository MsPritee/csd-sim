/**
 * Decimal Learn Store - Zustand store for progress tracking
 */

import { create } from 'zustand'
import type { LessonNumber, LessonProgress } from '../simulators/numbersystems/learn/types/lesson.types'

interface DecimalLearnStore extends LessonProgress {
  // User preferences
  animationSpeed: 'slow' | 'normal' | 'fast'
  soundEnabled: boolean
  showHints: boolean
  
  // Actions
  setCurrentLesson: (lesson: LessonNumber) => void
  markLessonComplete: (lesson: LessonNumber) => void
  updateLessonProgress: (lesson: LessonNumber, progress: number) => void
  resetProgress: () => void
  setAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => void
  setSoundEnabled: (enabled: boolean) => void
  setShowHints: (show: boolean) => void
}

export const useDecimalLearnStore = create<DecimalLearnStore>((set) => ({
  // Initial state
  currentLesson: 1,
  completedLessons: new Set<LessonNumber>(),
  lessonProgress: {} as Record<LessonNumber, number>,
  animationSpeed: 'normal',
  soundEnabled: false,
  showHints: true,
  
  // Actions
  setCurrentLesson: (lesson) => set({ currentLesson: lesson }),
  
  markLessonComplete: (lesson) => set((state) => ({
    completedLessons: new Set([...state.completedLessons, lesson]),
    lessonProgress: { ...state.lessonProgress, [lesson]: 100 }
  })),
  
  updateLessonProgress: (lesson, progress) => set((state) => ({
    lessonProgress: { ...state.lessonProgress, [lesson]: progress }
  })),
  
  resetProgress: () => set({
    currentLesson: 1,
    completedLessons: new Set<LessonNumber>(),
    lessonProgress: {} as Record<LessonNumber, number>
  }),
  
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
  
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  
  setShowHints: (show) => set({ showHints: show })
}))
