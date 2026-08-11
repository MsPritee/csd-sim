/**
 * P2 — Live practice problem surface.
 *
 * Renders one problem from the practice store on the shared KMapGrid, lets the
 * student build groups (guided/independent) and submit an expression, provides
 * the progressive hint ladder and mistake-level feedback. No math in the UI —
 * everything is delegated to core + education modules.
 */

import { useMemo, useState } from 'react'
import { usePracticeStore, buildProblemModel } from '../../../stores/practiceStore'
import KMapGrid from '../components/KMapGrid'
import { hintsForProblem, hintLevelUsed } from '../../../education/practice/hints'
import { conceptTitle } from '../../../education/practice/objectives'
import { categoryLabel } from '../../../education/practice/mastery'
import type { MistakeDetail } from '../../../education/practice/types'

export default function PracticeProblem() {
  const problem = usePracticeStore((s) => s.problem)
  if (!problem) return <SessionDone />
  return <ProblemInner key={problem.id} />
}

function SessionDone() {
  const index = usePracticeStore((s) => s.index)
  const sessionSize = usePracticeStore((s) => s.sessionSize)
  const backHome = usePracticeStore((s) => s.backHome)
  const mastery = usePracticeStore((s) => s.conceptMastery)
  const mastered = Object.values(mastery).filter((m) => m.status === 'MASTERED').length
  const total = Object.keys(mastery).length

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-8 text-center">
      <h2 className="text-2xl font-bold text-violet-300">Session complete</h2>
      <p className="mt-3 text-slate-300">
        You finished all {sessionSize} problems (reached #{index + 1}).
      </p>
      <p className="mt-2 text-slate-400">
        Mastered concepts: <span className="text-green-400">{mastered}</span> / {total}
      </p>
      <button
        onClick={backHome}
        className="mt-6 rounded bg-violet-600 px-5 py-2.5 font-medium text-white hover:bg-violet-500"
      >
        Back to practice home
      </button>
    </div>
  )
}

function ProblemInner() {
  const problem = usePracticeStore((s) => s.problem!)!
  const mode = usePracticeStore((s) => s.mode)
  const index = usePracticeStore((s) => s.index)
  const sessionSize = usePracticeStore((s) => s.sessionSize)
  const selectedCells = usePracticeStore((s) => s.selectedCells)
  const groups = usePracticeStore((s) => s.groups)
  const hintsUsed = usePracticeStore((s) => s.hintsUsed)
  const evaluation = usePracticeStore((s) => s.evaluation)
  const submittedExpression = usePracticeStore((s) => s.submittedExpression)
  const selectCell = usePracticeStore((s) => s.selectCell)
  const addGroup = usePracticeStore((s) => s.addGroup)
  const clearSelection = usePracticeStore((s) => s.clearSelection)
  const removeGroup = usePracticeStore((s) => s.removeGroup)
  const clearGroups = usePracticeStore((s) => s.clearGroups)
  const requestHint = usePracticeStore((s) => s.requestHint)
  const submitGroups = usePracticeStore((s) => s.submitGroups)
  const submitExpression = usePracticeStore((s) => s.submitExpression)
  const nextProblem = usePracticeStore((s) => s.nextProblem)
  const retry = usePracticeStore((s) => s.retry)
  const similar = usePracticeStore((s) => s.similar)

  const [hoveredCell, setHoveredCell] = useState<number | null>(null)
  const [exprDraft, setExprDraft] = useState(propmodeDefault(problem.mode))

  const model = useMemo(() => buildProblemModel(problem), [problem])
  const selectedSet = useMemo(() => new Set(selectedCells), [selectedCells])
  const hintList = useMemo(() => hintsForProblem(problem), [problem])
  const locked = evaluation !== null

  const highlightMap = useMemo(() => {
    const map = new Map<number, number>()
    groups.forEach((g, gi) => {
      const color = gi % 5
      g.forEach((m) => {
        if (!map.has(m)) map.set(m, color)
      })
    })
    return map
  }, [groups])

  const fullyCorrect =
    evaluation !== null && evaluation.equivalent && evaluation.coversRequired && evaluation.minimal

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">{problem.title}</h2>
          <p className="mt-1 text-sm text-slate-400">{problem.prompt}</p>
        </div>
        <div className="text-right text-sm">
          <div className="text-slate-400">
            Problem {Math.min(index + 1, sessionSize)} / {sessionSize}
          </div>
          <div className="mt-1 flex flex-wrap justify-end gap-1">
            {problem.concepts.map((c) => (
              <span
                key={c}
                className="rounded bg-slate-800 px-2 py-0.5 text-xs text-violet-300"
              >
                {conceptTitle(c)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded border border-slate-800 bg-slate-950/50 p-3">
        <KMapGrid
          kmap={model}
          onCellClick={(m) => selectCell(m)}
          onCellSelect={(m) => selectCell(m)}
          onCellInfo={() => {}}
          selectedCells={selectedSet}
          hoveredCell={hoveredCell}
          onCellHover={setHoveredCell}
          showMintermNumbers
          showSOP={problem.mode === 'sop'}
          highlightMap={highlightMap}
          showAdjacency
        />
      </div>

      {/* Group controls */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={addGroup}
          disabled={locked || selectedCells.length === 0}
          className="rounded bg-slate-700 px-3 py-2 text-sm font-medium text-slate-100 enabled:hover:bg-slate-600 disabled:opacity-40"
        >
          Add selected ({selectedCells.length}) as group
        </button>
        <button
          onClick={clearSelection}
          disabled={locked || selectedCells.length === 0}
          className="rounded border border-slate-600 px-3 py-2 text-sm text-slate-300 enabled:hover:bg-slate-800 disabled:opacity-40"
        >
          Clear selection
        </button>
        <button
          onClick={clearGroups}
          disabled={locked || groups.length === 0}
          className="rounded border border-slate-600 px-3 py-2 text-sm text-slate-300 enabled:hover:bg-slate-800 disabled:opacity-40"
        >
          Clear all groups
        </button>
        <button
          onClick={submitGroups}
          disabled={locked || groups.length === 0}
          className="rounded bg-violet-600 px-3 py-2 text-sm font-medium text-white enabled:hover:bg-violet-500 disabled:opacity-40"
        >
          Check my groups
        </button>
      </div>

      {/* Formed groups */}
      {groups.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {groups.map((g, gi) => (
            <li key={gi} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: `hsl(${(gi * 137) % 360},70%,60%)` }}
              />
              <span className="font-mono text-slate-200">
                [{g.join(', ')}]
              </span>
              <button
                onClick={() => removeGroup(gi)}
                disabled={locked}
                className="ml-auto text-slate-500 hover:text-red-400 disabled:opacity-40"
                aria-label={`Remove group ${gi + 1}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Hints */}
      {mode !== 'challenge' && hintsUsed < hintList.length && (
        <div className="mt-4 rounded border border-violet-800/50 bg-violet-950/30 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-violet-300">
              Hint {hintLevelUsed(hintsUsed)} — need a nudge?
            </p>
            <button
              onClick={requestHint}
              disabled={locked}
              className="rounded bg-violet-800/50 px-3 py-1.5 text-sm text-violet-200 hover:bg-violet-700/50 disabled:opacity-40"
            >
              Show hint
            </button>
          </div>
          {hintsUsed > 0 && (
            <p className="mt-2 text-sm text-slate-200">
              {hintList[hintsUsed - 1].text}
            </p>
          )}
        </div>
      )}

      {/* Expression */}
      <div className="mt-4 rounded border border-slate-700 bg-slate-950/40 p-3">
        <label htmlFor="kmap-expr" className="block text-sm font-medium text-slate-300">
          Simplified expression ({problem.mode.toUpperCase()})
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            id="kmap-expr"
            value={exprDraft}
            onChange={(e) => setExprDraft(e.target.value)}
            disabled={locked}
            className="flex-1 rounded border border-slate-600 bg-slate-900 px-3 py-2 font-mono text-sm text-slate-100 outline-none focus:border-violet-500 disabled:opacity-40"
            placeholder={propmodeDefault(problem.mode)}
          />
          <button
            onClick={() => submitExpression(exprDraft.trim())}
            disabled={locked || exprDraft.trim() === ''}
            className="rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-40"
          >
            Check expression
          </button>
        </div>
        {submittedExpression && locked && (
          <p className="mt-2 font-mono text-sm text-slate-400">
            Submitted: {submittedExpression}
          </p>
        )}
      </div>

      {/* Feedback */}
      {evaluation && (
        <div className="mt-4">
          <ScoreBanner evaluation={evaluation} fullyCorrect={fullyCorrect} />
          <MistakeList mistakes={evaluation.mistakes} />

          {fullyCorrect && (
            <p className="mt-3 text-sm text-slate-300">
              Expected solution:{' '}
              <span className="font-mono text-green-400">
                {problem.mode === 'sop' ? problem.expected.sop : problem.expected.pos}
              </span>
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {!fullyCorrect && (
              <>
                <button
                  onClick={retry}
                  className="rounded bg-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-600"
                >
                  Try again
                </button>
                <button
                  onClick={similar}
                  className="rounded border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Similar problem
                </button>
              </>
            )}
            {fullyCorrect && (
              <button
                onClick={nextProblem}
                className="rounded bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-500"
              >
                Next problem →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function propmodeDefault(mode: 'sop' | 'pos'): string {
  return mode === 'sop' ? 'e.g. AB + BC' : "e.g. (A + B)(B + C)"
}

function ScoreBanner({
  evaluation,
  fullyCorrect,
}: {
  evaluation: { score: number; equivalent: boolean; coversRequired: boolean; minimal: boolean }
  fullyCorrect: boolean
}) {
  const label = fullyCorrect
    ? 'Correct & minimal'
    : evaluation.equivalent
      ? 'Correct, but not minimal'
      : evaluation.coversRequired
        ? 'Good coverage — not equivalent'
        : 'Not quite'
  const color = fullyCorrect
    ? 'border-green-600 bg-green-950/40 text-green-300'
    : evaluation.equivalent
      ? 'border-amber-600 bg-amber-950/30 text-amber-300'
      : 'border-red-700 bg-red-950/30 text-red-300'
  return (
    <div className={`rounded border px-4 py-3 ${color}`}>
      <div className="flex items-center justify-between">
        <span className="font-semibold">{label}</span>
        <span className="text-sm font-mono">Score: {evaluation.score}/100</span>
      </div>
    </div>
  )
}

function MistakeList({ mistakes }: { mistakes: readonly MistakeDetail[] }) {
  if (mistakes.length === 0) return null
  return (
    <div className="mt-3 space-y-3">
      <h3 className="text-sm font-semibold text-slate-200">
        Feedback · {mistakes.length} issue{mistakes.length === 1 ? '' : 's'}
      </h3>
      {mistakes.map((m, i) => (
        <div key={i} className="rounded border border-slate-700 bg-slate-950/40 p-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-red-900/50 px-2 py-0.5 text-xs font-medium text-red-300">
              {categoryLabel(m.category)}
            </span>
            <span className="text-sm text-slate-200">{m.happened}</span>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            <span className="font-medium text-slate-300">Why: </span>
            {m.why}
          </p>
          <p className="mt-1 text-sm text-emerald-300/90">
            <span className="font-medium">Correct idea: </span>
            {m.correctConcept}
          </p>
          <p className="mt-1 text-sm text-violet-300/90">
            <span className="font-medium">Try: </span>
            {m.tryAgain}
          </p>
        </div>
      ))}
    </div>
  )
}