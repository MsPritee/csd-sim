/**
 * BinaryToDecimalVisualizer - Visual binary to decimal conversion using positional-weight method
 * Column-aligned grid layout with cumulative step reveal and motion animations
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { generateBinaryToDecimalSteps } from '../../application/numbersystems/conversion'
import { Card } from '../../components/ui/Card'
import { ConversionControls } from './ConversionControls'
import { VisualizerHeader } from './VisualizerHeader'
import { ConversionGridTable } from './ConversionGridTable'
import { CollapsibleSidebar } from './CollapsibleSidebar'
import { CelebrationEffect } from './CelebrationEffect'
import { positionToColumnIndex } from './visualizerUtils'

interface BinaryToDecimalVisualizerProps {
  readonly binaryValue: string
}

type AnimationSpeed = 'slow' | 'normal' | 'fast'

const SPEED_MAP: Record<AnimationSpeed, number> = {
  slow: 2000,
  normal: 1000,
  fast: 500,
}

export function BinaryToDecimalVisualizer({ binaryValue }: BinaryToDecimalVisualizerProps) {
  const visualResult = generateBinaryToDecimalSteps(binaryValue)
  const steps = visualResult.success ? visualResult.steps : []
  const finalResult = visualResult.success ? visualResult.decimalResult : 0

  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<AnimationSpeed>('normal')
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null)
  const [triggerCelebration, setTriggerCelebration] = useState(false)

  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    setCurrentStep(0)
    setIsPlaying(false)
    setSelectedColumn(null)
    setTriggerCelebration(false)

    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = null
    }
  }, [binaryValue])

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
        animationRef.current = null
      }
      return
    }

    if (currentStep < steps.length - 1) {
      animationRef.current = window.setTimeout(() => {
        setCurrentStep((prev) => prev + 1)
      }, SPEED_MAP[speed])
    } else {
      setIsPlaying(false)
      setTriggerCelebration(true)
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
        animationRef.current = null
      }
    }
  }, [isPlaying, currentStep, steps.length, speed])

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setTriggerCelebration(true)
    }
  }, [currentStep, steps.length])

  const previousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }, [])

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  const resetAnimation = useCallback(() => {
    setCurrentStep(0)
    setIsPlaying(false)
    setSelectedColumn(null)
    setTriggerCelebration(false)

    if (animationRef.current) {
      clearTimeout(animationRef.current)
      animationRef.current = null
    }
  }, [])

  const getCurrentPhase = () => {
    if (steps[currentStep]) {
      return steps[currentStep]!.phase
    }
    return 'identify'
  }

  const handleColumnHover = (index: number) => {
    setSelectedColumn(index)
  }

  const handleColumnLeave = () => {
    setSelectedColumn(null)
  }

  const handleColumnClick = (index: number) => {
    setSelectedColumn(index)
    const columnStep = steps.find((s) => s.position === binaryValue.length - 1 - index)
    if (columnStep) {
      setCurrentStep(columnStep.stepNumber - 1)
    }
  }

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

  const currentPhase = getCurrentPhase()
  const currentStepData = steps[currentStep]
  const isComplete = currentPhase === 'result'

  const activeColumn = useMemo(() => {
    if (currentStepData && currentStepData.position >= 0) {
      return positionToColumnIndex(currentStepData.position, binaryValue.length)
    }
    return null
  }, [currentStepData, binaryValue.length])

  if (!visualResult.success) {
    return (
      <Card title="Error">
        <div className="p-4 text-center" style={{ color: 'var(--error-text)' }}>
          {visualResult.error || 'Failed to generate binary-to-decimal steps'}
        </div>
      </Card>
    )
  }

  return (
    <div className="binary-to-decimal-visualizer space-y-3">
      <CelebrationEffect
        trigger={triggerCelebration}
        onComplete={() => setTriggerCelebration(false)}
      />

      <h1 className="sr-only">Binary → Decimal Place Value Method</h1>

      <VisualizerHeader binaryValue={binaryValue} currentPhase={currentPhase} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main grid panel */}
        <div className="lg:col-span-2 space-y-3">
          <ConversionGridTable
            binaryValue={binaryValue}
            currentPhase={currentPhase}
            activeColumn={activeColumn}
            selectedColumn={selectedColumn}
            finalResult={finalResult}
            runningTotal={currentStepData?.runningTotal ?? 0}
            onColumnHover={handleColumnHover}
            onColumnLeave={handleColumnLeave}
            onColumnClick={handleColumnClick}
          />

          {isComplete && (
            <Card title="Conversion Result">
              <div className="text-center p-4 space-y-2 animate-fade-in-up">
                <div
                  className="text-2xl sm:text-3xl font-mono font-bold p-3 rounded-xl"
                  style={{ color: 'white', backgroundColor: '#059669' }}
                >
                  {binaryValue}₂ = {finalResult}₁₀ (Decimal)
                </div>
                <div
                  className="flex items-center justify-center gap-2 p-2 rounded-lg text-sm"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  <span aria-hidden="true">🎉</span>
                  <span>
                    Conversion complete! {binaryValue}₂ equals {finalResult} in decimal.
                  </span>
                </div>
              </div>
            </Card>
          )}

          <Card title="Animation Controls">
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
              phase={currentPhase}
            />
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <CollapsibleSidebar binaryValue={binaryValue} finalResult={finalResult} />
        </div>
      </div>
    </div>
  )
}
