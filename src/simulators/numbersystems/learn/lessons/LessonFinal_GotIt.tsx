/**
 * Final Lesson: Got It!
 * Summary screen with celebration animation
 */

import { useState, useEffect, useRef } from 'react'
import { Button } from '../../../../components/ui/Button'
import type { FinalState } from '../types/lesson.types'

interface FinalProps {
  onComplete?: () => void
}

export function LessonFinal_GotIt({ onComplete }: FinalProps) {
  const [state, setState] = useState<FinalState>({
    showConfetti: true,
    revealProgress: 0,
    completed: false
  })
  const completionCalled = useRef(false)

  const summaryPoints = [
    'DECIMAL',
    '10 digits ↓',
    'Base 10 ↓',
    'Position matters ↓',
    'Each position is a power of 10 ↓',
    '10⁰ 10¹ 10² 10³ ...'
  ]

  useEffect(() => {
    // Progressive reveal of summary points
    let index = 0
    const interval = setInterval(() => {
      if (index < summaryPoints.length) {
        setState(prev => ({ ...prev, revealProgress: index + 1 }))
        index++
      } else {
        clearInterval(interval)
      }
    }, 600)

    // Stop confetti after animation
    setTimeout(() => {
      setState(prev => ({ ...prev, showConfetti: false }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const handleComplete = () => {
    setState(prev => ({ ...prev, completed: true }))
    // Mark lesson as complete when user clicks "I Understand"
    if (!completionCalled.current) {
      completionCalled.current = true
      onComplete?.()
    }
  }

  return (
    <div className="space-y-8">
      {/* Main content */}
      <div className="text-center space-y-6">
        {/* Celebration */}
        {state.showConfetti && (
          <div className="text-6xl animate-confetti-burst">
            🎉
          </div>
        )}

        <h2 className="text-4xl font-bold animate-fade-in-up" style={{ color: 'var(--accent-primary)' }}>
          Got it!
        </h2>

        {/* Summary card */}
        <div className="max-w-md mx-auto p-8 rounded-2xl" style={{ 
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)' 
        }}>
          <div className="space-y-4 text-left">
            {summaryPoints.map((point, index) => (
              <div
                key={index}
                className={`
                  text-xl font-bold text-white
                  ${index < state.revealProgress ? 'animate-fade-in-up' : 'opacity-0'}
                `}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {point}
              </div>
            ))}
          </div>
        </div>

        {/* Completion message */}
        {state.revealProgress === summaryPoints.length && (
          <div className="animate-fade-in-up space-y-4">
            <p className="text-2xl font-bold" style={{ color: 'var(--success-text)' }}>
              🎊 Congratulations! 🎊
            </p>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              You've completed the Decimal Number System learning module!
            </p>
          </div>
        )}

        {/* Action buttons */}
        {state.revealProgress === summaryPoints.length && (
          <div className="flex justify-center gap-3">
            <Button
              variant="primary"
              onClick={handleComplete}
              disabled={state.completed}
              className="font-medium"
            >
              {state.completed ? '✓ Completed!' : 'I Understand'}
            </Button>

            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
              className="font-medium"
            >
              Review Lessons
            </Button>
          </div>
        )}

        {/* Certificate badge */}
        {state.completed && (
          <div className="animate-scale-in mt-8 p-6 rounded-xl" style={{ backgroundColor: 'var(--success-bg)' }}>
            <div className="text-5xl mb-2">🏆</div>
            <p className="text-lg font-bold" style={{ color: 'var(--success-text)' }}>
              Certificate of Completion
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              Decimal Number System Mastery
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
