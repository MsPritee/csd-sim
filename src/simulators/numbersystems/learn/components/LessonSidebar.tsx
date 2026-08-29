/**
 * LessonSidebar - Sidebar for lesson navigation
 */

import { Card } from '../../../../components/ui/Card'

interface LessonSidebarProps {
  currentLesson: number
  completedLessons: Set<number>
  onLessonSelect: (lesson: number) => void
}

const lessons = [
  { id: 1, title: 'What is Decimal?' },
  { id: 2, title: 'Why Base 10?' },
  { id: 3, title: 'Positional System' },
  { id: 4, title: 'Understanding Position' },
  { id: 5, title: 'Place Value' },
  { id: 6, title: 'Number Builder' },
  { id: 7, title: 'Position Ladder' },
]

export function LessonSidebar({ 
  currentLesson, 
  completedLessons,
  onLessonSelect 
}: LessonSidebarProps) {
  return (
    <div className="w-64 flex-shrink-0">
      <Card>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
            Lesson Outline
          </h3>
          <div className="space-y-2">
            {lessons.map((lesson) => {
              const isCurrent = lesson.id === currentLesson
              const isCompleted = completedLessons.has(lesson.id)
              const isAccessible = isCompleted || lesson.id === currentLesson || lesson.id === currentLesson + 1
              
              return (
                <button
                  key={lesson.id}
                  onClick={() => isAccessible && onLessonSelect(lesson.id)}
                  disabled={!isAccessible}
                  className={`
                    w-full text-left p-3 rounded-lg transition-all duration-200
                    ${isCurrent ? 'ring-2' : ''}
                    ${!isAccessible ? 'opacity-50 cursor-not-allowed' : 'hover:scale-102'}
                  `}
                  style={{
                    backgroundColor: isCurrent 
                      ? 'var(--accent-primary)' 
                      : isCompleted 
                        ? 'var(--bg-tertiary)' 
                        : 'var(--bg-secondary)',
                    color: isCurrent 
                      ? 'white' 
                      : 'var(--text-primary)',
                    '--tw-ring-color': isCurrent ? 'var(--accent-primary)' : 'transparent'
                  } as React.CSSProperties}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${isCompleted ? 'bg-green-500' : isCurrent ? 'bg-white text-violet-600' : 'bg-slate-600'}
                    `}>
                      {isCompleted ? '✓' : lesson.id}
                    </div>
                    <span className="text-sm font-medium">{lesson.title}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </Card>
    </div>
  )
}
