import { motion } from 'framer-motion'
import type { InputState } from '../../concepts/sop-pos'
import { maxtermFor, mintermFor } from '../../concepts/sop-pos'

interface GateExplanationProps {
  mode: 'sop' | 'pos'
  input: InputState
}

/**
 * Shows the term being evaluated through its gate, row by row:
 *   SOP:  A' · B  =  1 · 1  =  1   (product, true for this combination)
 *   POS:  A + B'  =  0 + 0  =  0   (sum, false for this combination)
 * This is what connects "the notation" back to the AND / OR behaviour.
 */
export default function GateExplanation({ mode, input }: GateExplanationProps) {
  const term = mode === 'sop' ? mintermFor(input) : maxtermFor(input)
  const result = mode === 'sop' ? 1 : 0
  const gateSymbol = mode === 'sop' ? '·' : '+'
  const gateName = mode === 'sop' ? 'AND (product)' : 'OR (sum)'

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-slate-500">Evaluate through the {gateName} gate</span>
        <span className={`rounded px-2 py-0.5 font-mono text-xs ${mode === 'sop' ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
          {gateSymbol}
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="mt-3 grid gap-1"
      >
        <div className="text-sm text-slate-400">
          Literals: <span className="font-mono text-white">{term}</span>
        </div>
        <div className="text-sm text-slate-400">
          Gate inputs:{' '}
          <span className="font-mono">
            {input.variables.map((v, i) => {
              const complemented = mode === 'sop' ? input.bits[i] === 0 : input.bits[i] === 1
              const value = complemented ? (mode === 'sop' ? 1 : 0) : input.bits[i]
              return (
                <span key={v} className="mx-0.5">
                  <span className={value === 1 ? 'text-green-400' : 'text-red-400'}>{value}</span>
                  {i < input.variables.length - 1 ? <span className="text-slate-500"> {gateSymbol} </span> : null}
                </span>
              )
            })}
          </span>
        </div>
        <div className="text-sm font-semibold text-white">
          <span className="text-slate-400">Result: </span>
          <span className={mode === 'sop' ? 'text-green-400' : 'text-red-400'}>{result}</span>
          <span className="ml-2 font-normal text-slate-500">
            {mode === 'sop' ? 'true for exactly this input combination' : 'false for exactly this input combination'}
          </span>
        </div>
      </motion.div>
    </div>
  )
}