import { useMemo, useState } from 'react'
import type { GateExercise } from '../../education/gates/exercises'
import { generateGateExerciseBatch, checkGateExercise } from '../../education/gates/exercises'

export type GatePracticeDifficulty = 'beginner' | 'intermediate' | 'advanced'

const KIND: Record<GatePracticeDifficulty, GateExercise['kind']> = {
  beginner: 'description-to-gate',
  intermediate: 'table-to-gate',
  advanced: 'expression-to-gate',
}

const DIFFICULTY_LABEL: Record<GatePracticeDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

const BATCH_SIZE = 5

interface GatePracticeProps {
  /** Optional fixed seed so tests and previews render a deterministic batch. */
  seed?: string
}

export default function GatePractice({ seed }: GatePracticeProps = {}) {
  const [difficulty, setDifficulty] = useState<GatePracticeDifficulty>('beginner')
  const [round, setRound] = useState(0)
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [results, setResults] = useState<Record<string, boolean>>({})

  const exercises = useMemo(
    () =>
      generateGateExerciseBatch({
        kind: KIND[difficulty],
        count: BATCH_SIZE,
        seed: `${seed ?? 'lg7'}:${difficulty}:${round}`,
      }),
    [difficulty, round, seed],
  )

  const exercise = exercises[index]!
  const check = chosen !== null ? checkGateExercise(exercise, chosen) : null
  const correctCount = Object.values(results).filter(Boolean).length
  const finished = index >= exercises.length

  const pick = (optionIndex: number) => {
    setChosen(optionIndex)
    setResults((prev) => ({ ...prev, [exercise.id]: checkGateExercise(exercise, optionIndex).correct }))
  }

  const next = () => {
    setIndex((i) => i + 1)
    setChosen(null)
  }

  const restart = () => {
    setRound((r) => r + 1)
    setIndex(0)
    setChosen(null)
    setResults({})
  }

  const retry = () => setChosen(null)

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-card)',
    borderColor: 'var(--border-color)',
  }

  return (
    <div className="space-y-4">
      {/* difficulty + progress */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4" style={cardStyle}>
        <div className="flex flex-wrap gap-2" data-testid="difficulty-selector">
          {(Object.keys(KIND) as GatePracticeDifficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => {
                setDifficulty(d)
                setRound((r) => r + 1)
                setIndex(0)
                setChosen(null)
                setResults({})
              }}
              className="px-3 py-1.5 rounded-lg border text-sm transition-colors"
              style={{
                backgroundColor: difficulty === d ? 'var(--accent-bg)' : 'transparent',
                borderColor: difficulty === d ? 'var(--accent-primary)' : 'var(--border-color)',
                color: difficulty === d ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
              data-testid={`difficulty-${d}`}
            >
              {DIFFICULTY_LABEL[d]}
            </button>
          ))}
        </div>
        <span className="text-sm tabular-nums" style={{ color: 'var(--text-secondary)' }} data-testid="progress">
          Question {Math.min(index + 1, exercises.length)} / {exercises.length} · {correctCount} correct
        </span>
      </section>

      {finished ? (
        <section className="rounded-xl border p-6 text-center" style={cardStyle} data-testid="summary">
          <h2 className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>
            Session complete
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            You answered <span className="font-mono tabular-nums">{correctCount}</span> of {exercises.length} correctly
            at the {DIFFICULTY_LABEL[difficulty].toLowerCase()} level.
          </p>
          <button
            onClick={restart}
            className="mt-4 px-4 py-2 rounded-lg border text-sm transition-colors"
            style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
            data-testid="practice-restart"
          >
            Restart practice
          </button>
        </section>
      ) : (
        <>
          <section className="rounded-xl border p-4" style={cardStyle}>
            <div className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }} data-testid="prompt">
              {exercise.prompt}
            </div>
            <span className="mt-1 inline-block text-xs uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
              {DIFFICULTY_LABEL[difficulty]}
            </span>
          </section>

          {exercise.kind === 'table-to-gate' && exercise.tableLines.length > 0 && (
            <section className="rounded-xl border p-4" style={cardStyle} data-testid="truth-table">
              {exercise.tableLines.map((line, i) => (
                <div key={i} className="font-mono text-sm tabular-nums" style={{ color: i === 0 ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                  {line}
                </div>
              ))}
            </section>
          )}

          <section>
            <div className="grid gap-2 sm:grid-cols-2" data-testid="options">
              {exercise.choices.map((gate, i) => {
                const isAnswer = chosen !== null && gate === exercise.answer
                const isChosen = chosen === i
                let borderColor = 'var(--border-color)'
                let bg = 'var(--bg-card)'
                let fg = 'var(--text-secondary)'
                if (chosen !== null) {
                  if (isAnswer) { borderColor = 'var(--success-text)'; bg = 'var(--success-bg)'; fg = 'var(--success-text)' }
                  else if (isChosen) { borderColor = 'var(--danger-text)'; bg = 'var(--danger-bg)'; fg = 'var(--danger-text)' }
                  else { borderColor = 'var(--border-light)'; bg = 'var(--bg-tertiary)'; fg = 'var(--text-muted)' }
                }
                return (
                  <button
                    key={i}
                    onClick={() => pick(i)}
                    disabled={chosen !== null}
                    className="px-4 py-3 rounded-lg border text-sm font-medium transition-colors text-left"
                    style={{ borderColor, backgroundColor: bg, color: fg }}
                    data-testid={`option-${i}`}
                  >
                    {gate}
                  </button>
                )
              })}
            </div>
          </section>

          {check && (
            <section
              className="rounded-xl border p-4"
              style={{
                ...cardStyle,
                borderColor: check.correct ? 'var(--success-text)' : 'var(--danger-text)',
              }}
              data-testid="feedback"
            >
              <div
                className="font-semibold"
                style={{ color: check.correct ? 'var(--success-text)' : 'var(--danger-text)' }}
              >
                {check.correct ? 'Correct' : 'Not quite'}
              </div>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {check.feedback}
              </p>
              {!check.correct && (
                <p className="mt-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                  <span className="font-medium">Hint: </span>
                  {check.hint}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {!check.correct && (
                  <button
                    onClick={retry}
                    className="px-3 py-1.5 rounded-lg border text-sm transition-colors"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                    data-testid="practice-retry"
                  >
                    Try again
                  </button>
                )}
                <button
                  onClick={next}
                  className="px-3 py-1.5 rounded-lg border text-sm transition-colors"
                  style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
                  data-testid="practice-next"
                >
                  {index === exercises.length - 1 ? 'Finish' : 'Next question'}
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}