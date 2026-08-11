import { motion } from 'framer-motion'
import type { InputState } from '../../concepts/sop-pos'
import { maxtermFor, mintermFor } from '../../concepts/sop-pos'

interface VariableTransformationProps {
  mode: 'sop' | 'pos'
  input: InputState
}

/**
 * Shows, per variable, the journey from its bit value to the literal that ends
 * up inside the term, and WHY the input is complemented.
 *
 * SOP: we need every AND input to be 1  →  0 becomes A', 1 stays A.
 * POS: we need every OR input to be 0   →  1 becomes B', 0 stays B.
 */
export default function VariableTransformation({ mode, input }: VariableTransformationProps) {
  const need = mode === 'sop' ? 1 : 0
  const resultTerm = mode === 'sop' ? mintermFor(input) : maxtermFor(input)

  return (
    <div className="space-y-3">
      {input.variables.map((variable, index) => {
        const bit = input.bits[index]
        const complemented = mode === 'sop' ? bit === 0 : bit === 1
        const literal = complemented ? `${variable}'` : variable
        return (
          <motion.div
            key={variable}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: index * 0.12 }}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2"
          >
            <span className="w-6 font-mono font-semibold text-violet-300">{variable}</span>
            <span
              className={`rounded px-2 py-0.5 font-mono text-sm ${
                bit === 0 ? 'bg-red-900/40 text-red-300' : 'bg-green-900/40 text-green-300'
              }`}
            >
              = {bit}
            </span>
            <span className="text-slate-500">→</span>
            {complemented ? (
              <span className="flex items-center gap-1 rounded bg-violet-700/40 px-2 py-0.5 font-mono text-sm text-violet-200">
                <span>NOT {variable}</span>
              </span>
            ) : (
              <span className="rounded bg-slate-700/50 px-2 py-0.5 font-mono text-sm text-slate-200">
                keep {variable}
              </span>
            )}
            <span className="text-slate-500">→</span>
            <span className="rounded bg-slate-700/60 px-2 py-0.5 font-mono text-sm font-bold text-white">
              {literal}
            </span>
            <span
              className={`ml-auto rounded px-2 py-0.5 font-mono text-xs ${
                mode === 'sop' ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'
              }`}
            >
              needs {need} as a gate input
            </span>
          </motion.div>
        )
      })}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: input.variables.length * 0.12 }}
        className="text-xs text-slate-400"
      >
        <p className="mb-1">
          {mode === 'sop' ? (
            <>The AND gate needs <span className="text-green-300 font-mono">1 AND 1</span>.</>
          ) : (
            <>The OR gate needs <span className="text-red-300 font-mono">0 OR 0</span>.</>
          )}
        </p>
        <p>
          Term: <span className="font-mono text-white">{resultTerm}</span>
        </p>
      </motion.div>
    </div>
  )
}