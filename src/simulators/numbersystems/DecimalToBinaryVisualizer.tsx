/**
 * DecimalToBinaryVisualizer - Visual decimal to binary conversion using traditional repeated division
 * Shows the classic handwritten division format with step-by-step animations
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { DivisionStep } from '../../core/numbersystems/types'
import { generateDivisionSteps } from '../../core/numbersystems/binary'
import { Card } from '../../components/ui/Card'
import { DivisionTable } from './DivisionTable'
import { RemainderIndicator } from './RemainderIndicator'
import { ConversionControls } from './ConversionControls'

interface DecimalToBinaryVisualizerProps {
  readonly decimalValue: number
  readonly onBack?: () => void
}

type AnimationSpeed = 'slow' | 'normal' | 'fast'
type AnimationPhase = 'division' | 'reading' | 'complete'

const SPEED_MAP: Record<AnimationSpeed, number> = {
  slow: 2000,
  normal: 1000,
  fast: 500,
}

export function DecimalToBinaryVisualizer({ decimalValue, onBack: _onBack }: DecimalToBinaryVisualizerProps) {
  // Generate division steps using core function
  const divisionResult = generateDivisionSteps(decimalValue, 2)
  const steps = divisionResult.success ? divisionResult.steps : []
  const finalResult = divisionResult.success ? divisionResult.result : ''

  // Animation state
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<AnimationSpeed>('normal')
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  const [phase, setPhase] = useState<AnimationPhase>('division')
  const [showReadingAnimation, setShowReadingAnimation] = useState(false)
  const [assembledBinary, setAssembledBinary] = useState('')
  const [showExplanation, setShowExplanation] = useState(true)

  // Ref for animation timing and intervals
  const animationRef = useRef<number | null>(null)
  const readingIntervalRef = useRef<number | null>(null)

  // Reset animation when decimal value changes
  useEffect(() => {
    setCurrentStep(0)
    setIsPlaying(false)
    setSelectedStep(null)
    setPhase('division')
    setShowReadingAnimation(false)
    setAssembledBinary('')
    setShowExplanation(true)
    
    // Cleanup any existing animations
    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = null
    }
    if (readingIntervalRef.current) {
      clearInterval(readingIntervalRef.current)
      readingIntervalRef.current = null
    }
  }, [decimalValue])

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
        animationRef.current = null
      }
      return
    }

    if (phase === 'division') {
      if (currentStep < steps.length - 1) {
        animationRef.current = window.setTimeout(() => {
          setCurrentStep((prev) => prev + 1)
        }, SPEED_MAP[speed])
      } else {
        // Division complete, move to reading phase
        setPhase('reading')
        setShowReadingAnimation(true)
        setIsPlaying(false)
      }
    } else if (phase === 'reading' && !readingIntervalRef.current) {
      // Handle reading animation
      const remainders = steps.map((step) => step.remainder).reverse()
      let currentIndex = 0

      readingIntervalRef.current = window.setInterval(() => {
        if (currentIndex < remainders.length) {
          setAssembledBinary((prev) => prev + remainders[currentIndex]!)
          currentIndex++
        } else {
          if (readingIntervalRef.current) {
            clearInterval(readingIntervalRef.current)
            readingIntervalRef.current = null
          }
          setPhase('complete')
          setIsPlaying(false)
        }
      }, SPEED_MAP[speed] / 2)
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
        animationRef.current = null
      }
      if (readingIntervalRef.current) {
        clearInterval(readingIntervalRef.current)
        readingIntervalRef.current = null
      }
    }
  }, [isPlaying, currentStep, steps.length, speed, phase])

  const nextStep = useCallback(() => {
    if (phase === 'division') {
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1)
      } else {
        setPhase('reading')
        setShowReadingAnimation(true)
      }
    } else if (phase === 'reading') {
      if (!showReadingAnimation) {
        setShowReadingAnimation(true)
      } else {
        // Manual step through reading animation
        const remainders = steps.map((step) => step.remainder).reverse()
        const nextIndex = assembledBinary.length
        if (nextIndex < remainders.length) {
          setAssembledBinary((prev) => prev + remainders[nextIndex]!)
        } else {
          setPhase('complete')
        }
      }
    }
  }, [currentStep, steps.length, phase, showReadingAnimation, assembledBinary])

  const previousStep = useCallback(() => {
    if (phase === 'complete') {
      setPhase('reading')
      const remainders = steps.map((step) => step.remainder).reverse()
      setAssembledBinary(remainders.join(''))
    } else if (phase === 'reading' && showReadingAnimation && assembledBinary.length > 0) {
      // Go back one step in reading animation
      setAssembledBinary((prev) => prev.slice(0, -1))
    } else if (phase === 'reading' && showReadingAnimation) {
      setShowReadingAnimation(false)
      setAssembledBinary('')
    } else if (phase === 'reading') {
      setPhase('division')
      setCurrentStep(steps.length - 1)
    } else if (phase === 'division') {
      setCurrentStep((prev) => Math.max(0, prev - 1))
    }
  }, [phase, showReadingAnimation, steps.length, assembledBinary])

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  const resetAnimation = useCallback(() => {
    setCurrentStep(0)
    setIsPlaying(false)
    setSelectedStep(null)
    setPhase('division')
    setShowReadingAnimation(false)
    setAssembledBinary('')
    setShowExplanation(true)
    
    // Cleanup animations
    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = null
    }
    if (readingIntervalRef.current) {
      clearInterval(readingIntervalRef.current)
      readingIntervalRef.current = null
    }
  }, [])

  const getStepExplanation = (step: DivisionStep) => {
    if (step.isFinalStep) {
      return `${step.dividend} ÷ 2 = ${step.quotient} remainder ${step.remainder}. The quotient has reached 0, so we stop dividing. This remainder (${step.remainder}) is the most significant bit (MSB).`
    }
    return `${step.dividend} ÷ 2 = ${step.quotient} remainder ${step.remainder}. We continue dividing the quotient (${step.quotient}) by 2.`
  }

  const getCurrentExplanation = () => {
    if (phase === 'complete') {
      return 'Conversion complete! The binary representation is built by reading the remainders from bottom to top.'
    }
    if (phase === 'reading') {
      return 'Reading remainders from bottom to top to build the binary number...'
    }
    if (selectedStep !== null && steps[selectedStep]) {
      return getStepExplanation(steps[selectedStep]!)
    }
    if (steps[currentStep]) {
      return getStepExplanation(steps[currentStep]!)
    }
    return ''
  }

  const getRemaindersForDisplay = () => {
    return steps.map((step) => step.remainder)
  }

  const handleStepSelect = (index: number) => {
    setSelectedStep(index)
    setCurrentStep(index)
  }

  const formatBinaryDisplay = () => {
    if (phase === 'complete') {
      return finalResult
    }
    if (assembledBinary) {
      return assembledBinary.padEnd(finalResult.length, '_')
    }
    return '_'.repeat(finalResult.length || steps.length)
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault()
          nextStep()
          break
        case 'ArrowLeft':
          e.preventDefault()
          previousStep()
          break
        case 'Enter':
          e.preventDefault()
          togglePlay()
          break
        case 'Escape':
          e.preventDefault()
          resetAnimation()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextStep, previousStep, togglePlay, resetAnimation])

  if (!divisionResult.success) {
    return (
      <Card title="Error">
        <div className="p-4 text-center" style={{ color: 'var(--error-text)' }}>
          {divisionResult.error || 'Failed to generate division steps'}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Decimal and Binary displays */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Decimal Input Display */}
        <Card title="DECIMAL">
          <div className="text-center">
            <div className="text-4xl font-mono font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>
              ({decimalValue})₁₀
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Input value
            </div>
          </div>
        </Card>

        {/* Conversion Arrow */}
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">↓</div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Repeated Division by 2
            </div>
          </div>
        </div>

        {/* Binary Result Display */}
        <Card title="BINARY">
          <div className="text-center">
            <div className="text-4xl font-mono font-bold mb-2" style={{ color: 'var(--success-text)' }}>
              ({formatBinaryDisplay()})₂
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {phase === 'complete' ? 'Final result' : 'Building...'}
            </div>
          </div>
        </Card>
      </div>

      {/* Animation Controls */}
      <Card title="Controls">
        <ConversionControls
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onNext={nextStep}
          onPrevious={previousStep}
          onReset={resetAnimation}
          speed={speed}
          onSpeedChange={setSpeed}
          currentStep={currentStep}
          totalSteps={steps.length}
          phase={phase}
        />
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            aria-label={showExplanation ? 'Hide explanation' : 'Show explanation'}
          >
            {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
          </button>
        </div>
      </Card>

      {/* Main Division Table */}
      <DivisionTable
        steps={steps}
        currentStep={currentStep}
        selectedStep={selectedStep}
        onSelectStep={handleStepSelect}
        targetBase={2}
        decimalValue={decimalValue}
      />

      {/* Step Explanation Panel */}
      {showExplanation && (
        <Card title="Explanation">
          <div className="p-4">
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {getCurrentExplanation()}
            </p>
          </div>
        </Card>
      )}

      {/* Remainder Reading Animation */}
      {showReadingAnimation && phase !== 'division' && (
        <Card title="Reading Remainders Bottom to Top">
          <div className="space-y-4">
            {/* Remainder Column */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                REMAINDERS (read from bottom)
              </div>
              <div className="flex flex-col-reverse gap-2">
                {getRemaindersForDisplay().map((remainder, index) => (
                  <RemainderIndicator
                    key={index}
                    remainder={remainder}
                    targetBase={2}
                    isCurrent={false}
                    isCompleted={true}
                    animate={false}
                  />
                ))}
              </div>
            </div>

            {/* Animated Arrow */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="text-4xl animate-bounce">⬆️</div>
                <div className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
                  Read this direction
                </div>
              </div>
            </div>

            {/* Assembled Binary */}
            {assembledBinary && (
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--success-bg)' }}>
                <div className="text-sm mb-2" style={{ color: 'var(--success-text)' }}>
                  Building binary number:
                </div>
                <div className="text-3xl font-mono font-bold" style={{ color: 'var(--success-text)' }}>
                  {assembledBinary}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Educational Callout */}
      {phase === 'complete' && (
        <Card title="Why Read from Bottom to Top?">
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-primary)' }}>
                <strong>Each division produces the next binary digit starting from the least significant bit (LSB).</strong>
              </p>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                The first remainder we get is the least significant bit (rightmost digit). Each subsequent division
                produces the next more significant bit. Therefore, to get the correct binary number, we must read
                the remainders in reverse order - from bottom to top.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  First remainder (top of table)
                </div>
                <div className="text-2xl font-mono font-bold" style={{ color: 'var(--accent-primary)' }}>
                  LSB → Rightmost digit
                </div>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Last remainder (bottom of table)
                </div>
                <div className="text-2xl font-mono font-bold" style={{ color: 'var(--accent-primary)' }}>
                  MSB → Leftmost digit
                </div>
              </div>
            </div>

            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--success-bg)' }}>
              <div className="text-lg font-bold mb-2" style={{ color: 'var(--success-text)' }}>
                Final Result
              </div>
              <div className="text-3xl font-mono font-bold" style={{ color: 'var(--success-text)' }}>
                ({decimalValue})₁₀ = ({finalResult})₂
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Keyboard Shortcuts Help */}
      <Card title="Keyboard Shortcuts">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 text-sm">
          <div>
            <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>Space</kbd>
            <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>Next step</span>
          </div>
          <div>
            <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>→</kbd>
            <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>Next step</span>
          </div>
          <div>
            <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>←</kbd>
            <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>Previous step</span>
          </div>
          <div>
            <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>Enter</kbd>
            <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>Play/Pause</span>
          </div>
          <div>
            <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>Escape</kbd>
            <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>Restart</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
