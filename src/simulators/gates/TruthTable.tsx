import type { Bit } from '../../core/gates/types'

/**
 * Truth-table panel (LG-05). Renders rows of a generated table and highlights
 * the row matching the current inputs. Presentation only.
 */

export interface TruthTableProps {
  readonly headerLabels: readonly string[]
  readonly table: readonly Bit[][]
  readonly currentInputs: readonly Bit[]
}

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

export default function TruthTable({ headerLabels, table, currentInputs }: TruthTableProps) {
  const currentKey = currentInputs.join('')
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse" data-testid="truth-table">
        <thead>
          <tr>
            {table[0]?.slice(0, -1).map((_, i) => (
              <th key={i} className="px-3 py-1.5 text-left font-medium" style={{ color: 'var(--text-secondary)' }}>
                {headerLabels[i] ?? LABELS[i] ?? '?'}
              </th>
            ))}
            <th className="px-3 py-1.5 text-left font-medium" style={{ color: 'var(--accent-primary)' }}>
              Y
            </th>
          </tr>
        </thead>
        <tbody>
          {table.map((row, rowIndex) => {
            const key = row.slice(0, -1).join('')
            const active = key === currentKey
            return (
              <tr
                key={rowIndex}
                data-testid={`row-${rowIndex}`}
                className="border-t transition-colors"
                style={{
                  borderColor: 'var(--border-color)',
                  backgroundColor: active ? 'var(--accent-bg)' : 'transparent',
                }}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    data-testid={cellIndex === row.length - 1 ? `output-${key}` : undefined}
                    className="px-3 py-1.5 tabular-nums"
                    style={{ color: cell === 1 ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}