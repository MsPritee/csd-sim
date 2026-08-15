/**
 * DivisionStepsVisualizer - Animated visual component showing division steps
 * for decimal to binary/octal/hexadecimal conversion
 */

import { useState, useEffect, useCallback } from 'react'
import type { DivisionStep } from '../../core/numbersystems/types'
import { Card } from '../../components/ui'

interface DivisionStepsVisualizerProps {
  readonly steps: readonly DivisionStep[]
  readonly targetBase: 2 | 8 | 16
  readonly decimalValue: number
  readonly result: string
}

type AnimationSpeed = 'slow' | 'medium' | 'fast'

const SPEED_MAP: Record<AnimationSpeed, number> = {
  slow: 2000,
  medium: 1000,
  fast: 500,
}

export function DivisionStepsVisualizer({
  steps,
  targetBase,
  decimalValue,
  result,
}: DivisionStepsVisualizerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<AnimationSpeed>('medium')
  const [selectedStep, setSelectedStep] = useState<number | null>(null)

  const resetAnimation = useCallback(() => {
    setCurrentStep(0)
    setIsPlaying(false)
    setSelectedStep(null)
  }, [])

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev < steps.length - 1) {
        return prev + 1
      }
      setIsPlaying(false)
      return prev
    })
  }, [steps.length])

  const previousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }, [])

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) return

    const timer = setTimeout(() => {
      nextStep()
    }, SPEED_MAP[speed])

    return () => clearTimeout(timer)
  }, [isPlaying, currentStep, steps.length, speed, nextStep])

  const getBaseName = () => {
    switch (targetBase) {
      case 2:
        return 'Binary'
      case 8:
        return 'Octal'
      case 16:
        return 'Hexadecimal'
    }
  }

  const formatRemainder = (remainder: number) => {
    if (targetBase === 16 && remainder >= 10) {
      return remainder.toString(16).toUpperCase()
    }
    return remainder.toString()
  }

  const getStepExplanation = (step: DivisionStep) => {
    const formattedRemainder = formatRemainder(step.remainder)
    if (step.isFinalStep) {
      return `Final step: ${step.dividend} ÷ ${step.divisor} = ${step.quotient} with remainder ${formattedRemainder}. This is the most significant digit (MSB).`
    }
    return `${step.dividend} ÷ ${step.divisor} = ${step.quotient} with remainder ${formattedRemainder}. Continue dividing the quotient.`
  }

  const getPositionLabel = (index: number) => {
    const fromBottom = steps.length - 1 - index
    if (fromBottom === 0) return 'MSB (Most Significant Bit)'
    if (fromBottom === steps.length - 1) return 'LSB (Least Significant Bit)'
    return `Position ${fromBottom + 1} from right`
  }

  return (
    <Card title={`Division by ${targetBase} for ${decimalValue} → ${getBaseName()}`}>
      <div className="space-y-4">
        {/* Animation Controls */}
        <div className="flex items-center gap-4 p-3 rounded-md" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <button
            onClick={togglePlay}
            className="px-3 py-1 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: isPlaying ? 'var(--accent-secondary)' : 'var(--accent-primary)',
              color: 'white',
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          <button
            onClick={previousStep}
            disabled={currentStep === 0}
            className="px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          >
            ⏮ Previous
          </button>

          <button
            onClick={nextStep}
            disabled={currentStep >= steps.length - 1}
            className="px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          >
            Next ⏭
          </button>

          <button
            onClick={resetAnimation}
            className="px-3 py-1 rounded text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          >
            🔄 Reset
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Speed:</span>
            <select
              value={speed}
              onChange={(e) => setSpeed(e.target.value as AnimationSpeed)}
              className="px-2 py-1 rounded text-sm"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            >
              <option value="slow">Slow</option>
              <option value="medium">Medium</option>
              <option value="fast">Fast</option>
            </select>
          </div>

          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        {/* Division Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                  Number
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                  ÷ {targetBase}
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                  Quotient
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                  Remainder
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                  Position
                </th>
              </tr>
            </thead>
            <tbody>
              {steps.map((step, index) => (
                <tr
                  key={index}
                  onClick={() => setSelectedStep(index)}
                  className="cursor-pointer transition-colors"
                  style={{
                    backgroundColor: selectedStep === index 
                      ? 'var(--accent-primary)' 
                      : index <= currentStep 
                        ? 'var(--bg-tertiary)' 
                        : 'var(--bg-card)',
                    color: selectedStep === index ? 'white' : 'var(--text-primary)',
                    opacity: index <= currentStep ? 1 : 0.4,
                  }}
                >
                  <td className="px-4 py-2 font-mono font-bold">{step.dividend}</td>
                  <td className="px-4 py-2 font-mono">{step.divisor}</td>
                  <td className="px-4 py-2 font-mono">{step.quotient}</td>
                  <td
                    className="px-4 py-2 font-mono font-bold"
                    style={{
                      color: selectedStep === index ? 'white' : 'var(--accent-primary)',
                    }}
                  >
                    {formatRemainder(step.remainder)}
                  </td>
                  <td className="px-4 py-2 text-sm">{getPositionLabel(index)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Step Explanation */}
        {selectedStep !== null && (
          <div
            className="p-4 rounded-md border"
            style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}
          >
            <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Step {selectedStep + 1} Explanation
            </h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {getStepExplanation(steps[selectedStep]!)}
            </p>
          </div>
        )}

        {/* Result Display */}
        <div
          className="p-4 rounded-md border"
          style={{ backgroundColor: 'var(--success-bg)', borderColor: 'var(--success-border)' }}
        >
          <div className="text-sm mb-2" style={{ color: 'var(--success-text)' }}>
            Result (read remainders from bottom to top):
          </div>
          <div className="text-2xl font-mono font-bold" style={{ color: 'var(--success-text)' }}>
            {result}
          </div>
          <div className="text-sm mt-2" style={{ color: 'var(--success-text)' }}>
            Decimal {decimalValue} = {getBaseName()} {result}
          </div>
        </div>

        {/* Reading Direction Indicator */}
        <div className="flex items-center justify-center gap-2 p-3 rounded-md" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Read remainders:
          </span>
          <div className="flex items-center gap-1">
            <span className="text-lg">⬆️</span>
            <span className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
              Bottom to Top
            </span>
          </div>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            to get the result
          </span>
        </div>
      </div>
    </Card>
  )
}