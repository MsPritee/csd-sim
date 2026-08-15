import { useMemo, useState } from 'react'
import type { GateType } from '../../core/gates/types'
import { generateGateChallengeBatch, checkGateChallenge } from '../../education/gates/challenge'

const BATCH_SIZE = 5

interface GateChallengeProps {
  /** Optional fixed seed so tests and previews render a deterministic batch. */
  seed?: string
}

export default function GateChallenge({ seed }: GateChallengeProps = {}) {
  const [round, setRound] = useState(0)
  const [index, setIndex] = useState(0)
  const [chosenGate, setChosenGate] = useState<GateType | null>(null)
  const [draft, setDraft] = useState('')
  const [result, setResult] = useState<ReturnType<typeof checkGateChallenge> | null>(null)
  const [results, setResults] = useState<Record<string, boolean>>({})

  const challenges = useMemo(
    () => generateGateChallengeBatch({ count: BATCH_SIZE, seed: `${seed ?? 'lg8'}:${round}` }),
    [round, seed],
  )

  const challenge = challenges[index]!
  const correctCount = Object.values(results).filter(Boolean).length
  const finished = index >= challenges.length

  const submitGate = (gate: GateType) => {
    setChosenGate(gate)
    const r = checkGateChallenge(challenge, { kind: 'sos-row', seed: challenge.seed, chosenGate: gate })
    setResult(r)
    setResults((prev) => ({ ...prev, [challenge.id]: r.correct }))
  }

  const submitExpression = () => {
    const r = checkGateChallenge(challenge, { kind: 'build-from-description', seed: challenge.seed, expression: draft })
    setResult(r)
    setResults((prev) => ({ ...prev, [challenge.id]: r.correct }))
  }

  const next = () => {
    setIndex((i) => i + 1)
    setChosenGate(null)
    setDraft('')
    setResult(null)
  }

  const restart = () => {
    setRound((r) => r + 1)
    setIndex(0)
    setChosenGate(null)
    setDraft('')
    setResult(null)
    setResults({})
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-card)',
    borderColor: 'var(--border-color)',
  }

  const answered = result !== null

  return (
    <div className="space-y-4">
      <section
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
        style={cardStyle}
        data-testid="challenge-header"
      >
        <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
          Challenge mode
        </span>
        <span className="text-sm tabular-nums" style={{ color: 'var(--text-secondary)' }} data-testid="challenge-progress">
          Challenge {Math.min(index + 1, challenges.length)} / {challenges.length} · {correctCount} solved
        </span>
      </section>

      {finished ? (
        <section className="rounded-xl border p-6 text-center" style={cardStyle} data-testid="challenge-summary">
          <h2 className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>
            Challenges complete
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            You solved <span className="font-mono tabular-nums">{correctCount}</span> of {challenges.length} by
            truth-table equivalence.
          </p>
          <button
            onClick={restart}
            className="mt-4 px-4 py-2 rounded-lg border text-sm transition-colors"
            style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
            data-testid="challenge-restart"
          >
            Restart challenges
          </button>
        </section>
      ) : (
        <>
          <section className="rounded-xl border p-4" style={cardStyle}>
            <div className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }} data-testid="challenge-prompt">
              {challenge.prompt}
            </div>
          </section>

          {challenge.kind === 'sos-row' && (
            <section className="rounded-xl border p-4" style={cardStyle} data-testid="sos-column">
              <div className="flex items-center gap-2 font-mono text-sm tabular-nums">
                <span style={{ color: 'var(--text-muted)' }}>{challenge.inputHeader}</span>
                <span style={{ color: 'var(--text-muted)' }}>Y</span>
              </div>
              <div className="mt-2 flex flex-col gap-1 font-mono text-sm tabular-nums">
                {challenge.outputColumn.map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span style={{ color: 'var(--text-primary)' }}>
                      {challenge.inputLabels.map((_, li) => `${((i >> (challenge.inputCount - 1 - li)) & 1)}`).join(' ')}
                    </span>
                    <span style={{ color: b === 1 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>{b}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {challenge.kind === 'sos-row' && (
            <section>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" data-testid="challenge-options">
                {challenge.options.map((gate) => {
                  const isAnswer = answered && gate === challenge.answer
                  const isChosen = chosenGate === gate
                  let borderColor = 'var(--border-color)'
                  let bg = 'var(--bg-card)'
                  let fg = 'var(--text-secondary)'
                  if (answered) {
                    if (isAnswer) { borderColor = 'var(--success-text)'; bg = 'var(--success-bg)'; fg = 'var(--success-text)' }
                    else if (isChosen) { borderColor = 'var(--danger-text)'; bg = 'var(--danger-bg)'; fg = 'var(--danger-text)' }
                    else { borderColor = 'var(--border-light)'; bg = 'var(--bg-tertiary)'; fg = 'var(--text-muted)' }
                  }
                  return (
                    <button
                      key={gate}
                      onClick={() => submitGate(gate)}
                      disabled={answered}
                      className="px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors"
                      style={{ borderColor, backgroundColor: bg, color: fg }}
                      data-testid={`challenge-option-${gate.toLowerCase()}`}
                    >
                      {gate}
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {challenge.kind === 'build-from-description' && (
            <section className="rounded-xl border p-4" style={cardStyle}>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }} data-testid="challenge-description">
                {challenge.description}
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitExpression()
                  }}
                  placeholder="e.g. A·B  or  (A+B)'"
                  className="flex-1 rounded-lg border px-3 py-2 font-mono text-sm"
                  style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  data-testid="expression-input"
                  disabled={answered}
                />
                <button
                  onClick={submitExpression}
                  disabled={answered || draft.trim() === ''}
                  className="px-4 py-2 rounded-lg border text-sm transition-colors"
                  style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
                  data-testid="challenge-check"
                >
                  Check
                </button>
              </div>
            </section>
          )}

          {answered && (
            <section
              className="rounded-xl border p-4"
              style={{ ...cardStyle, borderColor: result!.correct ? 'var(--success-text)' : 'var(--danger-text)' }}
              data-testid="challenge-feedback"
            >
              <div className="font-semibold" style={{ color: result!.correct ? 'var(--success-text)' : 'var(--danger-text)' }}>
                {result!.correct ? 'Equivalent — correct' : 'Not equivalent'}
              </div>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {result!.feedback}
              </p>
              {result!.mismatches.length > 0 && (
                <div className="mt-3" data-testid="challenge-mismatches">
                  <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
                    Rows that differ
                  </span>
                  <div className="mt-1 space-y-1 font-mono text-sm tabular-nums">
                    {result!.mismatches.map((m, i) => (
                      <div key={i} style={{ color: 'var(--text-secondary)' }}>
                        {challenge.inputLabels.map((l, li) => `${l}=${m.inputs[li] ?? 0}`).join(' ')} → expected{' '}
                        <span style={{ color: 'var(--success-text)' }}>{m.expected}</span>, got{' '}
                        <span style={{ color: 'var(--danger-text)' }}>{m.actual}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!result!.correct && challenge.kind === 'sos-row' && (
                <p className="mt-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                  The output column matches <span className="font-mono font-medium" style={{ color: 'var(--accent-primary)' }}>{challenge.answer}</span>.
                </p>
              )}
              <div className="mt-3">
                <button
                  onClick={next}
                  className="px-3 py-1.5 rounded-lg border text-sm transition-colors"
                  style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
                  data-testid="challenge-next"
                >
                  {index === challenges.length - 1 ? 'Finish' : 'Next challenge'}
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}