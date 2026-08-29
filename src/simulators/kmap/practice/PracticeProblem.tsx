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

  const groupOverlays = useMemo(() => {
    return groups.map((g, gi) => ({
      minterms: g,
      colorIndex: gi % 5,
    }))
  }, [groups])

  const fullyCorrect =
    evaluation !== null && evaluation.equivalent && evaluation.coversRequired && evaluation.minimal

  return (
    <div className="rounded-lg border p-4 sm:p-6" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{problem.title}</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{problem.prompt}</p>
        </div>
        <div className="text-right text-sm">
          <div style={{ color: 'var(--text-secondary)' }}>
            Problem {Math.min(index + 1, sessionSize)} / {sessionSize}
          </div>
          <div className="mt-1 flex flex-wrap justify-end gap-1">
            {problem.concepts.map((c) => (
              <span
                key={c}
                className="rounded px-2 py-0.5 text-xs"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-primary)' }}
              >
                {conceptTitle(c)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded border p-3" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-primary)' }}>
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
          groupOverlays={groupOverlays}
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
        <div className="mt-4 rounded border p-3" style={{ borderColor: 'var(--accent-bg)', backgroundColor: 'var(--accent-bg)' }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
              Hint {hintLevelUsed(hintsUsed)} — need a nudge?
            </p>
            <button
              onClick={requestHint}
              disabled={locked}
              className="rounded px-3 py-1.5 text-sm disabled:opacity-40"
              style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent-primary)' }}
            >
              Show hint
            </button>
          </div>
          {hintsUsed > 0 && (
            <p className="mt-2 text-sm" style={{ color: 'var(--text-primary)' }}>
              {hintList[hintsUsed - 1].text}
            </p>
          )}
        </div>
      )}

      {/* Expression */}
      <div className="mt-4 rounded border p-3" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
        <label htmlFor="kmap-expr" className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          Simplified expression ({problem.mode.toUpperCase()})
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            id="kmap-expr"
            value={exprDraft}
            onChange={(e) => setExprDraft(e.target.value)}
            disabled={locked}
            className="flex-1 rounded border px-3 py-2 font-mono text-sm outline-none disabled:opacity-40"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            placeholder={propmodeDefault(problem.mode)}
          />
          <button
            onClick={() => submitExpression(exprDraft.trim())}
            disabled={locked || exprDraft.trim() === ''}
            className="rounded px-4 py-2 text-sm font-medium disabled:opacity-40"
            style={{ backgroundColor: 'var(--success-bg)', color: 'var(--text-primary)' }}
          >
            Check expression
          </button>
        </div>
        {submittedExpression && locked && (
          <p className="mt-2 font-mono text-sm break-words" style={{ color: 'var(--text-secondary)' }}>
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
            <p className="mt-3 text-sm" style={{ color: 'var(--text-primary)' }}>
              Expected solution:{' '}
              <span className="font-mono" style={{ color: 'var(--success-text)' }}>
                {problem.mode === 'sop' ? problem.expected.sop : problem.expected.pos}
              </span>
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {!fullyCorrect && (
              <>
                <button
                  onClick={retry}
                  className="rounded px-4 py-2 text-sm font-medium"
                  style={{ backgroundColor: 'var(--border-light)', color: 'var(--text-primary)' }}
                >
                  Try again
                </button>
                <button
                  onClick={similar}
                  className="rounded border px-4 py-2 text-sm"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  Similar problem
                </button>
              </>
            )}
            {fullyCorrect && (
              <button
                onClick={nextProblem}
                className="rounded px-5 py-2.5 text-sm font-medium"
                style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--bg-primary)' }}
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
  const bannerStyle: React.CSSProperties = fullyCorrect
    ? { borderColor: 'var(--success-text)', backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }
    : evaluation.equivalent
      ? { borderColor: 'var(--warning-text)', backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)' }
      : { borderColor: 'var(--error-text)', backgroundColor: 'var(--error-bg)', color: 'var(--error-text)' }
  return (
    <div className="rounded border px-4 py-3" style={bannerStyle}>
      <div className="flex items-center justify-between">
        <span className="font-semibold">{label}</span>
        <span className="text-sm font-mono">Score: {evaluation.score}/100</span>
      </div>
    </div>
  )
}
