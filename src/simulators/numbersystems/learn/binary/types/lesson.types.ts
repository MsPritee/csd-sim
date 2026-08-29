/**
 * Type definitions for Binary Learn Module
 */

export type LessonNumber = 1 | 2 | 3 | 4 | 5 | 6

export interface Lesson {
  id: LessonNumber
  title: string
  description: string
  completed: boolean
}

export interface LessonProgress {
  currentLesson: LessonNumber
  completedLessons: Set<LessonNumber>
  lessonProgress: Record<LessonNumber, number> // 0-100 per lesson
}

export interface Lesson1State {
  revealedQuestions: number[]
  allQuestionsRevealed: boolean
}

export interface Lesson2State {
  highlightedDigits: number[]
  currentCount: number
  showExplanation: boolean
  showBitExplanation: boolean
}

export interface Lesson3State {
  clickedPositions: number[]
  revealedValues: number[]
  showSumAnimation: boolean
}

export interface Lesson4State {
  currentTier: number // 0-3
  showArrows: boolean
  completedTiers: number[]
}

export interface Lesson5State {
  currentChallenge: number
  correctAnswers: number
  showResult: boolean
  selectedAnswer: string | null
  builderDigits: [number, number, number]
}

export interface FinalState {
  showConfetti: boolean
  revealProgress: number
  completed: boolean
}