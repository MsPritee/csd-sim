/**
 * Octal Learn Store - Zustand store for progress tracking
 */

import { create } from 'zustand'
import type { LessonNumber, LessonProgress } from '../simulators/numbersystems/learn/octal/types/lesson.types'

interface OctalLearnStore extends LessonProgress {
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

export const useOctalLearnStore = create<OctalLearnStore>((set) => ({
  // Initial state
  currentLesson: 1,
  completedLessons: new Set<LessonNumber>(),
  lessonProgress: {} as Record<LessonNumber, number>,
  animationSpeed: 'normal',
  soundEnabled: false,
  showHints: true,
  
  // Actions
  setCurrentLesson: (lesson: LessonNumber) => set({ currentLesson: lesson }),
  
  markLessonComplete: (lesson: LessonNumber) => set((state) => ({
    completedLessons: new Set([...state.completedLessons, lesson]),
    lessonProgress: { ...state.lessonProgress, [lesson]: 100 }
  })),
  
  updateLessonProgress: (lesson: LessonNumber, progress: number) => set((state) => ({
    lessonProgress: { ...state.lessonProgress, [lesson]: progress }
  })),
  
  resetProgress: () => set({
    currentLesson: 1,
    completedLessons: new Set<LessonNumber>(),
    lessonProgress: {} as Record<LessonNumber, number>
  }),
  
  setAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => set({ animationSpeed: speed }),
  setSoundEnabled: (enabled: boolean) => set({ soundEnabled: enabled }),
  setShowHints: (show: boolean) => set({ showHints: show })
}))