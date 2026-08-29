/**
 * LessonNavigation - Previous/Next navigation buttons
 */

import { Button } from '../../../../components/ui/Button'

interface LessonNavigationProps {
  currentLesson: number
  totalLessons: number
  onPrevious: () => void
  onNext: () => void
  onComplete?: () => void
  canGoNext: boolean
}

export function LessonNavigation({ 
  currentLesson, 
  totalLessons,
  onPrevious,
  onNext,
  onComplete,
  canGoNext
}: LessonNavigationProps) {
  const isLastLesson = currentLesson === totalLessons

  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
      <Button
        variant="ghost"
        onClick={onPrevious}
        disabled={currentLesson === 1}
        className="font-medium"
      >
        Previous
      </Button>

      <div className="flex items-center gap-3">
        {isLastLesson ? (
          <Button
            variant="primary"
            onClick={onComplete}
            disabled={!canGoNext}
            className="font-medium"
          >
            Got it!
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={onNext}
            disabled={!canGoNext}
            className="font-medium"
          >
            Next Lesson
          </Button>
        )}
      </div>
    </div>
  )
}
