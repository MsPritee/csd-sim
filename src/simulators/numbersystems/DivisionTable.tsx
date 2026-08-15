/**
 * DivisionTable - Traditional division table for decimal to binary conversion
 * Shows the classic handwritten division format with animated rows
 */

import type { DivisionStep } from '../../core/numbersystems/types'
import { DivisionRow } from './DivisionRow'

interface DivisionTableProps {
  readonly steps: readonly DivisionStep[]
  readonly currentStep: number
  readonly selectedStep: number | null
  readonly onSelectStep: (index: number) => void
  readonly targetBase: 2 | 8 | 16
  readonly decimalValue: number
}

export function DivisionTable({
  steps,
  currentStep,
  selectedStep,
  onSelectStep,
  targetBase,
  decimalValue,
}: DivisionTableProps) {
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

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Repeated Division by {targetBase}
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Converting {decimalValue} to {getBaseName()}
        </p>
      </div>

      {/* Traditional Division Format Display */}
      <div className="bg-card rounded-lg p-6 border" style={{ borderColor: 'var(--border-color)' }}>
        {/* Column Headers */}
        <div className="grid grid-cols-5 gap-4 mb-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          <div>Dividend</div>
          <div className="text-center">Operation</div>
          <div>Quotient</div>
          <div className="text-center">Remainder</div>
          <div className="text-center">Step</div>
        </div>

        {/* Division Rows */}
        <div className="space-y-2">
          {steps.map((step, index) => (
            <DivisionRow
              key={step.stepNumber}
              step={step}
              isActive={index === currentStep}
              isCompleted={index <= currentStep}
              isSelected={selectedStep === index}
              onSelect={() => onSelectStep(index)}
              targetBase={targetBase}
            />
          ))}
        </div>

        {/* Final Row Indicator */}
        {currentStep >= steps.length - 1 && (
          <div
            className="mt-4 p-3 rounded-md text-center font-medium"
            style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}
          >
            ✓ Division complete - Quotient reached 0
          </div>
        )}
      </div>

      {/* Reading Direction Hint */}
      <div
        className="flex items-center justify-center gap-3 p-3 rounded-md"
        style={{ backgroundColor: 'var(--bg-tertiary)' }}
      >
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Read remainders:
        </span>
        <div className="flex items-center gap-2">
          <span className="text-2xl">⬆️</span>
          <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>
            Bottom to Top
          </span>
        </div>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          to get the result
        </span>
      </div>
    </div>
  )
}
