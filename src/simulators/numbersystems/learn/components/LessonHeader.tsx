/**
 * LessonHeader - Header with progress indicator
 */

import { ProgressIndicator } from './ProgressIndicator'

interface LessonHeaderProps {
  currentLesson: number
  totalLessons: number
  completedLessons: Set<number>
  title: string
}

export function LessonHeader({ 
  currentLesson, 
  totalLessons,
  completedLessons,
  title 
}: LessonHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
          Lesson {currentLesson} of {totalLessons}
        </p>
      </div>
      <ProgressIndicator 
        currentLesson={currentLesson}
        totalLessons={totalLessons}
        completedLessons={completedLessons}
      />
    </div>
  )
}
