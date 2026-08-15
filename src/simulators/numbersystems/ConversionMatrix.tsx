/**
 * ConversionMatrix - Visualizes all possible conversions for a value
 * Shows a matrix table with all system-to-system conversions
 */

import type { NumberSystem } from '../../core/numbersystems/types'
import { Card } from '../../components/ui'
import { LoadingSpinner } from '../../components/ui'

interface ConversionMatrixProps {
  readonly value: string | number
  readonly baseSystem: NumberSystem
  readonly matrix: Readonly<Record<string, string>>
  readonly loading?: boolean
}

const SYSTEM_LABELS: Record<NumberSystem, string> = {
  decimal: 'Decimal',
  binary: 'Binary',
  hexadecimal: 'Hex',
  octal: 'Octal',
}

const SYSTEM_STYLES: Record<NumberSystem, { backgroundColor: string; color: string }> = {
  decimal: { backgroundColor: 'var(--accent-bg)', color: 'var(--accent-text)' },
  binary: { backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' },
  hexadecimal: { backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)' },
  octal: { backgroundColor: 'var(--error-bg)', color: 'var(--error-text)' },
}

export function ConversionMatrix({
  value,
  baseSystem,
  matrix,
  loading = false,
}: ConversionMatrixProps) {
  const systems: NumberSystem[] = ['decimal', 'binary', 'hexadecimal', 'octal']

  if (loading) {
    return (
      <Card title="Conversion Matrix">
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner />
        </div>
      </Card>
    )
  }

  return (
    <Card title={`Conversion Matrix for: ${typeof value === 'number' ? value : `"${value}"`}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th
                className="border p-2 text-sm font-semibold"
                style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                From \ To
              </th>
              {systems.map((system) => (
                <th
                  key={system}
                  className="border p-2 text-sm font-semibold"
                  style={{ borderColor: 'var(--border-color)', ...SYSTEM_STYLES[system] }}
                >
                  {SYSTEM_LABELS[system]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {systems.map((fromSystem) => (
              <tr key={fromSystem}>
                <td
                  className="border p-2 font-semibold"
                  style={{ borderColor: 'var(--border-color)', ...SYSTEM_STYLES[fromSystem] }}
                >
                  {SYSTEM_LABELS[fromSystem]}
                </td>
                {systems.map((toSystem) => {
                  const key = `${fromSystem}-to-${toSystem}`
                  const cellValue = matrix[key]
                  const isDiagonal = fromSystem === toSystem
                  const isBaseRow = fromSystem === baseSystem

                  return (
                    <td
                      key={toSystem}
                      className="border p-2 text-center font-mono text-sm"
                      style={{
                        borderColor: 'var(--border-color)',
                        backgroundColor: isDiagonal
                          ? 'var(--bg-tertiary)'
                          : isBaseRow
                          ? 'var(--accent-bg)'
                          : 'var(--bg-primary)',
                        color: isDiagonal
                          ? 'var(--text-secondary)'
                          : isBaseRow
                          ? 'var(--accent-primary)'
                          : 'var(--text-primary)',
                        fontWeight: isBaseRow ? '600' : 'normal',
                      }}
                    >
                      {cellValue === 'Error' ? (
                        <span style={{ color: 'var(--error-text)' }}>Error</span>
                      ) : (
                        cellValue
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 border"
            style={{ backgroundColor: 'var(--accent-bg)', borderColor: 'var(--border-color)' }}
          />
          <span>Base system row</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 border"
            style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}
          />
          <span>Same system (no conversion)</span>
        </div>
      </div>
    </Card>
  )
}
