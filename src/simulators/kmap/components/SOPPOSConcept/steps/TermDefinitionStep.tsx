import { mintermFor, maxtermFor, type InputState, type TruthTableSpec } from '../../../concepts/sop-pos'
import TruthTableMini from '../TruthTableMini'

interface TermDefinitionStepProps {
  mode: 'sop' | 'pos'
  spec: TruthTableSpec
  input: InputState
}

export default function TermDefinitionStep({ mode, spec, input }: TermDefinitionStepProps) {
  const isSop = mode === 'sop'
  const tone = isSop ? 'green' : 'red'
  const termName = isSop ? 'MINTERM' : 'MAXTERM'
  const verb = isSop ? 'product' : 'sum'
  const goal = isSop ? '1' : '0'
  const answer = isSop ? mintermFor(input) : maxtermFor(input)
  const answerColor = isSop ? 'text-green-400' : 'text-red-400'
  const rowLabel = `${input.variables[0]} = ${input.bits[0]}, ${input.variables[1]} = ${input.bits[1]}`
  const deeper = isSop
    ? 'A minterm is the product of all variables (or their complements) such that the product is 1 for exactly one row of the truth table. Because AND is 1 only when every input is 1, each minterm "selects" a single input combination.'
    : undefined

  return (
    <div className="space-y-3">
      <TruthTableMini spec={spec} tone={tone} />
      <div className="rounded-lg border border-violet-700/40 bg-violet-900/10 p-3 text-sm">
        <p className="font-semibold text-violet-300">{termName}</p>
        <p>A {verb} term that identifies a specific input combination where the output is {goal}.</p>
        <p className="mt-1 text-slate-400">
          <span className={`font-mono ${answerColor}`}>{answer}</span> = {goal} <em>only</em> for {rowLabel}.
        </p>
      </div>
      {deeper && (
        <details className="text-xs text-slate-500">
          <summary className="cursor-pointer text-slate-400">See the deeper explanation</summary>
          <p className="mt-2">{deeper}</p>
        </details>
      )}
    </div>
  )
}