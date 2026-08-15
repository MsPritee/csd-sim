/**
 * NumberSystemSelector - Multi-system selection component
 * Allows users to select source and target number systems for conversion
 */

import type { NumberSystem } from '../../core/numbersystems/types'
import { Select } from '../../components/ui'
import { Alert } from '../../components/ui'

interface NumberSystemSelectorProps {
  readonly fromSystem: NumberSystem
  readonly toSystem: NumberSystem
  readonly onFromSystemChange: (system: NumberSystem) => void
  readonly onToSystemChange: (system: NumberSystem) => void
  readonly disabled?: boolean
}

const SYSTEM_LABELS: Record<NumberSystem, string> = {
  decimal: 'Decimal (Base-10)',
  binary: 'Binary (Base-2)',
  hexadecimal: 'Hexadecimal (Base-16)',
  octal: 'Octal (Base-8)',
}

const SYSTEM_DESCRIPTIONS: Record<NumberSystem, string> = {
  decimal: '0-9 digits, everyday counting',
  binary: '0-1 digits, computer fundamentals',
  hexadecimal: '0-9, A-F digits, compact binary',
  octal: '0-7 digits, historical computing',
}

const SYSTEM_OPTIONS = (['decimal', 'binary', 'hexadecimal', 'octal'] as const).map((system) => ({
  value: system,
  label: SYSTEM_LABELS[system],
}))

export function NumberSystemSelector({
  fromSystem,
  toSystem,
  onFromSystemChange,
  onToSystemChange,
  disabled = false,
}: NumberSystemSelectorProps) {
  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Select
            value={fromSystem}
            onChange={(value) => onFromSystemChange(value as NumberSystem)}
            options={SYSTEM_OPTIONS}
            label="From System"
            description={SYSTEM_DESCRIPTIONS[fromSystem]}
            disabled={disabled}
          />
        </div>

        <div className="flex items-center justify-center pt-6">
          <svg
            className="w-6 h-6"
            style={{ color: 'var(--text-secondary)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </div>

        <div className="flex-1">
          <Select
            value={toSystem}
            onChange={(value) => onToSystemChange(value as NumberSystem)}
            options={SYSTEM_OPTIONS}
            label="To System"
            description={SYSTEM_DESCRIPTIONS[toSystem]}
            disabled={disabled}
          />
        </div>
      </div>

      {fromSystem === toSystem && (
        <Alert variant="warning" className="flex items-center gap-2">
          <svg
            className="w-5 h-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-sm">
            Source and target systems are the same. No conversion will occur.
          </span>
        </Alert>
      )}
    </div>
  )
}
