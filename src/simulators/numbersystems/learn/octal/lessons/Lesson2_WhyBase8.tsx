/**
 * Lesson 2: What is Base?
 * Extremely visual explanation of base concept for octal
 */

import { useState, useEffect, useRef } from 'react'
import { OctalDigitCard } from '../components/OctalDigitCard'
import { Button } from '../../../../../components/ui/Button'
import type { Lesson2State } from '../types/lesson.types'

interface Lesson2Props {
  onComplete?: () => void
}

export function Lesson2_WhyBase8({ onComplete }: Lesson2Props) {
  const [state, setState] = useState<Lesson2State>({
    highlightedDigits: [],
    currentCount: 0,
    showExplanation: false,
    showOctalExplanation: false
  })
  const completionCalled = useRef(false)

  const digits = [0, 1, 2, 3, 4, 5, 6, 7]

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
    }, 300)

    return () => clearInterval(interval)
  }, [])

  const handleReset = () => {
    setState({
      highlightedDigits: [],
      currentCount: 0,
      showExplanation: false,
      showOctalExplanation: false
    })
    completionCalled.current = false
  }

  const handleWhyClick = () => {
    setState(prev => ({ ...prev, showOctalExplanation: true }))
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
          {state.currentCount} / 8 digits
        </div>

        {/* Digit cards with auto-highlight */}
        <div className="flex flex-wrap justify-center gap-3">
          {digits.map((digit) => (
            <OctalDigitCard
              key={digit}
              digit={digit}
              highlighted={state.highlightedDigits.includes(digit)}
              size="medium"
              disabled={true}
            />
          ))}
        </div>

        {/* Arrow animation to base concept */}
        {state.showExplanation && (
          <div className="animate-fade-in-up space-y-4">
            <div className="flex items-center justify-center gap-4">
              <div className="text-2xl" style={{ color: 'var(--text-secondary)' }}>
                8 digits
              </div>
              <div className="text-3xl animate-bounce-subtle" style={{ color: 'var(--accent-primary)' }}>
                ↓
              </div>
              <div className="px-6 py-3 rounded-xl" style={{ backgroundColor: 'var(--accent-primary)' }}>
                <span className="text-2xl font-bold text-white">BASE 8</span>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Base = Number of unique digits/symbols
              </p>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                A number system's "base" tells us how many different symbols it uses.
                Since octal uses 8 digits (0-7), it's called "base 8."
              </p>
            </div>

            {/* Why button */}
            {!state.showOctalExplanation && (
              <Button
                variant="secondary"
                onClick={handleWhyClick}
                className="mt-4"
              >
                Why 8? 🤔
              </Button>
            )}

            {state.showOctalExplanation && (
              <div className="mt-4 p-4 rounded-lg animate-fade-in-up" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                  Octal is useful in computing! It's compact for representing binary data 
                  (each octal digit represents 3 binary bits). It was commonly used in older 
                  computer systems and is still seen in file permissions (like chmod 755).
                </p>
              </div>
            )}

            {/* Key takeaway */}
            <div className="p-6 rounded-xl animate-fade-in-up" style={{ backgroundColor: 'var(--accent-bg)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>
                ✅ Now we know WHY Octal is called Base 8
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

      {/* Computing relevance visualization */}
      <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Visual: 8 Digits = Base 8
        </h3>
        <div className="flex justify-center gap-2 flex-wrap">
          {digits.map((digit) => (
            <div key={digit} className="text-center">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold mb-1"
                style={{
                  backgroundColor: state.highlightedDigits.includes(digit) ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  color: state.highlightedDigits.includes(digit) ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.3s ease'
                }}
              >
                {digit}
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm mt-4 text-center" style={{ color: 'var(--text-muted)' }}>
          Each digit can represent 3 binary bits: 000, 001, 010, 011, 100, 101, 110, 111
        </p>
      </div>
    </div>
  )
}