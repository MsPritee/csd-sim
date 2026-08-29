import { motion } from 'framer-motion'
import type { CellValue } from '../../../../core/kmap'
import type { TruthTableSpec } from '../../concepts/sop-pos'

interface TruthTableMiniProps {
  spec: TruthTableSpec
  /** Overrides the row highlight (defaults to spec.highlightMinterm). */
  highlight?: number | null
  /** Green highlight (used when the row is a 1) vs red (used when it is a 0). */
  tone?: 'green' | 'red'
}

/**
 * A compact interactive anotated truth table. The active row is revealed with
 * a motion highlight so the student first recognises a single input
 * combination before any minterm/maxterm notation is introduced.
 */
export default function TruthTableMini({ spec, highlight, tone = 'green' }: TruthTableMiniProps) {
  const { variables, outputs } = spec
  const targetRow = highlight !== undefined ? highlight : spec.highlightMinterm
  const rowCount = 2 ** variables.length

  return (
    <div className="inline-block overflow-hidden rounded-lg border" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
      <table className="text-sm">
        <thead>
          <tr style={{ backgroundColor: 'var(--border-light)', color: 'var(--text-primary)' }}>
            {variables.map((v) => (
              <th key={v} className="px-3 py-1.5 font-mono font-medium">
                {v}
              </th>
            ))}
            <th className="px-4 py-1.5 font-mono font-medium" style={{ color: 'var(--accent-primary)' }}>F</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }, (_, minterm) => {
            const bits = minterm
              .toString(2)
              .padStart(variables.length, '0')
              .split('')
            const value: CellValue = outputs[minterm] ?? null
            const active = targetRow === minterm
            return (
              <motion.tr
                key={minterm}
                initial={active ? { opacity: 0.45 } : false}
                animate={active ? { opacity: 1 } : false}
                transition={{ duration: 0.4 }}
                style={
                  active
                    ? tone === 'green'
                      ? { backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }
                      : { backgroundColor: 'var(--error-bg)', color: 'var(--error-text)' }
                    : { color: 'var(--text-secondary)' }
                }
              >
                {bits.map((bit, i) => (
                  <td key={i} className="px-3 py-1.5 text-center font-mono">
                    {bit}
                  </td>
                ))}
                <td
                  className="px-4 py-1.5 text-center font-mono font-bold"
                  style={{
                    color:
                      value === 1
                        ? 'var(--success-text)'
                        : value === 0
                          ? 'var(--error-text)'
                          : value === 'X'
                            ? 'var(--warning-text)'
                            : 'var(--text-muted)',
                  }}
                >
                  {value === null ? '–' : value}
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
