/**
 * Lesson 2: What is Base?
 * Extremely visual explanation of base concept
 */

import { useState, useEffect, useRef } from 'react'
import { DigitCard } from '../components/DigitCard'
import { Button } from '../../../../components/ui/Button'
import type { Lesson2State } from '../types/lesson.types'

interface Lesson2Props {
  onComplete?: () => void
}

export function Lesson2_WhyBase10({ onComplete }: Lesson2Props) {
  const [state, setState] = useState<Lesson2State>({
    highlightedDigits: [],
    currentCount: 0,
    showExplanation: false,
    showFingerExplanation: false
  })
  const completionCalled = useRef(false)

  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

  useEffect(() => {
    // Auto-highlight sequence on mount
    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < digits.length) {
        setState(prev => ({
          ...prev,
          highlightedDigits: [...prev.highlightedDigits, digits[currentIndex]],
          currentCount: currentIndex + 1
        }))
        currentIndex++
      } else {
        clearInterval(interval)
        setState(prev => ({ ...prev, showExplanation: true }))
        // Mark lesson as complete when animation finishes (only once)
        if (!completionCalled.current) {
          completionCalled.current = true
          onComplete?.()
        }
      }
    }, 400)

    return () => clearInterval(interval)
  }, [])

  const handleReset = () => {
    setState({
      highlightedDigits: [],
      currentCount: 0,
      showExplanation: false,
      showFingerExplanation: false
    })
    completionCalled.current = false
  }

  const handleWhyClick = () => {
    setState(prev => ({ ...prev, showFingerExplanation: true }))
  }

  const isComplete = state.showExplanation

  return (
    <div className="space-y-8">
      {/* Main content */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          What is Base?
        </h2>

        {/* Answer to Question 1 from Lesson 1 */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
          <p className="text-base font-medium" style={{ color: 'var(--accent-primary)' }}>
            🎯 Answer to Question 1 from Lesson 1
          </p>
        </div>

        {/* Counter */}
        <div className="text-4xl font-bold" style={{ color: 'var(--accent-primary)' }}>
          {state.currentCount} / 10 digits
        </div>

        {/* Digit cards with auto-highlight */}
        <div className="flex flex-wrap justify-center gap-4">
          {digits.map((digit) => (
            <DigitCard
              key={digit}
              digit={digit}
              highlighted={state.highlightedDigits.includes(digit)}
              size="large"
              disabled={true}
            />
          ))}
        </div>

        {/* Arrow animation to base concept */}
        {state.showExplanation && (
          <div className="animate-fade-in-up space-y-4">
            <div className="flex items-center justify-center gap-4">
              <div className="text-2xl" style={{ color: 'var(--text-secondary)' }}>
                10 digits
              </div>
              <div className="text-3xl animate-bounce-subtle" style={{ color: 'var(--accent-primary)' }}>
                ↓
              </div>
              <div className="px-6 py-3 rounded-xl" style={{ backgroundColor: 'var(--accent-primary)' }}>
                <span className="text-2xl font-bold text-white">BASE 10</span>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Base = Number of unique digits/symbols
              </p>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                A number system's "base" tells us how many different symbols it uses.
                Since decimal uses 10 digits (0-9), it's called "base 10."
              </p>
            </div>

            {/* Why button */}
            {!state.showFingerExplanation && (
              <Button
                variant="secondary"
                onClick={handleWhyClick}
                className="mt-4"
              >
                Why 10? 🤔
              </Button>
            )}

            {state.showFingerExplanation && (
              <div className="mt-4 p-4 rounded-lg animate-fade-in-up" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                  Humans have 10 fingers! We naturally learned to count using our fingers,
                  which led to the base-10 system we use today.
                </p>
              </div>
            )}

            {/* Key takeaway */}
            <div className="p-6 rounded-xl animate-fade-in-up" style={{ backgroundColor: 'var(--accent-bg)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>
                ✅ Now we know WHY Decimal is called Base 10
              </p>
            </div>
          </div>
        )}

        {/* Reset button */}
        {isComplete && (
          <Button
            variant="secondary"
            onClick={handleReset}
            className="mt-4"
          >
            Watch Again
          </Button>
        )}
      </div>

      {/* Finger counting visualization */}
      <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Visual: 10 Fingers = 10 Digits
        </h3>
        <div className="flex justify-center gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-16 rounded-full flex items-center justify-center text-lg font-bold"
              style={{
                backgroundColor: i < state.currentCount ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: i < state.currentCount ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.3s ease'
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
