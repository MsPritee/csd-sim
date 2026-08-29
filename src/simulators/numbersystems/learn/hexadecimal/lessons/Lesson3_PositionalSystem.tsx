/**
 * Lesson 3: What is Position?
 * Shows how same digit has different values based on position - WITHOUT powers
 */

import { useState, useRef } from 'react'
import { HexadecimalDigitCard } from '../components/HexadecimalDigitCard'
import { Button } from '../../../../../components/ui/Button'
import type { Lesson3State } from '../types/lesson.types'

interface Lesson3Props {
  onComplete?: () => void
}

export function Lesson3_PositionalSystem({ onComplete }: Lesson3Props) {
  const [state, setState] = useState<Lesson3State>({
    clickedPositions: [],
    revealedValues: [],
    showSumAnimation: false
  })
  const completionCalled = useRef(false)

  const number = [1, 1, 1] // 111 in hexadecimal
  const positionNames = ['256s', '16s', '1s']
  const positionValues = [256, 16, 1]

  const handlePositionClick = (index: number) => {
    if (state.clickedPositions.includes(index)) return
    
    const newClicked = [...state.clickedPositions, index]
    setState(prev => ({ 
      ...prev, 
      clickedPositions: newClicked,
      revealedValues: [...prev.revealedValues, positionValues[index]]
    }))

    // Show sum animation when all positions clicked
    if (newClicked.length === 3) {
      setTimeout(() => {
        setState(prev => ({ ...prev, showSumAnimation: true }))
        // Mark lesson as complete when animation starts
        if (!completionCalled.current) {
          completionCalled.current = true
          onComplete?.()
        }
      }, 800)
    }
  }

  const handleReset = () => {
    setState({
      clickedPositions: [],
      revealedValues: [],
      showSumAnimation: false
    })
    completionCalled.current = false
  }

  const isComplete = state.showSumAnimation

  return (
    <div className="space-y-8">
      {/* Main content */}
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          What is Position?
        </h2>

        {/* Answer to Question 2 from Lesson 1 */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
          <p className="text-base font-medium" style={{ color: 'var(--accent-primary)' }}>
            🎯 Answer to Question 2 from Lesson 1
          </p>
        </div>

        {/* Question */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Why does the same digit have different values?
          </p>
        </div>

        {/* Number display */}
        <div className="flex justify-center gap-4 mb-8">
          {number.map((digit, index) => (
            <div key={index} className="relative">
              <HexadecimalDigitCard
                digit={digit}
                selected={state.clickedPositions.includes(index)}
                onClick={() => handlePositionClick(index)}
                size="large"
                disabled={state.showSumAnimation}
              />
              
              {/* Position name reveal */}
              {state.clickedPositions.includes(index) && (
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 animate-fade-in">
                  <div className="px-3 py-1 rounded text-sm font-medium" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent-primary)' }}>
                    {positionNames[index]}
                  </div>
                </div>
              )}

              {/* Value reveal */}
              {state.clickedPositions.includes(index) && (
                <div className="absolute -bottom-28 left-1/2 -translate-x-1/2 animate-fade-in-up">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{digit}</span>
                    <span className="text-xl" style={{ color: 'var(--text-secondary)' }}>→</span>
                    <span className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>{positionValues[index]}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sum animation */}
        {state.showSumAnimation && (
          <div className="animate-fade-in-up space-y-4">
            <div className="flex items-center justify-center gap-2 text-2xl">
              <span style={{ color: 'var(--text-primary)' }}>256</span>
              <span style={{ color: 'var(--text-secondary)' }}>+</span>
              <span style={{ color: 'var(--text-primary)' }}>16</span>
              <span style={{ color: 'var(--text-secondary)' }}>+</span>
              <span style={{ color: 'var(--text-primary)' }}>1</span>
              <span style={{ color: 'var(--text-secondary)' }}>=</span>
              <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>273</span>
            </div>

            <div className="inline-block px-6 py-3 rounded-xl" style={{ backgroundColor: 'var(--accent-bg)' }}>
              <p className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>
                POSITION MATTERS
              </p>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                The same digit (1) has different values depending on its position:
              </p>
              <div className="mt-2 space-y-1">
                <p style={{ color: 'var(--text-primary)' }}>• 1 in 1s place = 1</p>
                <p style={{ color: 'var(--text-primary)' }}>• 1 in 16s place = 16</p>
                <p style={{ color: 'var(--text-primary)' }}>• 1 in 256s place = 256</p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!state.showSumAnimation && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Click on each digit to see how position changes its value
          </p>
        )}

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

      {/* Key concept banner */}
      <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Key Concept
        </h3>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          In positional number systems, a digit's value depends on its position. 
          The same digit can represent different values depending on where it appears in the number.
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
          💡 Next lesson: We'll learn HOW position value is calculated using powers of 16!
        </p>
      </div>
    </div>
  )
}
