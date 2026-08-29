/**
 * P2 — Practice home: mode + size selection, progress and next concept.
 */

import { useState } from 'react'
import { usePracticeStore } from '../../../stores/practiceStore'
import type { PracticeMode } from '../../../stores/practiceStore'
import { CONCEPTS } from '../../../education/practice/objectives'
import { recommendedNext } from '../../../education/practice/mastery'

interface ModeOption {
  readonly mode: PracticeMode
  readonly title: string
  readonly blurb: string
  readonly hint: 'hints on' | 'no hints'
}

const MODES: readonly ModeOption[] = [
  {
    mode: 'guided',
    title: 'Guided',
    blurb: 'Step-by-step: build groups on the grid, get instant per-group feedback, then derive the expression.',
    hint: 'hints on',
  },
  {
    mode: 'independent',
    title: 'Independent',
    blurb: 'Write the simplified expression and check your reasoning with progressive hints when you need them.',
    hint: 'hints on',
  },
  {
    mode: 'challenge',
    title: 'Challenge',
    blurb: '4-variable maps, harder problems, and no hints. Prove your mastery.',
    hint: 'no hints',
  },
]

function conceptColor(status: string): React.CSSProperties {
  switch (status) {
    case 'MASTERED':
      return { backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', borderColor: 'var(--success-text)' }
    case 'DEVELOPING':
      return { backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', borderColor: 'var(--success-text)' }
    case 'LEARNING':
      return { backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)', borderColor: 'var(--warning-text)' }
    default:
      return { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }
  }
}

export default function PracticeHome() {
  const mastery = usePracticeStore((s) => s.conceptMastery)
  const startSession = usePracticeStore((s) => s.startSession)
  const [size, setSize] = useState<5 | 10>(5)

  const next = recommendedNext(mastery)
  const started = Object.values(mastery).some((m) => m.attempts > 0)

  return (
    <div className="mx-auto max-w-4xl px-4 py-2">
      <h1 className="mt-2 text-3xl font-bold">K-Map Practice</h1>

      {started && (
        <section className="mt-8 rounded-lg border p-5" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--accent-primary)' }}>Your progress</h2>
            {next ? (
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Next concept to try:{' '}
                <span className="font-medium" style={{ color: 'var(--accent-primary)' }}>
                  {CONCEPTS.find((c) => c.id === next)?.title}
                </span>
              </span>
            ) : (
              <span className="text-sm" style={{ color: 'var(--success-text)' }}>All concepts mastered!</span>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
            {CONCEPTS.map((c) => {
              const st = mastery[c.id]
              return (
                <div
                  key={c.id}
                  title={`${st.score} · ${st.attempts} attempt${st.attempts === 1 ? '' : 's'}`}
                  className="rounded border px-2 py-1.5 text-xs font-medium"
                  style={conceptColor(st.status)}
                >
                  {c.short}
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Choose a mode</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {MODES.map((m) => (
            <button
              key={m.mode}
              onClick={() => startSession(m.mode, size)}
              className="rounded-lg border p-5 text-left transition-colors"
              style={{
                borderColor: m.mode === 'guided' ? 'var(--accent-bg)' : 'var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold" style={{ color: 'var(--accent-primary)' }}>{m.title}</h3>
                <span
                  className="rounded px-2 py-0.5 text-[10px] uppercase tracking-wide"
                  style={
                    m.hint === 'no hints'
                      ? { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }
                      : { backgroundColor: 'var(--accent-bg)', color: 'var(--accent-primary)' }
                  }
                >
                  {m.hint}
                </span>
              </div>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{m.blurb}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <fieldset>
          <legend className="mb-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Problems per session</legend>
          <div className="flex gap-2">
            {([5, 10] as const).map((n) => (
              <button
                key={n}
                onClick={() => setSize(n)}
                className="rounded border px-4 py-2 text-sm font-medium"
                style={
                  size === n
                    ? { borderColor: 'var(--accent-bg)', backgroundColor: 'var(--accent-bg)', color: 'var(--accent-primary)' }
                    : { borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }
                }
              >
                {n}
              </button>
            ))}
          </div>
        </fieldset>
      </section>
    </div>
  )
}
