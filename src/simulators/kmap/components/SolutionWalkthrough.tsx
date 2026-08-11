import { useEffect, useMemo, useState } from 'react'
import type { KMapSolution, WalkthroughStep } from '../../../application/kmap'

interface SolutionWalkthroughProps {
  solution: KMapSolution
  /** Called whenever the active step changes so the K-map grid can sync. */
  onHighlightChange: (highlight: Map<number, number>) => void
}

function highlightFromStep(step: WalkthroughStep): Map<number, number> {
  const map = new Map<number, number>()
  switch (step.viz.type) {
    case 'targets':
    case 'group':
    case 'variable-analysis':
    case 'eliminated':
      step.viz.cells.forEach((m, i) => map.set(m, i % 5))
      break
    case 'candidate-groups':
      step.viz.groups.forEach((group, gi) => {
        group.forEach((m) => map.set(m, gi % 5))
      })
      break
    case 'final':
      break
  }
  return map
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
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-violet-300">Solution Walkthrough</h3>
        <span className="text-xs text-slate-400">
          Step {index + 1} of {total} · {solution.mode.toUpperCase()}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-800 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-violet-500 transition-all"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      {/* Current step */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-white">{step.title}</h4>
          <span className="text-xs text-slate-500 shrink-0">
            {summary.groups} group{summary.groups === 1 ? '' : 's'} · {summary.terms} term
            {summary.terms === 1 ? '' : 's'}
          </span>
        </div>

        <ul className="space-y-1">
          {step.description.map((line, i) => (
            <li key={i} className="text-sm text-slate-300 flex gap-2">
              <span className="text-violet-400 shrink-0">•</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>

        {/* Variable comparison table */}
        {step.variableAnalysis && step.variableAnalysis.rows.length > 0 && (
          <table className="w-full text-xs text-slate-300 border border-slate-700 rounded overflow-hidden">
            <thead>
              <tr className="bg-slate-800 text-left">
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
                <tr key={row.minterm} className="border-t border-slate-800">
                  <td className="px-2 py-1 font-mono">m{row.minterm}</td>
                  {row.bits.map((b, i) => {
                    const v = step.variableAnalysis!.variables[i]!
                    const isChanged = step.variableAnalysis!.changed.includes(v)
                    return (
                      <td
                        key={i}
                        className={`px-2 py-1 text-center font-mono ${
                          isChanged ? 'text-red-400 line-through decoration-red-400' : 'text-green-400'
                        }`}
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
          <div className="bg-slate-800 rounded p-3 text-center">
            <span className="text-xs text-slate-400 uppercase tracking-wide block mb-1">
              {step.type === 'final' || step.type === 'combine'
                ? 'Expression'
                : 'Simplified term'}
            </span>
            <span className="font-mono text-lg text-violet-300">{step.derivedTerm}</span>
          </div>
        )}

        {step.hint && (
          <p className="text-xs text-slate-500 italic">💡 {step.hint}</p>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <button
          onClick={prev}
          disabled={index === 0}
          className="px-3 py-1 rounded text-sm bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={next}
          disabled={index >= mask}
          className="px-3 py-1 rounded text-sm bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
        <button
          onClick={togglePlay}
          className="px-3 py-1 rounded text-sm bg-violet-600 text-white hover:bg-violet-500"
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={replay}
          className="px-3 py-1 rounded text-sm bg-slate-800 text-slate-200 hover:bg-slate-700"
        >
          Replay
        </button>
      </div>
    </div>
  )
}