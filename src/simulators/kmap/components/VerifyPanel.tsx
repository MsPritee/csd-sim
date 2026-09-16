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
import Badge from './Badge'

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
      className="section-card-secondary"
      headerRight={
        <Badge variant={comparison.equal ? 'success' : 'error'} size="sm" data-testid="verify-badge">
          {comparison.equal ? '✓ Equivalent' : '✗ Differs'}
        </Badge>
      }
    >

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div
          className="rounded p-2"
          style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}
        >
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Original (K-map)</p>
          <p className="mt-0.5 font-mono text-xs" style={{ color: 'var(--text-primary)' }}>
            {originalExpression || (showSOP ? 'sum of minterms' : 'product of maxterms')}
          </p>
        </div>
        <div
          className="rounded p-2"
          style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}
        >
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Simplified {showSOP ? 'SOP' : 'POS'}</p>
          <p className="mt-0.5 font-mono text-xs" style={{ color: 'var(--accent-secondary)' }}>{simplifiedExpression}</p>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
        <div
          className="rounded p-1.5"
          style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}
          title="Number of product/sum terms in simplified expression"
        >
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Terms</p>
          <p className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{metrics.simplifiedTerms}</p>
        </div>
        <div
          className="rounded p-1.5"
          style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}
          title="Total variable occurrences in simplified expression"
        >
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Literals</p>
          <p className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{metrics.simplifiedLiterals}</p>
        </div>
        <div
          className="rounded p-1.5"
          style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}
          title="Cells with output value 1 (for SOP) or 0 (for POS)"
        >
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Coverage</p>
          <p className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{metrics.outputOnes}/{allCells}</p>
        </div>
      </div>

      {comparison.differences.length > 0 && (
        <div
          className="mt-3 rounded-lg p-3 text-sm error-animation"
          style={{ border: '1px solid var(--error-border)', backgroundColor: 'var(--error-bg)' }}
        >
          <p className="font-semibold" style={{ color: 'var(--error-text)' }}>
            {comparison.differences.length} row
            {comparison.differences.length === 1 ? '' : 's'} differ
          </p>
          <ul className="mt-1 space-y-1 text-xs font-mono" style={{ color: 'var(--text-primary)' }}>
            {comparison.differences.map((d) => (
              <li key={d.minterm}>
                {d.bits} → K-map {d.original ?? '—'}, simplified {d.simplified}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
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
          className={`mt-3 rounded-lg p-3 text-sm ${uncovered.length === 0 ? 'success-animation' : 'warning-animation'}`}
          style={{
            border: uncovered.length === 0 ? '1px solid var(--success-border)' : '1px solid var(--warning-border)',
            backgroundColor: uncovered.length === 0 ? 'var(--success-bg)' : 'var(--warning-bg)',
          }}
          data-testid="verify-coverage"
        >
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Selected group coverage ({showSOP ? '1s' : '0s'})
          </p>
          {uncovered.length === 0 ? (
            <p className="mt-1" style={{ color: 'var(--success-text)' }}>
              All required {showSOP ? '1s' : '0s'} are covered by your selected group.
            </p>
          ) : (
            <>
              <p className="mt-1" style={{ color: 'var(--warning-text)' }}>
                Still uncovered required cell{uncovered.length === 1 ? '' : 's'}:{' '}
                <span className="font-mono">m{uncovered.join(', m')}</span>
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
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
