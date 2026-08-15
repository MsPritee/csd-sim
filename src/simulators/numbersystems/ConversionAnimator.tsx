/**
 * ConversionAnimator - Unified animation controller for all conversion types
 * Provides timeline-based step progression with playback controls
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card } from '../../components/ui'

export type AnimationSpeed = 0.5 | 1 | 1.5 | 2

export interface AnimationStep {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly visualization?: React.ReactNode
}

export interface ConversionAnimatorProps {
  readonly conversionType: 'division' | 'bit-grouping' | 'position-value' | 'general'
  readonly steps: readonly AnimationStep[]
  readonly onStepChange?: (stepIndex: number) => void
  readonly onComplete?: () => void
  readonly initialSpeed?: AnimationSpeed
  readonly showTimeline?: boolean
  readonly showSpeedControl?: boolean
  readonly enableKeyboardShortcuts?: boolean
}

const SPEED_MAP: Record<AnimationSpeed, number> = {
  0.5: 3000,
  1: 1500,
  1.5: 1000,
  2: 750,
}

export function ConversionAnimator({
  conversionType,
  steps,
  onStepChange,
  onComplete,
  initialSpeed = 1,
  showTimeline = true,
  showSpeedControl = true,
  enableKeyboardShortcuts = true,
}: ConversionAnimatorProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<AnimationSpeed>(initialSpeed)
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset animation when steps change
  useEffect(() => {
    setCurrentStep(0)
    setIsPlaying(false)
    setSelectedStep(null)
  }, [steps])

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      if (currentStep >= steps.length - 1 && isPlaying) {
        setIsPlaying(false)
        onComplete?.()
      }
      return
    }

    timerRef.current = setTimeout(() => {
      nextStep()
    }, SPEED_MAP[speed])

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isPlaying, currentStep, steps.length, speed, onComplete])

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          previousStep()
          break
        case 'ArrowRight':
          e.preventDefault()
          nextStep()
          break
        case ' ':
          e.preventDefault()
          togglePlay()
          break
        case 'Home':
          e.preventDefault()
          resetAnimation()
          break
        case 'End':
          e.preventDefault()
          goToStep(steps.length - 1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enableKeyboardShortcuts, steps.length])

  const resetAnimation = useCallback(() => {
    setCurrentStep(0)
    setIsPlaying(false)
    setSelectedStep(null)
    onStepChange?.(0)
  }, [onStepChange])

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = Math.min(prev + 1, steps.length - 1)
      onStepChange?.(next)
      return next
    })
  }, [steps.length, onStepChange])

  const previousStep = useCallback(() => {
    setCurrentStep((prev) => {
      const prevStep = Math.max(0, prev - 1)
      onStepChange?.(prevStep)
      return prevStep
    })
  }, [onStepChange])

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  const goToStep = useCallback((stepIndex: number) => {
    const validIndex = Math.max(0, Math.min(stepIndex, steps.length - 1))
    setCurrentStep(validIndex)
    setSelectedStep(validIndex)
    onStepChange?.(validIndex)
  }, [steps.length, onStepChange])

  const handleSpeedChange = useCallback((newSpeed: AnimationSpeed) => {
    setSpeed(newSpeed)
  }, [])

  const getConversionTypeLabel = () => {
    switch (conversionType) {
      case 'division':
        return 'Division Method'
      case 'bit-grouping':
        return 'Bit Grouping Method'
      case 'position-value':
        return 'Position Value Method'
      case 'general':
        return 'Conversion Steps'
    }
  }

  const currentStepData = steps[currentStep]

  return (
    <Card title={`${getConversionTypeLabel()} Animator`}>
      <div className="space-y-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-3 p-3 rounded-md" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <button
            onClick={resetAnimation}
            className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            title="Reset to beginning (Home)"
          >
            ◀◀
          </button>

          <button
            onClick={previousStep}
            disabled={currentStep === 0}
            className="px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            title="Previous step (Left Arrow)"
          >
            ◀
          </button>

          <button
            onClick={togglePlay}
            className="px-4 py-1.5 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: isPlaying ? 'var(--accent-secondary)' : 'var(--accent-primary)',
              color: 'white',
            }}
            title="Play/Pause (Space)"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <button
            onClick={nextStep}
            disabled={currentStep >= steps.length - 1}
            className="px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            title="Next step (Right Arrow)"
          >
            ▶
          </button>

          <button
            onClick={() => goToStep(steps.length - 1)}
            className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            title="Go to end (End)"
          >
            ▶▶
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Step {currentStep + 1}/{steps.length}
            </span>
          </div>

          {showSpeedControl && (
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Speed:</span>
              <select
                value={speed}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value) as AnimationSpeed)}
                className="px-2 py-1 rounded text-sm"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              >
                <option value="0.5">0.5x</option>
                <option value="1">1x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </div>
          )}

          <button
            onClick={resetAnimation}
            className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            title="Restart animation"
          >
            🔄 Restart
          </button>
        </div>

        {/* Timeline */}
        {showTimeline && (
          <div className="p-4 rounded-md border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Timeline:
              </span>
              <div className="flex items-center gap-1 flex-1">
                {steps.map((step, index) => {
                  const isCompleted = index < currentStep
                  const isCurrent = index === currentStep
                  const isSelected = selectedStep === index
                  
                  return (
                    <React.Fragment key={step.id}>
                      <button
                        onClick={() => goToStep(index)}
                        className="w-4 h-4 rounded-full transition-all"
                        style={{
                          backgroundColor: isCurrent 
                            ? 'var(--accent-primary)' 
                            : isCompleted 
                              ? 'var(--success-bg)' 
                              : 'var(--bg-tertiary)',
                          border: `2px solid ${isSelected ? 'var(--accent-primary)' : isCurrent ? 'var(--accent-primary)' : isCompleted ? 'var(--success-border)' : 'var(--border-color)'}`,
                          transform: isCurrent ? 'scale(1.2)' : 'scale(1)',
                        }}
                        title={step.title}
                      />
                      {index < steps.length - 1 && (
                        <div
                          className="flex-1 h-0.5"
                          style={{
                            backgroundColor: index < currentStep ? 'var(--success-bg)' : 'var(--border-color)',
                          }}
                        />
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </div>

            {/* Step Labels */}
            <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
              {steps.map((step, index) => (
                <span
                  key={step.id}
                  className="cursor-pointer hover:underline"
                  style={{ 
                    color: index === currentStep ? 'var(--accent-primary)' : 'inherit',
                    fontWeight: index === currentStep ? 'bold' : 'normal',
                  }}
                  onClick={() => goToStep(index)}
                >
                  {step.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Current Step Description */}
        {currentStepData && (
          <div
            className="p-4 rounded-md border"
            style={{ 
              backgroundColor: 'var(--accent-bg)', 
              borderColor: 'var(--accent-border)' 
            }}
          >
            <div className="text-sm font-medium mb-1" style={{ color: 'var(--accent-primary)' }}>
              {currentStepData.title}
            </div>
            <div className="text-base" style={{ color: 'var(--accent-text)' }}>
              {currentStepData.description}
            </div>
          </div>
        )}

        {/* Current Step Visualization */}
        {currentStepData?.visualization && (
          <div
            className="p-4 rounded-md border"
            style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              borderColor: 'var(--border-color)',
              opacity: selectedStep === null ? 1 : 0.7,
            }}
          >
            {currentStepData.visualization}
          </div>
        )}

        {/* Keyboard Shortcuts Help */}
        {enableKeyboardShortcuts && (
          <div className="text-xs text-center p-2 rounded-md" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
            Keyboard shortcuts: <span className="font-mono">←→</span> navigate steps, <span className="font-mono">Space</span> play/pause, <span className="font-mono">Home</span> reset, <span className="font-mono">End</span> jump to end
          </div>
        )}
      </div>
    </Card>
  )
}