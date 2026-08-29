import { useEffect, useMemo, useState } from 'react'
import type { KMapSolution, WalkthroughStep } from '../../../application/kmap'

interface SolutionWalkthroughProps {
  solution: KMapSolution
  /** Called whenever the active step changes so the K-map grid can sync. */
  onHighlightChange: (groups: { minterms: readonly number[]; colorIndex: number }[]) => void
}

function highlightFromStep(step: WalkthroughStep): { minterms: readonly number[]; colorIndex: number }[] {
  switch (step.viz.type) {
    case 'targets':
    case 'group':
    case 'variable-analysis':
    case 'eliminated':
      return [{ minterms: step.viz.cells, colorIndex: 0 }]
    case 'candidate-groups':
      return step.viz.groups.map((group, gi) => ({
        minterms: group,
        colorIndex: gi % 5,
      }))
    case 'final':
      return []
  }
}

export default function SolutionWalkthrough({
  solution,
  onHighlightChange,
}: SolutionWalkthroughProps) {
  const total = solution.steps.length
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)

  const step = solution.steps[Math.min(index, total - 1)]!

  // Keep the K-map synchronized with the current explanation step.
  useEffect(() => {
    onHighlightChange(highlightFromStep(step))
  }, [index, solution, onHighlightChange, step])

  // Optional auto-play that advances one step at a time.
  useEffect(() => {
    if (!playing) return
    if (index >= total - 1) {
      setPlaying(false)
      return
    }
    const timer = setTimeout(() => setIndex((i) => i + 1), 900)
    return () => clearTimeout(timer)
  }, [playing, index, total])

  const next = () => setIndex((i) => Math.min(i + 1, total - 1))
  const prev = () => setIndex((i) => Math.max(i - 1, 0))
  const replay = () => setIndex(0)
  const togglePlay = () => setPlaying((p) => !p)

  const mask = Math.max(0, total - 1)

  const summary = useMemo(
    () => ({
      groups: solution.groups.length,
      terms: solution.terms.length,
    }),
    [solution],
  )

  return (
    <div className="rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--accent-primary)' }}>Solution Walkthrough</h3>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Step {index + 1} of {total} · {solution.mode.toUpperCase()}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <div
          className="h-full transition-all"
          style={{ width: `${((index + 1) / total) * 100}%`, backgroundColor: 'var(--accent-primary)' }}
        />
      </div>

      {/* Current step */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{step.title}</h4>
          <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
            {summary.groups} group{summary.groups === 1 ? '' : 's'} · {summary.terms} term
            {summary.terms === 1 ? '' : 's'}
          </span>
        </div>

        <ul className="space-y-1">
          {step.description.map((line, i) => (
            <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--text-primary)' }}>
              <span className="shrink-0" style={{ color: 'var(--accent-secondary)' }}>•</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>

        {/* Variable comparison table */}
        {step.variableAnalysis && step.variableAnalysis.rows.length > 0 && (
          <table className="w-full text-xs rounded overflow-hidden border" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
            <thead>
              <tr className="text-left" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <th className="px-2 py-1 font-medium">Cell</th>
                {step.variableAnalysis.variables.map((v, i) => (
                  <th key={i} className="px-2 py-1 font-medium text-center">
                    {v}{' '}
                    {step.variableAnalysis!.changed.includes(v) ? '⟷' : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {step.variableAnalysis.rows.map((row) => (
                <tr key={row.minterm} className="border-t" style={{ borderColor: 'var(--bg-tertiary)' }}>
                  <td className="px-2 py-1 font-mono">m{row.minterm}</td>
                  {row.bits.map((b, i) => {
                    const v = step.variableAnalysis!.variables[i]!
                    const isChanged = step.variableAnalysis!.changed.includes(v)
                    return (
                      <td
                        key={i}
                        className={`px-2 py-1 text-center font-mono ${isChanged ? 'line-through decoration-red-400' : ''}`}
                        style={{ color: isChanged ? 'var(--error-text)' : 'var(--success-text)', textDecorationColor: isChanged ? 'var(--error-text)' : undefined }}
                      >
                        {b}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Derived term */}
        {step.derivedTerm !== undefined && (
          <div className="rounded p-3 text-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <span className="text-xs uppercase tracking-wide block mb-1" style={{ color: 'var(--text-secondary)' }}>
              {step.type === 'final' || step.type === 'combine'
                ? 'Expression'
                : 'Simplified term'}
            </span>
            <span className="font-mono text-lg" style={{ color: 'var(--accent-primary)' }}>{step.derivedTerm}</span>
          </div>
        )}

        {step.hint && (
          <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>💡 {step.hint}</p>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <button
          onClick={prev}
          disabled={index === 0}
          className="px-3 py-1 rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
        >
          Previous
        </button>
        <button
          onClick={next}
          disabled={index >= mask}
          className="px-3 py-1 rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
        >
          Next
        </button>
        <button
          onClick={togglePlay}
          className="px-3 py-1 rounded text-sm"
          style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={replay}
          className="px-3 py-1 rounded text-sm"
          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
        >
          Replay
        </button>
      </div>
    </div>
  )
}
