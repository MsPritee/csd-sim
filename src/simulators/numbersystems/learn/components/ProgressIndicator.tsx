/**
 * ProgressIndicator - Shows lesson progress with dots
 */

interface ProgressIndicatorProps {
  currentLesson: number
  totalLessons: number
  completedLessons: Set<number>
}

export function ProgressIndicator({ 
  currentLesson, 
  totalLessons,
  completedLessons 
}: ProgressIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalLessons }, (_, i) => {
        const lessonNum = i + 1
        const isCurrent = lessonNum === currentLesson
        const isCompleted = completedLessons.has(lessonNum)
        
        return (
          <div
            key={lessonNum}
            className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${isCurrent ? 'scale-125' : 'scale-100'}
            `}
            style={{
              backgroundColor: isCompleted 
                ? 'var(--success-border)' 
                : isCurrent 
                  ? 'var(--accent-primary)' 
                  : 'var(--border-color)',
              boxShadow: isCurrent ? '0 0 10px rgba(139, 92, 246, 0.5)' : 'none'
            }}
            aria-label={`Lesson ${lessonNum}: ${isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Not started'}`}
          />
        )
      })}
    </div>
  )
}
