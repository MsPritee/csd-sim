/**
 * OctalLearnLayout - Main layout for octal learn module
 * Combines header, navigation, and lesson content
 */

import { LessonHeader } from '../components/LessonHeader'
import { Lesson1_WhatIsOctal } from './lessons/Lesson1_WhatIsOctal'
import { Lesson2_WhyBase8 } from './lessons/Lesson2_WhyBase8'
import { Lesson3_PositionalSystem } from './lessons/Lesson3_PositionalSystem'
import { Lesson4_UnderstandingPosition } from './lessons/Lesson4_UnderstandingPosition'
import { Lesson5_ChallengeMode } from './lessons/Lesson5_ChallengeMode'
import { LessonFinal_GotIt } from './lessons/LessonFinal_GotIt'
import { useOctalLearnStore } from '../../../../stores/octalLearnStore'
import type { LessonNumber } from './types/lesson.types'

interface OctalLearnLayoutProps {
  onBackToHome: () => void
}

const TOTAL_LESSONS = 5

export function OctalLearnLayout({ onBackToHome }: OctalLearnLayoutProps) {
  const { 
    currentLesson, 
    completedLessons, 
    setCurrentLesson, 
    markLessonComplete 
  } = useOctalLearnStore()

  const handlePrevious = () => {
    if (currentLesson > 1) {
      setCurrentLesson((currentLesson - 1) as LessonNumber)
    }
  }

  const handleNext = () => {
    if (currentLesson < TOTAL_LESSONS) {
      markLessonComplete(currentLesson)
      setCurrentLesson((currentLesson + 1) as LessonNumber)
    }
  }

  const handleComplete = () => {
    markLessonComplete(currentLesson)
    // Could add completion logic here
  }

  const renderLesson = () => {
    switch (currentLesson) {
      case 1:
        return <Lesson1_WhatIsOctal onComplete={() => markLessonComplete(1)} />
      case 2:
        return <Lesson2_WhyBase8 onComplete={() => markLessonComplete(2)} />
      case 3:
        return <Lesson3_PositionalSystem onComplete={() => markLessonComplete(3)} />
      case 4:
        return <Lesson4_UnderstandingPosition onComplete={() => markLessonComplete(4)} />
      case 5:
        return <Lesson5_ChallengeMode onComplete={() => markLessonComplete(5)} />
      case 6:
        return <LessonFinal_GotIt onComplete={() => markLessonComplete(6)} />
      default:
        return <Lesson1_WhatIsOctal onComplete={() => markLessonComplete(1)} />
    }
  }

  const getLessonTitle = () => {
    const titles = {
      1: 'Introduction to Octal Number System',
      2: 'What is Base?',
      3: 'What is Position?',
      4: 'How Position Value Is Calculated',
      5: 'Challenge Mode',
      6: 'Congratulations!'
    }
    return titles[currentLesson as keyof typeof titles]
  }

  const canGoNext = completedLessons.has(currentLesson) || currentLesson === 6

  return (
    <div className="flex-1 p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Back button */}
      <nav className="mb-6">
        <button
          onClick={onBackToHome}
          className="text-sm font-medium hover:underline flex items-center gap-2 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          ← Back to Number Systems
        </button>
      </nav>

      {/* Header */}
      <LessonHeader
        currentLesson={currentLesson}
        totalLessons={TOTAL_LESSONS}
        completedLessons={completedLessons}
        title={getLessonTitle()}
      />

      {/* Lesson content */}
      <div className="max-w-5xl mx-auto">
        {renderLesson()}
      </div>

      {/* Simple Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <button
          onClick={handlePrevious}
          disabled={currentLesson === 1}
          className="px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80"
          style={{ 
            backgroundColor: currentLesson === 1 ? 'var(--bg-tertiary)' : 'var(--accent-primary)',
            color: currentLesson === 1 ? 'var(--text-primary)' : 'white'
          }}
        >
          Previous
        </button>

        {currentLesson === TOTAL_LESSONS ? (
          <button
            onClick={handleComplete}
            disabled={!canGoNext}
            className="px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80"
            style={{ 
              backgroundColor: canGoNext ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: canGoNext ? 'white' : 'var(--text-primary)'
            }}
          >
            Got it!
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className="px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80"
            style={{ 
              backgroundColor: canGoNext ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: canGoNext ? 'white' : 'var(--text-primary)'
            }}
          >
            Next Lesson
          </button>
        )}
      </div>
    </div>
  )
}