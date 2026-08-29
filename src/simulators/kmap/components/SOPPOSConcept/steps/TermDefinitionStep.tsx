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
  const answerColor = isSop ? 'var(--success-text)' : 'var(--error-text)'
  const rowLabel = `${input.variables[0]} = ${input.bits[0]}, ${input.variables[1]} = ${input.bits[1]}`
  const deeper = isSop
    ? 'A minterm is the product of all variables (or their complements) such that the product is 1 for exactly one row of the truth table. Because AND is 1 only when every input is 1, each minterm "selects" a single input combination.'
    : undefined

  return (
    <div className="space-y-3">
      <TruthTableMini spec={spec} tone={tone} />
      <div
        className="rounded-lg p-3"
        style={{ border: '1px solid var(--border-light)', backgroundColor: 'var(--accent-secondary)', fontSize: '0.875rem' }}
      >
        <p style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{termName}</p>
        <p>A {verb} term that identifies a specific input combination where the output is {goal}.</p>
        <p style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
          <span style={{ fontFamily: 'monospace', color: answerColor }}>{answer}</span> = {goal} <em>only</em> for {rowLabel}.
        </p>
      </div>
      {deeper && (
        <details style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>See the deeper explanation</summary>
          <p style={{ marginTop: '0.5rem' }}>{deeper}</p>
        </details>
      )}
    </div>
  )
}
