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
    <div className="inline-block overflow-hidden rounded-lg border border-slate-700 bg-slate-800">
      <table className="text-sm">
        <thead>
          <tr className="bg-slate-700/60 text-slate-300">
            {variables.map((v) => (
              <th key={v} className="px-3 py-1.5 font-mono font-medium">
                {v}
              </th>
            ))}
            <th className="px-4 py-1.5 font-mono font-medium text-violet-300">F</th>
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
                className={
                  active
                    ? tone === 'green'
                      ? 'bg-green-500/15 text-green-200'
                      : 'bg-red-500/15 text-red-200'
                    : 'text-slate-400'
                }
              >
                {bits.map((bit, i) => (
                  <td key={i} className="px-3 py-1.5 text-center font-mono">
                    {bit}
                  </td>
                ))}
                <td
                  className={`px-4 py-1.5 text-center font-mono font-bold ${
                    value === 1
                      ? 'text-green-400'
                      : value === 0
                        ? 'text-red-400'
                        : value === 'X'
                          ? 'text-yellow-400'
                          : 'text-slate-500'
                  }`}
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