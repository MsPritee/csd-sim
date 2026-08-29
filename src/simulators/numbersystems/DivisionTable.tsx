/**
 * DivisionTable - Traditional fraction/ladder division layout for decimal to binary conversion
 * Supports progressive row reveal (one step at a time) like the binary-to-decimal grid
 */

import type { DivisionStep } from '../../core/numbersystems/types'

interface DivisionTableProps {
  readonly steps: readonly DivisionStep[]
  readonly currentStep: number
  readonly selectedStep: number | null
  readonly onSelectStep: (index: number) => void
  readonly targetBase: 2 | 8 | 16
  readonly decimalValue: number
  readonly progressiveReveal?: boolean
  readonly finalResult?: string
  readonly showResult?: boolean
}

function formatRemainder(remainder: number, targetBase: 2 | 8 | 16) {
  if (targetBase === 16 && remainder >= 10) {
    return remainder.toString(16).toUpperCase()
  }
  return remainder.toString()
}

export function DivisionTable({
  steps,
  currentStep,
  selectedStep,
  onSelectStep,
  targetBase,
  decimalValue,
  progressiveReveal = false,
  finalResult,
  showResult = false,
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

  const visibleSteps = progressiveReveal
    ? steps.filter((_, index) => index <= currentStep)
    : steps

  const hasVisibleRows = visibleSteps.length > 0
  const isDivisionComplete = currentStep >= steps.length - 1

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Repeated Division by {targetBase}
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Converting {decimalValue} to {getBaseName()}
        </p>
      </div>

      <div
        className="division-ladder-wrapper rounded-xl border-2 overflow-hidden"
        style={{ backgroundColor: '#fffef8', borderColor: '#d4d4d8' }}
      >
        {!hasVisibleRows ? (
          <div className="p-8 text-center space-y-3">
            <div className="text-4xl font-mono font-bold" style={{ color: '#3b82f6' }}>
              ({decimalValue})₁₀
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Press <strong>Start</strong> or <strong>Next</strong> to begin dividing
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto p-4 sm:p-6">
            <table
              className="division-ladder-table w-full border-collapse font-mono"
              role="grid"
              aria-label="Division ladder table"
            >
              <thead>
                <tr>
                  <th
                    className="division-ladder-th px-4 py-2 text-sm font-bold text-center"
                    style={{ color: 'var(--text-primary)', borderBottom: '2px solid #52525b' }}
                  >
                    ÷ {targetBase}
                  </th>
                  <th
                    className="division-ladder-th px-4 py-2 text-sm font-bold text-center"
                    style={{ color: 'var(--text-primary)', borderBottom: '2px solid #52525b' }}
                  >
                    Number
                  </th>
                  <th
                    className="division-ladder-th px-4 py-2 text-sm font-bold text-center"
                    style={{ color: 'var(--text-primary)', borderBottom: '2px solid #52525b' }}
                  >
                    Remainder
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleSteps.map((step, index) => {
                  const isActive = index === currentStep
                  const isSelected = selectedStep === index
                  const isLast = index === visibleSteps.length - 1

                  return (
                    <tr
                      key={step.stepNumber}
                      className={`division-ladder-row animate-grid-row-enter transition-colors-smooth ${
                        isActive ? 'division-ladder-row-active' : ''
                      }`}
                      style={{ animationDelay: `${index * 40}ms` }}
                      onClick={() => onSelectStep(index)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onSelectStep(index)
                        }
                      }}
                      aria-label={`Step ${index + 1}: ${step.dividend} divided by ${step.divisor}, remainder ${step.remainder}`}
                    >
                      <td
                        className="division-ladder-td px-4 py-3 text-center text-lg font-bold"
                        style={{
                          borderBottom: isLast ? 'none' : '1px solid #a1a1aa',
                          borderRight: '2px solid #52525b',
                          color: '#27272a',
                          backgroundColor: isSelected ? '#ede9fe' : isActive ? '#f5f3ff' : 'transparent',
                        }}
                      >
                        {step.divisor}
                      </td>
                      <td
                        className="division-ladder-td px-4 py-3 text-center text-lg font-bold"
                        style={{
                          borderBottom: isLast ? 'none' : '1px solid #a1a1aa',
                          borderRight: '2px solid #52525b',
                          color: '#27272a',
                          backgroundColor: isSelected ? '#ede9fe' : isActive ? '#f5f3ff' : 'transparent',
                        }}
                      >
                        {step.dividend}
                      </td>
                      <td
                        className="division-ladder-td px-4 py-3 text-center"
                        style={{
                          borderBottom: isLast ? 'none' : '1px solid #a1a1aa',
                          color: '#27272a',
                          backgroundColor: isSelected ? '#ede9fe' : isActive ? '#f5f3ff' : 'transparent',
                        }}
                      >
                        <span className="text-sm font-medium mr-2" style={{ color: 'var(--text-secondary)' }}>
                          Remainder
                        </span>
                        <span
                          className="inline-flex items-center justify-center px-3 py-1 rounded-md text-lg font-bold"
                          style={{
                            backgroundColor: step.remainder === 1 ? '#10B981' : '#EF4444',
                            color: 'white',
                            minWidth: '2rem',
                          }}
                        >
                          {formatRemainder(step.remainder, targetBase)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {isDivisionComplete && hasVisibleRows && (
          <div
            className="px-4 py-3 text-center text-sm font-medium border-t"
            style={{
              backgroundColor: '#ecfdf5',
              color: '#059669',
              borderColor: '#a1a1aa',
            }}
          >
            ✓ Division complete — quotient reached 0
          </div>
        )}
      </div>

      {showResult && finalResult && (
        <div className="text-center py-2">
          <div className="text-xl sm:text-2xl font-mono font-bold" style={{ color: '#059669' }}>
            ({decimalValue})₁₀ = ({finalResult})₂
          </div>
        </div>
      )}

      {hasVisibleRows && (
        <div
          className="flex items-center justify-center gap-2 p-3 rounded-lg text-sm"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>Read remainders:</span>
          <span className="text-lg" aria-hidden="true">↑</span>
          <span className="font-bold" style={{ color: '#8b5cf6' }}>
            Bottom to Top
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>to get the result</span>
        </div>
      )}
    </div>
  )
}
