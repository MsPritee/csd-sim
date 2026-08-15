/**
 * DivisionRow - Individual row in the division table
 * Shows a single division step with dividend, divisor, quotient, and remainder
 */

import type { DivisionStep } from '../../core/numbersystems/types'

interface DivisionRowProps {
  readonly step: DivisionStep
  readonly isActive: boolean
  readonly isCompleted: boolean
  readonly isSelected: boolean
  readonly onSelect: () => void
  readonly targetBase: 2 | 8 | 16
}

export function DivisionRow({
  step,
  isActive,
  isCompleted,
  isSelected,
  onSelect,
  targetBase,
}: DivisionRowProps) {
  const formatRemainder = (remainder: number) => {
    if (targetBase === 16 && remainder >= 10) {
      return remainder.toString(16).toUpperCase()
    }
    return remainder.toString()
  }

  const getRowStyle = () => {
    if (isSelected) {
      return {
        backgroundColor: 'var(--accent-primary)',
        color: 'white',
      }
    }
    if (isActive) {
      return {
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--text-primary)',
        border: '2px solid var(--accent-primary)',
      }
    }
    if (isCompleted) {
      return {
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--text-primary)',
      }
    }
    return {
      backgroundColor: 'var(--bg-card)',
      color: 'var(--text-primary)',
      opacity: 0.4,
    }
  }

  const rowStyle = getRowStyle()

  return (
    <div
      onClick={onSelect}
      className="flex items-center gap-4 p-3 rounded-md cursor-pointer transition-all duration-300 hover:opacity-80"
      style={rowStyle}
      role="button"
      tabIndex={0}
      aria-label={`Division step ${step.stepNumber}: ${step.dividend} divided by ${step.divisor} equals ${step.quotient} with remainder ${formatRemainder(step.remainder)}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      {/* Dividend */}
      <div className="flex-1 font-mono font-bold text-lg">
        {step.dividend}
      </div>

      {/* Division Symbol and Divisor */}
      <div className="flex items-center gap-2 font-mono">
        <span className="text-xl">÷</span>
        <span className="font-bold">{step.divisor}</span>
      </div>

      {/* Equals */}
      <div className="text-xl">=</div>

      {/* Quotient */}
      <div className="flex-1 font-mono font-bold text-lg">
        {step.quotient}
      </div>

      {/* Remainder */}
      <div
        className="px-3 py-1 rounded-md font-mono font-bold text-lg"
        style={{
          backgroundColor: isSelected 
            ? 'rgba(255, 255, 255, 0.2)' 
            : 'var(--accent-primary)',
          color: isSelected ? 'white' : 'white',
          minWidth: '3rem',
          textAlign: 'center',
        }}
      >
        {formatRemainder(step.remainder)}
      </div>

      {/* Step indicator */}
      <div className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        {step.stepNumber}
      </div>
    </div>
  )
}
