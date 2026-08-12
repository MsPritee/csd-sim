import { mintermFor, maxtermFor, type InputState, type TruthTableSpec } from '../../../concepts/sop-pos'
import TruthTableMini from '../TruthTableMini'
import GateExplanation from '../GateExplanation'

interface GoalStepProps {
  mode: 'sop' | 'pos'
  spec: TruthTableSpec
  input: InputState
  revealAnswer: boolean
  setRevealAnswer: (value: boolean) => void
}

function answerReason(input: InputState, mode: 'sop' | 'pos'): string {
  return input.variables
    .map((variable, index) => {
      const bit = input.bits[index]
      if (mode === 'sop') {
        return bit === 0 ? `${variable} = 0 → ${variable}'` : `${variable} = 1 → ${variable}`
      }
      return bit === 0 ? `${variable} = 0 stays ${variable}` : `${variable} = 1 → ${variable}'`
    })
    .join(', ')
}

export default function GoalStep({ mode, spec, input, revealAnswer, setRevealAnswer }: GoalStepProps) {
  const isSop = mode === 'sop'
  const tone = isSop ? 'green' : 'red'
  const termNoun = isSop ? 'minterm' : 'maxterm'
  const verb = isSop ? 'product' : 'sum'
  const goal = isSop ? '1' : '0'
  const answer = isSop ? mintermFor(input) : maxtermFor(input)
  const rowLabel = `${input.variables[0]} = ${input.bits[0]}, ${input.variables[1]} = ${input.bits[1]}`
  const goalColor = isSop ? 'text-green-400' : 'text-red-400'
  const revealColor = isSop ? 'text-green-300' : 'text-red-300'
  const boxClass = isSop ? 'border-green-700/40 bg-green-900/10' : 'border-red-700/40 bg-red-900/10'
  const answerColor = isSop ? 'text-green-400' : 'text-red-400'

  return (
    <div className="space-y-3">
      <TruthTableMini spec={spec} tone={tone} />
      <p className="text-sm text-slate-400">
        We want <span className={`font-mono ${goalColor}`}>F = {goal}</span> for the highlighted row:{' '}
        <span className="font-mono text-white">{rowLabel}</span>.
      </p>
      <p className="text-sm text-slate-400">
        What {verb} term will produce <span className={`font-mono ${goalColor}`}>{goal}</span> for{' '}
        <em>exactly</em> this input? Think for a moment…
      </p>
      {!revealAnswer ? (
        <button
          onClick={() => setRevealAnswer(true)}
          className={`rounded bg-slate-800 px-3 py-1.5 text-sm ${revealColor} transition-colors hover:bg-slate-700`}
        >
          Reveal the {termNoun} →
        </button>
      ) : (
        <div className="space-y-3">
          <div className={`rounded-lg border ${boxClass} p-3 text-sm`}>
            <span className="text-slate-400">Answer: </span>
            <span className={`font-mono font-bold ${answerColor}`}>{answer}</span>
            <span className="ml-2 text-slate-500">({answerReason(input, mode)})</span>
          </div>
          <GateExplanation mode={mode} input={input} />
        </div>
      )}
    </div>
  )
}