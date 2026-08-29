/**
 * DecimalToBinaryVisualizer - Visual decimal to binary conversion using traditional repeated division
 * Shows the classic handwritten division format with step-by-step animations
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { DivisionStep } from '../../core/numbersystems/types'
import { generateDivisionSteps } from '../../core/numbersystems/binary'
import { Card } from '../../components/ui/Card'
import { DivisionTable } from './DivisionTable'
import { ConversionControls } from './ConversionControls'
import { CelebrationEffect } from './CelebrationEffect'

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

const MACRO_STEPS = ['Divide', 'Remainder', 'Continue', 'Read Bottom→Top', 'Result'] as const

function RemainderPill({ value, size = 'md' }: { readonly value: number; readonly size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'px-4 py-2 text-xl' : size === 'sm' ? 'px-2 py-0.5 text-sm' : 'px-3 py-1 text-lg'
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg font-mono font-bold ${sizeClass}`}
      style={{
        backgroundColor: value === 1 ? '#10B981' : '#EF4444',
        color: 'white',
        minWidth: size === 'sm' ? '1.75rem' : '2.25rem',
      }}
    >
      {value}
    </span>
  )
}

export function DecimalToBinaryVisualizer({ decimalValue, onBack: _onBack }: DecimalToBinaryVisualizerProps) {
  const divisionResult = generateDivisionSteps(decimalValue, 2)
  const steps = divisionResult.success ? divisionResult.steps : []
  const finalResult = divisionResult.success ? divisionResult.result : ''

  const [, setCurrentStep] = useState(0)
  const [visibleMaxIndex, setVisibleMaxIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<AnimationSpeed>('normal')
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  const [phase, setPhase] = useState<AnimationPhase>('division')
  const [showReadingAnimation, setShowReadingAnimation] = useState(false)
  const [assembledBinary, setAssembledBinary] = useState('')
  const [showExplanation, setShowExplanation] = useState(true)
  const [triggerCelebration, setTriggerCelebration] = useState(false)

  const animationRef = useRef<number | null>(null)
  const readingIntervalRef = useRef<number | null>(null)

  useEffect(() => {
    setCurrentStep(0)
    setVisibleMaxIndex(-1)
    setIsPlaying(false)
    setSelectedStep(null)
    setPhase('division')
    setShowReadingAnimation(false)
    setAssembledBinary('')
    setTriggerCelebration(false)

    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = null
    }
    if (readingIntervalRef.current) {
      clearInterval(readingIntervalRef.current)
      readingIntervalRef.current = null
    }
  }, [decimalValue])

  useEffect(() => {
    if (phase === 'complete' && !triggerCelebration) {
      setTriggerCelebration(true)
    }
  }, [phase, triggerCelebration])

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
        animationRef.current = null
      }
      return
    }

    if (phase === 'division') {
      if (visibleMaxIndex < steps.length - 1) {
        animationRef.current = window.setTimeout(() => {
          setVisibleMaxIndex((prev) => {
            const next = prev + 1
            setCurrentStep(next)
            return next
          })
        }, SPEED_MAP[speed])
      } else {
        setPhase('reading')
        setShowReadingAnimation(true)
        setIsPlaying(false)
      }
    } else if (phase === 'reading' && !readingIntervalRef.current) {
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
  }, [isPlaying, visibleMaxIndex, steps.length, speed, phase])

  const nextStep = useCallback(() => {
    if (phase === 'division') {
      if (visibleMaxIndex < steps.length - 1) {
        const next = visibleMaxIndex + 1
        setVisibleMaxIndex(next)
        setCurrentStep(next)
      } else {
        setPhase('reading')
        setShowReadingAnimation(true)
      }
    } else if (phase === 'reading') {
      if (!showReadingAnimation) {
        setShowReadingAnimation(true)
      } else {
        const remainders = steps.map((step) => step.remainder).reverse()
        const nextIndex = assembledBinary.length
        if (nextIndex < remainders.length) {
          setAssembledBinary((prev) => prev + remainders[nextIndex]!)
        } else {
          setPhase('complete')
        }
      }
    }
  }, [visibleMaxIndex, steps.length, phase, showReadingAnimation, assembledBinary])

  const previousStep = useCallback(() => {
    if (phase === 'complete') {
      setPhase('reading')
      setTriggerCelebration(false)
      const remainders = steps.map((step) => step.remainder).reverse()
      setAssembledBinary(remainders.join(''))
    } else if (phase === 'reading' && showReadingAnimation && assembledBinary.length > 0) {
      setAssembledBinary((prev) => prev.slice(0, -1))
    } else if (phase === 'reading' && showReadingAnimation) {
      setShowReadingAnimation(false)
      setAssembledBinary('')
    } else if (phase === 'reading') {
      setPhase('division')
      setVisibleMaxIndex(steps.length - 1)
      setCurrentStep(steps.length - 1)
    } else if (phase === 'division') {
      if (visibleMaxIndex > -1) {
        const prev = visibleMaxIndex - 1
        setVisibleMaxIndex(prev)
        setCurrentStep(Math.max(0, prev))
      }
    }
  }, [phase, showReadingAnimation, steps.length, assembledBinary, visibleMaxIndex])

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  const resetAnimation = useCallback(() => {
    setCurrentStep(0)
    setVisibleMaxIndex(-1)
    setIsPlaying(false)
    setSelectedStep(null)
    setPhase('division')
    setShowReadingAnimation(false)
    setAssembledBinary('')
    setTriggerCelebration(false)

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
    if (visibleMaxIndex < 0) {
      return `We start with (${decimalValue})₁₀. Divide it by 2 and record the remainder. Press Start or Next to see the first division step.`
    }
    if (selectedStep !== null && steps[selectedStep]) {
      return getStepExplanation(steps[selectedStep]!)
    }
    if (steps[visibleMaxIndex]) {
      return getStepExplanation(steps[visibleMaxIndex]!)
    }
    return ''
  }

  const getRemaindersForDisplay = () => steps.map((step) => step.remainder)

  const handleStepSelect = (index: number) => {
    setSelectedStep(index)
    setCurrentStep(index)
    setVisibleMaxIndex((prev) => Math.max(prev, index))
  }

  const formatBinaryDisplay = () => {
    if (phase === 'complete') {
      return `(${finalResult})`
    }
    if (assembledBinary) {
      return `(${assembledBinary.padEnd(finalResult.length, '_')})`
    }
    return `(${'_'.repeat(finalResult.length || steps.length)})`
  }

  const getProgressIndex = (currentPhase: AnimationPhase, visibleIndex: number, total: number) => {
    switch (currentPhase) {
      case 'division':
        if (visibleIndex < 0) return 0
        if (visibleIndex === 0) return 0
        if (visibleIndex === total - 1) return 1
        return 2
      case 'reading':
        return 3
      case 'complete':
        return 4
      default:
        return 0
    }
  }

  const macroProgressIndex = getProgressIndex(phase, visibleMaxIndex, steps.length)
  const macroProgressPercent = ((macroProgressIndex + 1) / MACRO_STEPS.length) * 100

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

  const activeStepData = visibleMaxIndex >= 0 ? steps[visibleMaxIndex] : undefined

  return (
    <div
      className="decimal-to-binary-visualizer space-y-4"
      aria-label="Decimal to binary conversion visualizer"
    >
      <CelebrationEffect
        trigger={triggerCelebration}
        onComplete={() => setTriggerCelebration(false)}
      />

      <h1 className="sr-only">Decimal → Binary Repeated Division Method</h1>

      {/* Header: title card + stepper + legend */}
      <div className="space-y-3">
        <div className="flex flex-col xl:flex-row xl:items-start gap-3">
          <div
            className="shrink-0 px-4 py-3 rounded-xl shadow-sm"
            style={{ backgroundColor: '#1e3a5f', color: 'white' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">🔢</span>
              <div>
                <div className="font-bold text-base">Decimal → Binary</div>
                <div className="text-xs opacity-80">Repeated Division Method</div>
              </div>
            </div>
          </div>

          <div
            className="flex-1 flex flex-wrap items-center justify-center gap-1.5 px-3 py-2 rounded-xl border"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
          >
            {MACRO_STEPS.map((step, index) => {
              const isCompleted = index < macroProgressIndex
              const isCurrent = index === macroProgressIndex

              return (
                <div key={step} className="flex items-center gap-1">
                  <div
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all-smooth ${
                      isCurrent ? 'visualizer-step-active' : ''
                    }`}
                    style={{
                      backgroundColor: isCurrent ? '#8b5cf6' : isCompleted ? '#ecfdf5' : 'var(--bg-card)',
                      color: isCurrent ? 'white' : isCompleted ? '#059669' : 'var(--text-secondary)',
                      border: isCurrent ? '2px solid #7c3aed' : '1px solid var(--border-color)',
                    }}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {index + 1}. {step}
                  </div>
                  {index < MACRO_STEPS.length - 1 && (
                    <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-secondary)' }}>
                      →
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          <div
            className="shrink-0 flex items-center gap-3 px-3 py-2 rounded-lg text-xs border"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
              1 = Binary 1
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" aria-hidden="true" />
              0 = Binary 0
            </span>
          </div>
        </div>

        <div className="sr-only" aria-live="polite">
          Step {macroProgressIndex + 1} of {MACRO_STEPS.length}: {MACRO_STEPS[macroProgressIndex]}
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main workspace */}
        <div className="lg:col-span-2 space-y-4">
          {/* Division ladder */}
          <div
            className="rounded-xl border p-4"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <DivisionTable
              steps={steps}
              currentStep={visibleMaxIndex}
              selectedStep={selectedStep}
              onSelectStep={handleStepSelect}
              targetBase={2}
              decimalValue={decimalValue}
              progressiveReveal
              showResult={phase === 'complete'}
              finalResult={finalResult}
            />
          </div>

          {/* Live binary preview (always visible) */}
          {phase === 'division' && (
            <div
              className="rounded-xl border p-4 text-center"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Binary Number (building…)
              </div>
              <div
                className="font-mono text-2xl tracking-widest font-bold"
                style={{ color: 'var(--accent-primary)' }}
              >
                {formatBinaryDisplay()}₂
              </div>
            </div>
          )}

          {/* Remainders & binary assembly */}
          {phase !== 'division' && (
            <div
              className="rounded-xl border p-5 space-y-5 animate-fade-in-up"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <div className="text-center font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>
                Reading Remainders Bottom to Top
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-center" style={{ color: 'var(--text-secondary)' }}>
                  Remainders (Top to Bottom):
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {getRemaindersForDisplay().map((remainder, index) => (
                    <RemainderPill key={`remainder-${index}`} value={remainder} />
                  ))}
                </div>
              </div>

              <div className="flex justify-center items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`text-3xl ${phase === 'reading' ? 'animate-bounce' : ''}`}
                    style={{ color: '#8b5cf6' }}
                    aria-hidden="true"
                  >
                    ↑
                  </div>
                  <div className="text-xs font-semibold" style={{ color: '#8b5cf6' }}>
                    Read Bottom to Top
                  </div>
                  {phase === 'reading' && (
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Read this direction
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-center" style={{ color: 'var(--text-secondary)' }}>
                  Binary Number:
                </div>
                <div
                  className="p-4 rounded-xl border text-center font-mono text-2xl sm:text-3xl tracking-widest font-bold"
                  style={{
                    backgroundColor: phase === 'complete' ? '#ecfdf5' : 'var(--bg-tertiary)',
                    borderColor: phase === 'complete' ? '#10B981' : 'var(--border-color)',
                    color: phase === 'complete' ? '#059669' : 'var(--accent-primary)',
                  }}
                >
                  {formatBinaryDisplay()}₂
                </div>
              </div>
            </div>
          )}

          {/* Completion card */}
          {phase === 'complete' && (
            <div className="rounded-xl overflow-hidden border animate-fade-in-up" style={{ borderColor: '#10B981' }}>
              <div className="p-6 text-center space-y-3" style={{ backgroundColor: '#10B981', color: 'white' }}>
                <div className="text-2xl" aria-hidden="true">🎉</div>
                <div className="text-sm font-medium opacity-90">Conversion Complete!</div>
                <div className="text-2xl sm:text-3xl font-mono font-bold">
                  ({decimalValue})₁₀ = ({finalResult})₂
                </div>
              </div>
              <div
                className="flex items-start gap-2 p-4 text-sm"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              >
                <span aria-hidden="true">💡</span>
                <span>
                  We divided by 2 repeatedly, recorded the remainders, and read from bottom to top.
                </span>
              </div>
            </div>
          )}

          {/* Educational callout */}
          {phase === 'complete' && (
            <div
              className="rounded-xl border p-4 space-y-2"
              style={{ backgroundColor: '#fffbeb', borderColor: '#fcd34d' }}
            >
              <div className="font-semibold text-sm" style={{ color: '#92400e' }}>
                Why Read from Bottom to Top?
              </div>
              <p className="text-sm" style={{ color: '#78350f' }}>
                The first remainder is the <strong>LSB</strong> (Least Significant Bit, rightmost digit).
                The last remainder is the <strong>MSB</strong> (Most Significant Bit, leftmost digit).
                Reading bottom to top assembles the binary number in the correct order.
              </p>
            </div>
          )}

          {/* Bottom control bar */}
          <div
            className="rounded-xl border p-3 sticky bottom-2 z-10 shadow-md"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <ConversionControls
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
              onNext={nextStep}
              onPrevious={previousStep}
              onReset={resetAnimation}
              speed={speed}
              onSpeedChange={setSpeed}
              currentStep={Math.max(0, visibleMaxIndex)}
              totalSteps={steps.length}
              phase={phase}
              isPreviousDisabled={visibleMaxIndex < 0 && phase === 'division'}
            />
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span>Step {macroProgressIndex + 1} of {MACRO_STEPS.length}</span>
                <span>
                  {visibleMaxIndex < 0
                    ? `Ready — ${steps.length} division steps`
                    : `Division ${visibleMaxIndex + 1} of ${steps.length}`}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div
                  className="h-full rounded-full transition-all-smooth"
                  style={{ width: `${macroProgressPercent}%`, backgroundColor: '#8b5cf6' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Current step */}
          <div
            className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="px-4 py-3 font-semibold text-sm border-b" style={{
              backgroundColor: '#fef9c3',
              borderColor: 'var(--border-color)',
              color: '#854d0e',
            }}>
              Current Step
            </div>
            <div className="p-4 space-y-3">
              {activeStepData ? (
                <>
                  <div
                    className="p-3 rounded-lg border text-center font-mono text-lg font-bold"
                    style={{
                      backgroundColor: '#fffbeb',
                      borderColor: '#fcd34d',
                      color: '#92400e',
                    }}
                  >
                    {activeStepData.dividend} ÷ 2 = {activeStepData.quotient} R{activeStepData.remainder}
                  </div>
                  <div className="flex justify-center">
                    <RemainderPill value={activeStepData.remainder} size="lg" />
                  </div>
                </>
              ) : (
                <div className="text-sm text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                  Press <strong>Start</strong> or <strong>Next</strong> to divide ({decimalValue})₁₀ by 2
                </div>
              )}
            </div>
          </div>

          {/* Learning guide */}
          <div
            className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="px-4 py-3 font-semibold text-sm border-b" style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}>
              📚 Learning Guide
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="text-sm font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>
                  How it works?
                </div>
                <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-start gap-2">
                    <span aria-hidden="true">➗</span>
                    <span><strong>Divide</strong> the number by 2</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span aria-hidden="true">📝</span>
                    <span><strong>Remainder</strong> — record 0 or 1</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span aria-hidden="true">🔄</span>
                    <span><strong>Continue</strong> with the quotient</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span aria-hidden="true">🔁</span>
                    <span><strong>Repeat</strong> until quotient is 0</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span aria-hidden="true">⬆️</span>
                    <span><strong>Read</strong> remainders bottom to top</span>
                  </div>
                </div>
              </div>

              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d' }}
              >
                <div className="text-sm font-bold mb-1" style={{ color: '#92400e' }}>
                  Key Idea
                </div>
                <div className="text-xs" style={{ color: '#78350f' }}>
                  Each remainder is a binary digit. Read in reverse order (bottom to top) to get the correct binary number.
                </div>
              </div>
            </div>
          </div>

          {/* Explanation panel */}
          <div
            className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
            }}>
              {showExplanation && (
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Explanation
                </span>
              )}
              <button
                onClick={() => setShowExplanation((prev) => !prev)}
                className="text-xs px-2 py-1 rounded-md ml-auto transition-all-smooth"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-primary)' }}
              >
                {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
              </button>
            </div>
            {showExplanation && (
              <div className="p-4 text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {getCurrentExplanation()}
              </div>
            )}
          </div>

          {/* Keyboard shortcuts */}
          <div
            className="rounded-xl border p-4"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="text-sm font-bold mb-3" style={{ color: 'var(--accent-primary)' }}>
              Keyboard Shortcuts
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Space</kbd>
                <span style={{ color: 'var(--text-secondary)' }}>Next</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>→</kbd>
                <span style={{ color: 'var(--text-secondary)' }}>Next</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>←</kbd>
                <span style={{ color: 'var(--text-secondary)' }}>Prev</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Enter</kbd>
                <span style={{ color: 'var(--text-secondary)' }}>Play</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Esc</kbd>
                <span style={{ color: 'var(--text-secondary)' }}>Reset</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
