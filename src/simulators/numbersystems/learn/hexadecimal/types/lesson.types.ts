/**
 * Type definitions for Hexadecimal Learn Module
 */

export type HexDigit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

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
  highlightedDigits: number[] // 0-15 representing hex digits 0-F
  currentCount: number
  showExplanation: boolean
  showHexExplanation: boolean
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
  builderDigits: [number, number, number] // Each can be 0-15 (0-9, 10=A, 11=B, 12=C, 13=D, 14=E, 15=F)
}

export interface FinalState {
  showConfetti: boolean
  revealProgress: number
  completed: boolean
}
