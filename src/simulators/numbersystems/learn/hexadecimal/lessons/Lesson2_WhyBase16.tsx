/**
 * Lesson 2: What is Base?
 * Extremely visual explanation of base concept for hexadecimal
 */

import { useState, useEffect, useRef } from 'react'
import { HexadecimalDigitCard } from '../components/HexadecimalDigitCard'
import { Button } from '../../../../../components/ui/Button'
import type { Lesson2State } from '../types/lesson.types'

interface Lesson2Props {
  onComplete?: () => void
}

export function Lesson2_WhyBase16({ onComplete }: Lesson2Props) {
  const [state, setState] = useState<Lesson2State>({
    highlightedDigits: [],
    currentCount: 0,
    showExplanation: false,
    showHexExplanation: false
  })
  const completionCalled = useRef(false)

  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]

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
      showHexExplanation: false
    })
    completionCalled.current = false
  }

  const handleWhyClick = () => {
    setState(prev => ({ ...prev, showHexExplanation: true }))
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
          {state.currentCount} / 16 digits
        </div>

        {/* Digit cards with auto-highlight */}
        <div className="flex flex-wrap justify-center gap-3">
          {digits.map((digit) => (
            <HexadecimalDigitCard
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
                16 digits
              </div>
              <div className="text-3xl animate-bounce-subtle" style={{ color: 'var(--accent-primary)' }}>
                ↓
              </div>
              <div className="px-6 py-3 rounded-xl" style={{ backgroundColor: 'var(--accent-primary)' }}>
                <span className="text-2xl font-bold text-white">BASE 16</span>
              </div>
            </div>

            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Base = Number of unique digits/symbols
              </p>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                A number system's "base" tells us how many different symbols it uses.
                Since hexadecimal uses 16 digits (0-9, A-F), it's called "base 16."
              </p>
            </div>

            {/* Why button */}
            {!state.showHexExplanation && (
              <Button
                variant="secondary"
                onClick={handleWhyClick}
                className="mt-4"
              >
                Why 16? 🤔
              </Button>
            )}

            {state.showHexExplanation && (
              <div className="mt-4 p-4 rounded-lg animate-fade-in-up" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                  Hexadecimal is perfect for computing! Each hex digit represents exactly 4 binary bits (0000 to 1111).
                  This makes it compact for representing memory addresses, color codes (like #FF5733), and binary data.
                  It's commonly used in debugging, file permissions, and computer systems.
                </p>
              </div>
            )}

            {/* Key takeaway */}
            <div className="p-6 rounded-xl animate-fade-in-up" style={{ backgroundColor: 'var(--accent-bg)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>
                ✅ Now we know WHY Hexadecimal is called Base 16
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

      {/* Visual: 16 States = 16 Digits */}
      <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Visual: 16 States = 16 Digits
        </h3>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          Unlike binary (2 states) or octal (8 states), hexadecimal uses 16 unique states,
          making it ideal for representing 4-bit binary data compactly.
        </p>
      </div>
    </div>
  )
}
