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

export default function PracticeHome() {
  const mastery = usePracticeStore((s) => s.conceptMastery)
  const startSession = usePracticeStore((s) => s.startSession)
  const [size, setSize] = useState<5 | 10>(5)

  const next = recommendedNext(mastery)
  const started = Object.values(mastery).some((m) => m.attempts > 0)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className="font-mono text-sm uppercase tracking-widest text-violet-400">
        P2 · K-Map Practice
      </p>
      <h1 className="mt-2 text-3xl font-bold">Guided Learning &amp; Mastery</h1>
      <p className="mt-3 max-w-2xl text-slate-300">
        Work through problems by concept, get mistake-level feedback with the{' '}
        <em>why</em>, revisit correct concepts, and adapt to the areas that need
        the most work. Every answer is checked against the real simplification
        engine — never by string matching.
      </p>

      {started && (
        <section className="mt-8 rounded-lg border border-slate-700 bg-slate-900 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-violet-300">Your progress</h2>
            {next ? (
              <span className="text-sm text-slate-400">
                Next concept to try:{' '}
                <span className="font-medium text-violet-300">
                  {CONCEPTS.find((c) => c.id === next)?.title}
                </span>
              </span>
            ) : (
              <span className="text-sm text-green-400">All concepts mastered!</span>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
            {CONCEPTS.map((c) => {
              const st = mastery[c.id]
              const color =
                st.status === 'MASTERED'
                  ? 'bg-green-900/40 text-green-300 border-green-700'
                  : st.status === 'DEVELOPING'
                    ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700'
                    : st.status === 'LEARNING'
                      ? 'bg-amber-900/30 text-amber-300 border-amber-700'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
              return (
                <div
                  key={c.id}
                  title={`${st.score} · ${st.attempts} attempt${st.attempts === 1 ? '' : 's'}`}
                  className={`rounded border px-2 py-1.5 text-xs font-medium ${color}`}
                >
                  {c.short}
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-100">Choose a mode</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {MODES.map((m) => (
            <button
              key={m.mode}
              onClick={() => startSession(m.mode, size)}
              className={`rounded-lg border bg-slate-900 p-5 text-left transition-colors hover:border-violet-500 hover:bg-slate-800 ${
                m.mode === 'guided' ? 'border-violet-500' : 'border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-violet-300">{m.title}</h3>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                    m.hint === 'no hints'
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-violet-900/40 text-violet-300'
                  }`}
                >
                  {m.hint}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{m.blurb}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <fieldset>
          <legend className="mb-1 text-sm text-slate-400">Problems per session</legend>
          <div className="flex gap-2">
            {([5, 10] as const).map((n) => (
              <button
                key={n}
                onClick={() => setSize(n)}
                className={`rounded border px-4 py-2 text-sm font-medium ${
                  size === n
                    ? 'border-violet-500 bg-violet-900/40 text-violet-200'
                    : 'border-slate-700 bg-slate-900 text-slate-300'
                }`}
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