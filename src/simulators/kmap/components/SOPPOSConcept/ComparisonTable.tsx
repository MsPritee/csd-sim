import { useState } from 'react'
import { motion } from 'framer-motion'
import type { InputState } from '../../concepts/sop-pos'
import { maxtermFor, mintermFor } from '../../concepts/sop-pos'

type ActiveColumn = 'sop' | 'pos' | 'both'

interface ComparisonTableProps {
  input: InputState
}

const ROWS: { label: string; sop: string; pos: string }[] = [
  { label: 'Goal', sop: 'F = 1', pos: 'F = 0' },
  { label: 'Basic unit', sop: 'Minterm', pos: 'Maxterm' },
  { label: 'Gate concept', sop: 'AND', pos: 'OR' },
  { label: 'K-map focus', sop: 'Group 1s', pos: 'Group 0s' },
  { label: 'Required gate inputs', sop: 'All 1', pos: 'All 0' },
  { label: 'If variable = 0', sop: 'Complement', pos: 'Keep' },
  { label: 'If variable = 1', sop: 'Keep', pos: 'Complement' },
]

/**
 * Part 11 + 12: the side-by-side comparison. Click SOP or POS to spotlight the
 * matching pathway, then use the variable demo to see WHY the complementation
 * rule is reversed for minterms vs maxterms.
 */
export default function ComparisonTable({ input }: ComparisonTableProps) {
  const [active, setActive] = useState<ActiveColumn>('both')
  const [demoValue, setDemoValue] = useState<number>(0)

  const demoInput: InputState = {
    variables: input.variables.slice(0, 2),
    bits: [demoValue, demoValue === 0 ? 1 : 0],
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setActive(active === 'sop' ? 'both' : 'sop')}
          className="rounded px-3 py-1 text-sm font-medium transition-colors"
          style={{
            backgroundColor:
              active === 'sop'
                ? 'var(--success-bg)'
                : 'var(--bg-tertiary)',
            color:
              active === 'sop'
                ? 'var(--text-primary)'
                : active === 'both'
                  ? 'var(--text-primary)'
                  : 'var(--text-muted)',
          }}
        >
          Highlight SOP
        </button>
        <button
          onClick={() => setActive(active === 'pos' ? 'both' : 'pos')}
          className="rounded px-3 py-1 text-sm font-medium transition-colors"
          style={{
            backgroundColor:
              active === 'pos'
                ? 'var(--error-bg)'
                : 'var(--bg-tertiary)',
            color:
              active === 'pos'
                ? 'var(--text-primary)'
                : active === 'both'
                  ? 'var(--text-primary)'
                  : 'var(--text-muted)',
          }}
        >
          Highlight POS
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--border-color)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--border-light)', color: 'var(--text-primary)' }}>
              <th className="px-3 py-2 text-left font-medium">Concept</th>
              <th
                className="px-3 py-2 font-medium transition-colors"
                style={{ color: active === 'sop' ? 'var(--success-text)' : 'var(--text-secondary)' }}
              >
                SOP
              </th>
              <th
                className="px-3 py-2 font-medium transition-colors"
                style={{ color: active === 'pos' ? 'var(--error-text)' : 'var(--text-secondary)' }}
              >
                POS
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, idx) => (
              <tr
                key={row.label}
                style={{ backgroundColor: idx % 2 ? 'var(--bg-card)' : 'var(--bg-tertiary)' }}
              >
                <td className="px-3 py-1.5" style={{ color: 'var(--text-secondary)' }}>{row.label}</td>
                <td
                  className="px-3 py-1.5 font-mono transition-colors"
                  style={{
                    backgroundColor:
                      active === 'sop'
                        ? 'var(--success-bg)'
                        : undefined,
                    color:
                      active === 'sop'
                        ? 'var(--success-text)'
                        : active === 'both'
                          ? 'var(--success-text)'
                          : 'var(--text-muted)',
                  }}
                >
                  {row.sop}
                </td>
                <td
                  className="px-3 py-1.5 font-mono transition-colors"
                  style={{
                    backgroundColor:
                      active === 'pos'
                        ? 'var(--error-bg)'
                        : undefined,
                    color:
                      active === 'pos'
                        ? 'var(--error-text)'
                        : active === 'both'
                          ? 'var(--error-text)'
                          : 'var(--text-muted)',
                  }}
                >
                  {row.pos}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border p-3" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
        <p className="mb-2 text-xs" style={{ color: 'var(--text-secondary)' }}>Try a variable:</p>
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Pick A =</span>
          {[0, 1].map((v) => (
            <button
              key={v}
              onClick={() => setDemoValue(v)}
              className="rounded px-2 py-0.5 font-mono text-sm"
              style={{
                backgroundColor: demoValue === v ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: demoValue === v ? 'var(--text-primary)' : 'var(--text-primary)',
              }}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded border p-2 text-xs" style={{ borderColor: 'var(--success-border)', backgroundColor: 'var(--success-bg)' }}>
            <p className="mb-1 font-semibold" style={{ color: 'var(--success-text)' }}>SOP (minterm: {mintermFor(demoInput)})</p>
            <p style={{ color: 'var(--text-secondary)' }}>
              AND needs <span className="font-mono" style={{ color: 'var(--success-text)' }}>1</span>, so if A = {demoValue} we{' '}
              <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{demoValue === 0 ? 'complement → A\'' : 'keep → A'}</span>.
            </p>
          </div>
          <div className="rounded border p-2 text-xs" style={{ borderColor: 'var(--error-border)', backgroundColor: 'var(--error-bg)' }}>
            <p className="mb-1 font-semibold" style={{ color: 'var(--error-text)' }}>POS (maxterm: {maxtermFor(demoInput)})</p>
            <p style={{ color: 'var(--text-secondary)' }}>
              OR needs <span className="font-mono" style={{ color: 'var(--error-text)' }}>0</span>, so if A = {demoValue} we{' '}
              <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{demoValue === 1 ? 'complement → A\'' : 'keep → A'}</span>.
            </p>
          </div>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-2 text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          Same NOT gate, opposite reason: SOP complements 0s to feed 1s into AND; POS complements 1s to feed 0s into OR.
        </motion.p>
      </div>
    </div>
  )
}
