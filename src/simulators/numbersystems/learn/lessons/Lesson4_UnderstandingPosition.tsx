/**
 * Lesson 4: How Position Value Is Calculated
 * Teaches the mathematical calculation using powers of 10
 */

import { useState, useRef } from 'react'
import { DigitCard } from '../components/DigitCard'
import { Button } from '../../../../components/ui/Button'
import type { Lesson4State } from '../types/lesson.types'

interface Lesson4Props {
  onComplete?: () => void
}

export function Lesson4_UnderstandingPosition({ onComplete }: Lesson4Props) {
  const [state, setState] = useState<Lesson4State>({
    currentTier: 0,
    showArrows: false,
    completedTiers: []
  })
  const completionCalled = useRef(false)

  const number = [5, 3, 7] // 537
  const positionNames = ['Hundreds', 'Tens', 'Ones']
  const placeValues = [100, 10, 1]
  const powersOf10 = ['10²', '10¹', '10⁰']

  const handleNextTier = () => {
    if (state.currentTier < 3) {
      const newTier = state.currentTier + 1
      setState(prev => ({
        ...prev,
        currentTier: newTier,
        completedTiers: [...prev.completedTiers, newTier],
        showArrows: newTier === 3
      }))

      // Mark lesson as complete when final tier is reached
      if (newTier === 3 && !completionCalled.current) {
        completionCalled.current = true
        onComplete?.()
      }
    }
  }

  const handleReset = () => {
    setState({
      currentTier: 0,
      showArrows: false,
      completedTiers: []
    })
    completionCalled.current = false
  }

  const isComplete = state.currentTier === 3

  return (
    <div className="space-y-8">
      {/* Main content */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          How Position Value Is Calculated
        </h2>

        {/* Answer to Question 3 from Lesson 1 */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
          <p className="text-base font-medium" style={{ color: 'var(--accent-primary)' }}>
            🎯 Answer to Question 3 from Lesson 1
          </p>
        </div>

        {/* Question */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            How does a digit get its value?
          </p>
          <p className="text-base mt-2" style={{ color: 'var(--text-secondary)' }}>
            Let's calculate it step by step for 537
          </p>
        </div>

        {/* Number display */}
        <div className="flex justify-center gap-4 mb-12">
          {number.map((digit, index) => (
            <div key={index} className="relative pb-16">
              <DigitCard
                digit={digit}
                size="large"
                disabled={true}
              />

              {/* Tier 1: Position names */}
              {state.currentTier >= 1 && (
                <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 animate-fade-in">
                  <div className="px-3 py-1 rounded text-sm font-medium" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent-primary)' }}>
                    {positionNames[index]}
                  </div>
                </div>
              )}

              {/* Arrow between position and place value */}
              {state.currentTier >= 2 && (
                <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 animate-fade-in">
                  <div className="text-lg" style={{ color: 'var(--accent-primary)' }}>↓</div>
                </div>
              )}

              {/* Tier 2: Place values */}
              {state.currentTier >= 2 && (
                <div className="absolute -bottom-30 left-1/2 -translate-x-1/2 animate-fade-in-up">
                  <div className="px-3 py-1 rounded text-sm font-bold" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                    {placeValues[index]}
                  </div>
                </div>
              )}

              {/* Arrow between place value and power */}
              {state.currentTier >= 3 && (
                <div className="absolute -bottom-36 left-1/2 -translate-x-1/2 animate-fade-in">
                  <div className="text-lg" style={{ color: 'var(--accent-primary)' }}>↓</div>
                </div>
              )}

              {/* Tier 3: Powers of 10 */}
              {state.currentTier >= 3 && (
                <div className="absolute -bottom-44 left-1/2 -translate-x-1/2 animate-fade-in-up">
                  <div className="px-3 py-1 rounded text-sm font-bold" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                    {powersOf10[index]}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tier progression */}
        <div className="space-y-4">
          {!isComplete && (
            <Button
              variant="primary"
              onClick={handleNextTier}
              className="font-medium"
            >
              {state.currentTier === 0 ? 'Show Positions' : state.currentTier === 1 ? 'Show Place Values' : 'Show Powers of 10'}
            </Button>
          )}

          {/* Tier explanations */}
          {state.currentTier >= 1 && (
            <div className="animate-fade-in p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Step 1:</strong> Each position has a name - Hundreds, Tens, Ones
              </p>
            </div>
          )}

          {state.currentTier >= 2 && (
            <div className="animate-fade-in p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Step 2:</strong> Each position has a place value - 100, 10, 1
              </p>
            </div>
          )}

          {state.currentTier >= 3 && (
            <div className="animate-fade-in p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Step 3:</strong> Each place value is a power of 10 - 10², 10¹, 10⁰
              </p>
            </div>
          )}

          {/* Final flow */}
          {isComplete && (
            <div className="animate-fade-in-up p-6 rounded-xl" style={{ backgroundColor: 'var(--accent-bg)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>
                Digit → Position → Power of 10 → Place Value → Contribution
              </p>
            </div>
          )}

          {/* Number breakdown */}
          {isComplete && (
            <div className="animate-fade-in p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Complete Calculation: 537
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>5 × 100 =</span>
                  <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>500</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>3 × 10 =</span>
                  <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>30</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>7 × 1 =</span>
                  <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>7</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border-t-2" style={{ backgroundColor: 'var(--accent-bg)', borderColor: 'var(--accent-primary)' }}>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Total =</span>
                  <span className="font-bold text-xl" style={{ color: 'var(--accent-primary)' }}>537</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reset button */}
        {isComplete && (
          <Button
            variant="secondary"
            onClick={handleReset}
            className="mt-4"
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
}
