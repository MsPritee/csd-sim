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
  const goalColor = isSop ? 'var(--success-text)' : 'var(--error-text)'
  const revealColor = isSop ? 'var(--success-text)' : 'var(--error-text)'
  const boxBorderColor = isSop ? 'var(--success-text)' : 'var(--error-text)'
  const boxBg = isSop ? 'var(--success-bg)' : 'var(--error-bg)'
  const answerColor = isSop ? 'var(--success-text)' : 'var(--error-text)'

  return (
    <div className="space-y-3">
      <TruthTableMini spec={spec} tone={tone} />
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        We want <span style={{ fontFamily: 'monospace', color: goalColor }}>F = {goal}</span> for the highlighted row:{' '}
        <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{rowLabel}</span>.
      </p>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        What {verb} term will produce <span style={{ fontFamily: 'monospace', color: goalColor }}>{goal}</span> for{' '}
        <em>exactly</em> this input? Think for a moment…
      </p>
      {!revealAnswer ? (
        <button
          onClick={() => setRevealAnswer(true)}
          className="rounded px-3 py-1.5"
          style={{ fontSize: '0.875rem', backgroundColor: 'var(--bg-tertiary)', color: revealColor, transition: 'background-color 0.15s ease' }}
        >
          Reveal the {termNoun} →
        </button>
      ) : (
        <div className="space-y-3">
          <div
            className="rounded-lg p-3"
            style={{ border: `1px solid ${boxBorderColor}`, backgroundColor: boxBg, fontSize: '0.875rem' }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Answer: </span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: answerColor }}>{answer}</span>
            <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>({answerReason(input, mode)})</span>
          </div>
          <GateExplanation mode={mode} input={input} />
        </div>
      )}
    </div>
  )
}
