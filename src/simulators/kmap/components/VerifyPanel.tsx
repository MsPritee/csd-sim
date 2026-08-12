import { useMemo } from 'react'
import type { KMapModel } from '../../../core/kmap'
import { kmapToTruthTable } from '../../../core/kmap/truth-table'
import {
  truthTableFromSop,
  truthTableFromPos,
  compareTruthTables,
  expressionMetrics,
} from '../../../core/boolean/evaluate'
import { uncoveredRequired } from '../../../core/kmap/coverage'
import SectionCard from './SectionCard'

interface VerifyPanelProps {
  kmap: KMapModel
  showSOP: boolean
  /** Simplified term strings for the active mode (productText / sumText). */
  sopTerms: readonly string[]
  /** Simplified term strings for the inactive mode. */
  posTerms: readonly string[]
  /** Simplified expression string in the active mode. */
  simplifiedExpression: string
  /** Original (unsimplified) expression string, if known. */
  originalExpression?: string
  /** Manual group currently being validated (cells), if any. */
  selectedGroup?: readonly number[]
}

export default function VerifyPanel({
  kmap,
  showSOP,
  sopTerms,
  posTerms,
  simplifiedExpression,
  originalExpression,
  selectedGroup,
}: VerifyPanelProps) {
  const { original, comparison, metrics } = useMemo(() => {
    const variables = kmap.layout.variables
    const original = kmapToTruthTable(kmap).outputs
    const simplified = showSOP
      ? truthTableFromSop(variables, sopTerms)
      : truthTableFromPos(variables, posTerms)
    const comparison = compareTruthTables(original, simplified)
    const metrics = {
      simplifiedTerms: showSOP ? sopTerms.length : posTerms.length,
      simplifiedLiterals: expressionMetrics(showSOP ? sopTerms : posTerms, variables).literals,
      outputOnes: simplified.filter((v) => v === 1).length,
    }
    return { original, comparison, metrics }
  }, [kmap, showSOP, sopTerms, posTerms])

  const uncovered = useMemo(
    () =>
      uncoveredRequired(
        kmap,
        (selectedGroup ?? []).length > 0 ? [[...(selectedGroup ?? [])]] : [],
        showSOP ? 'sop' : 'pos',
      ),
    [kmap, selectedGroup, showSOP],
  )

  const allCells = 2 ** kmap.layout.variables.length
  const hasDontCares = original.some((v) => v === 'X')

  return (
    <SectionCard
      title="Verify"
      subtitle={`Does the simplified ${showSOP ? 'SOP' : 'POS'} expression reproduce the K-map truth table on every row?`}
      headerRight={
        <span
          className={`rounded px-2 py-0.5 text-xs font-semibold ${
            comparison.equal
              ? 'bg-green-900/40 text-green-300'
              : 'bg-red-900/40 text-red-300'
          }`}
          data-testid="verify-badge"
        >
          {comparison.equal ? '✓ Equivalent' : '✗ Differs'}
        </span>
      }
    >

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded border border-slate-700 bg-slate-800 p-3">
          <p className="text-xs text-slate-400">Original (K-map)</p>
          <p className="mt-1 font-mono text-slate-200">
            {originalExpression || (showSOP ? 'sum of minterms' : 'product of maxterms')}
          </p>
        </div>
        <div className="rounded border border-slate-700 bg-slate-800 p-3">
          <p className="text-xs text-slate-400">Simplified {showSOP ? 'SOP' : 'POS'}</p>
          <p className="mt-1 font-mono text-violet-200">{simplifiedExpression}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded border border-slate-700 bg-slate-800 p-2">
          <p className="text-xs text-slate-400">Simplified terms</p>
          <p className="font-mono text-slate-200">{metrics.simplifiedTerms}</p>
        </div>
        <div className="rounded border border-slate-700 bg-slate-800 p-2">
          <p className="text-xs text-slate-400">Literals</p>
          <p className="font-mono text-slate-200">{metrics.simplifiedLiterals}</p>
        </div>
        <div className="rounded border border-slate-700 bg-slate-800 p-2">
          <p className="text-xs text-slate-400">Ones covered</p>
          <p className="font-mono text-slate-200">{metrics.outputOnes} / {allCells}</p>
        </div>
      </div>

      {comparison.differences.length > 0 && (
        <div className="mt-3 rounded-lg border border-red-700/40 bg-red-900/10 p-3 text-sm">
          <p className="font-semibold text-red-300">
            {comparison.differences.length} row
            {comparison.differences.length === 1 ? '' : 's'} differ
          </p>
          <ul className="mt-1 space-y-1 text-xs text-slate-300 font-mono">
            {comparison.differences.map((d) => (
              <li key={d.minterm}>
                {d.bits} → K-map {d.original ?? '—'}, simplified {d.simplified}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs text-slate-400">
            {hasDontCares
              ? 'Don\u2019t-care cells hide some covered rows from the check.'
              : showSOP
                ? 'Check that every 1-minterm is covered by a group (SOP).'
                : 'Check that every 0-maxterm is covered by a group (POS).'}
          </p>
        </div>
      )}

      {selectedGroup && selectedGroup.length > 0 && (
        <div
          className={`mt-3 rounded-lg border p-3 text-sm ${
            uncovered.length === 0
              ? 'border-green-700/40 bg-green-900/10'
              : 'border-amber-700/40 bg-amber-900/10'
          }`}
          data-testid="verify-coverage"
        >
          <p className="font-semibold text-slate-200">
            Selected group coverage ({showSOP ? '1s' : '0s'})
          </p>
          {uncovered.length === 0 ? (
            <p className="mt-1 text-green-300">
              All required {showSOP ? '1s' : '0s'} are covered by your selected group.
            </p>
          ) : (
            <>
              <p className="mt-1 text-amber-300">
                Still uncovered required cell{uncovered.length === 1 ? '' : 's'}:{' '}
                <span className="font-mono">m{uncovered.join(', m')}</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Add a group covering the remaining {showSOP ? '1s' : '0s'} before the simplified
                sum is complete.
              </p>
            </>
          )}
        </div>
      )}
    </SectionCard>
  )
}