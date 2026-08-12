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
import SessionDone from './components/SessionDone'
import GroupControls from './components/GroupControls'
import FormedGroups from './components/FormedGroups'
import MistakeList from './components/MistakeList'

export default function PracticeProblem() {
  const problem = usePracticeStore((s) => s.problem)
  if (!problem) return <SessionDone />
  return <ProblemInner key={problem.id} />
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
      <GroupControls
        locked={locked}
        selectedCount={selectedCells.length}
        groupCount={groups.length}
        onAddGroup={addGroup}
        onClearSelection={clearSelection}
        onClearGroups={clearGroups}
        onSubmitGroups={submitGroups}
      />

      {/* Formed groups */}
      <FormedGroups groups={groups} locked={locked} onRemoveGroup={removeGroup} />

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