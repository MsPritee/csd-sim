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
          className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
            active === 'sop'
              ? 'bg-green-600 text-white'
              : active === 'both'
                ? 'bg-slate-800 text-slate-300'
                : 'bg-slate-800 text-slate-500'
          }`}
        >
          Highlight SOP
        </button>
        <button
          onClick={() => setActive(active === 'pos' ? 'both' : 'pos')}
          className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
            active === 'pos'
              ? 'bg-red-600 text-white'
              : active === 'both'
                ? 'bg-slate-800 text-slate-300'
                : 'bg-slate-800 text-slate-500'
          }`}
        >
          Highlight POS
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-700/60 text-slate-300">
              <th className="px-3 py-2 text-left font-medium">Concept</th>
              <th
                className={`px-3 py-2 font-medium transition-colors ${
                  active === 'sop' ? 'text-green-300' : 'text-slate-400'
                }`}
              >
                SOP
              </th>
              <th
                className={`px-3 py-2 font-medium transition-colors ${
                  active === 'pos' ? 'text-red-300' : 'text-slate-400'
                }`}
              >
                POS
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, idx) => (
              <tr
                key={row.label}
                className={idx % 2 ? 'bg-slate-800/40' : 'bg-slate-800/80'}
              >
                <td className="px-3 py-1.5 text-slate-400">{row.label}</td>
                <td
                  className={`px-3 py-1.5 font-mono transition-colors ${
                    active === 'sop'
                      ? 'bg-green-500/10 text-green-200'
                      : active === 'both'
                        ? 'text-green-300/80'
                        : 'text-slate-500'
                  }`}
                >
                  {row.sop}
                </td>
                <td
                  className={`px-3 py-1.5 font-mono transition-colors ${
                    active === 'pos'
                      ? 'bg-red-500/10 text-red-200'
                      : active === 'both'
                        ? 'text-red-300/80'
                        : 'text-slate-500'
                  }`}
                >
                  {row.pos}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3">
        <p className="mb-2 text-xs text-slate-400">Try a variable:</p>
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="text-xs text-slate-500">Pick A =</span>
          {[0, 1].map((v) => (
            <button
              key={v}
              onClick={() => setDemoValue(v)}
              className={`rounded px-2 py-0.5 font-mono text-sm ${
                demoValue === v ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded border border-green-700/40 bg-green-900/10 p-2 text-xs">
            <p className="mb-1 font-semibold text-green-300">SOP (minterm: {mintermFor(demoInput)})</p>
            <p className="text-slate-400">
              AND needs <span className="font-mono text-green-300">1</span>, so if A = {demoValue} we{' '}
              <span className="font-mono text-white">{demoValue === 0 ? 'complement → A\'' : 'keep → A'}</span>.
            </p>
          </div>
          <div className="rounded border border-red-700/40 bg-red-900/10 p-2 text-xs">
            <p className="mb-1 font-semibold text-red-300">POS (maxterm: {maxtermFor(demoInput)})</p>
            <p className="text-slate-400">
              OR needs <span className="font-mono text-red-300">0</span>, so if A = {demoValue} we{' '}
              <span className="font-mono text-white">{demoValue === 1 ? 'complement → A\'' : 'keep → A'}</span>.
            </p>
          </div>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-2 text-xs text-slate-500"
        >
          Same NOT gate, opposite reason: SOP complements 0s to feed 1s into AND; POS complements 1s to feed 0s into OR.
        </motion.p>
      </div>
    </div>
  )
}