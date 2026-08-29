import { useMemo, useState } from 'react'
import SectionCard from './SectionCard'
import VerifyPanel from './VerifyPanel'
import LogicCircuit from './LogicCircuit'
import { analyzeGroupVariables, groupWraps } from '../../../core/kmap/group-reasoning'
import type { KMapModel } from '../../../core/kmap'
import type { GroupedTerm } from '../../../core/kmap/simplify'
import { KMAP_GROUP_COLORS } from './kmapHighlight'

interface ResultsTabContentProps {
  showSOP: boolean
  setShowSOP: (show: boolean) => void
  simplifiedExpression: string
  originalExpression: string
  sopGroups: ReadonlyArray<{ readonly cells: readonly number[]; productText: string; sumText: string }>
  posGroups: ReadonlyArray<{ readonly cells: readonly number[]; productText: string; sumText: string }>
  sopTerms: readonly string[]
  posTerms: readonly string[]
  kmap: KMapModel
  selectedGroup: number[]
  groupValidation: { valid: boolean; issues?: ReadonlyArray<{ message: string }> } | null
  groupedSummary: { reasons: ReadonlyArray<{ text: string }> } | null
  /** Full GroupedTerm data for circuit diagram rendering. */
  sopGroupsData?: readonly GroupedTerm[]
  /** Full GroupedTerm data for circuit diagram rendering. */
  posGroupsData?: readonly GroupedTerm[]
  /** PDF export button rendered in the header. */
  pdfExportButton?: React.ReactNode
  /** Expression-Circuit-TruthTable chain component. */
  expressionChain?: React.ReactNode
}

/**
 * Expandable variable analysis for a single group in the Results tab.
 */
function GroupVariableAnalysis({
  cells,
  term,
  mode,
  kmap,
}: {
  cells: readonly number[]
  term: string
  mode: 'sop' | 'pos'
  kmap: KMapModel
}) {
  const analysis = useMemo(() => analyzeGroupVariables(kmap, cells), [kmap, cells])
  const wraps = useMemo(() => groupWraps(kmap, [...new Set(cells)]), [kmap, cells])

  return (
    <div className="space-y-1.5 mt-1.5">
      {/* Wrap indicator */}
      {wraps && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          ↻ This group wraps around the K-map edge.
        </p>
      )}

      {/* Variable comparison table */}
      <div className="rounded border overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <th className="px-1.5 py-0.5 font-medium text-left" style={{ color: 'var(--text-secondary)' }}>Cell</th>
              {analysis.variables.map((v, i) => {
                const isChanged = analysis.changed.includes(v)
                return (
                  <th
                    key={i}
                    className="px-1.5 py-0.5 font-medium text-center"
                    style={{ color: isChanged ? 'var(--error-text)' : 'var(--success-text)' }}
                  >
                    {v}
                    {isChanged ? ' ⟷' : ''}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {analysis.rows.map((row) => (
              <tr key={row.minterm} className="border-t" style={{ borderColor: 'var(--bg-tertiary)' }}>
                <td className="px-1.5 py-0.5 font-mono" style={{ color: 'var(--text-primary)' }}>m{row.minterm}</td>
                {row.bits.map((b, i) => {
                  const v = analysis.variables[i]!
                  const isChanged = analysis.changed.includes(v)
                  return (
                    <td
                      key={i}
                      className="px-1.5 py-0.5 text-center font-mono"
                      style={{
                        color: isChanged ? 'var(--error-text)' : 'var(--success-text)',
                        textDecoration: isChanged ? 'line-through' : undefined,
                        textDecorationColor: isChanged ? 'var(--error-text)' : undefined,
                      }}
                    >
                      {b}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Term derivation */}
      <div className="rounded p-1.5 text-xs" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Derivation: </span>
        {analysis.constant.length > 0 ? (
          <span>
            {analysis.constant.map((c, i) => {
              const negated = mode === 'sop' ? c.value === 0 : c.value === 1
              const literal = negated ? `${c.name}'` : c.name
              return (
                <span key={i}>
                  {i > 0 && <span style={{ color: 'var(--text-muted)' }}> · </span>}
                  <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{c.name}={c.value}</span>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <span className="font-mono font-medium" style={{ color: 'var(--accent-primary)' }}>{literal}</span>
                </span>
              )
            })}
            <span className="ml-1 font-mono font-semibold" style={{ color: 'var(--accent-primary)' }}>= {term}</span>
          </span>
        ) : (
          <span className="font-mono font-semibold" style={{ color: 'var(--accent-primary)' }}>1</span>
        )}
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-1">
        {analysis.constant.length > 0 && (
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(74,222,128,0.15)', color: 'var(--success-text)' }}>
            constant: {analysis.constant.map((c) => `${c.name}=${c.value}`).join(', ')}
          </span>
        )}
        {analysis.changed.length > 0 && (
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(248,113,113,0.15)', color: 'var(--error-text)' }}>
            eliminated: {analysis.changed.join(', ')}
          </span>
        )}
      </div>
    </div>
  )
}

export default function ResultsTabContent({
  showSOP,
  setShowSOP,
  simplifiedExpression,
  originalExpression,
  sopGroups,
  posGroups,
  sopTerms,
  posTerms,
  kmap,
  selectedGroup,
  groupValidation,
  groupedSummary,
  sopGroupsData,
  posGroupsData,
  pdfExportButton,
  expressionChain,
}: ResultsTabContentProps) {
  const [expandedGroupIndex, setExpandedGroupIndex] = useState<number | null>(null)

  const bg = {
    card: { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' },
    tertiary: { backgroundColor: 'var(--bg-tertiary)' },
    accent: { backgroundColor: 'var(--accent-primary)', color: '#fff' },
    muted: { color: 'var(--text-secondary)' },
    heading: { color: 'var(--accent-primary)' },
  }

  const activeGroups = showSOP ? sopGroups : posGroups
  const activeMode = showSOP ? 'sop' : 'pos'

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Simplified Expression */}
      <SectionCard
        title="Simplified Expression"
        className="section-card-primary"
        headerRight={
          <div className="flex items-center gap-1.5">
            {pdfExportButton}
            <div className="flex gap-control-group control-group">
              <button
                onClick={() => setShowSOP(true)}
                className="px-3 py-1.5 rounded text-sm font-medium transition-all button-primary-enhanced"
                style={showSOP ? { ...bg.accent, boxShadow: 'var(--shadow-accent)' } : bg.tertiary}
              >
                SOP
              </button>
              <button
                onClick={() => setShowSOP(false)}
                className="px-3 py-1.5 rounded text-sm font-medium transition-all button-primary-enhanced"
                style={!showSOP ? { ...bg.accent, boxShadow: 'var(--shadow-accent)' } : bg.tertiary}
              >
                POS
              </button>
            </div>
          </div>
        }
      >
        <div className="rounded p-2 sm:p-2.5 font-mono text-sm sm:text-base elevation-secondary" style={bg.tertiary}>
          {simplifiedExpression}
        </div>

        <div className="mt-1.5 sm:mt-2">
          <h3 className="text-xs font-semibold mb-1 sm:mb-1.5" style={bg.muted}>Groups</h3>
          <div className="space-y-1">
            {activeGroups.map((group, idx) => {
              const color = KMAP_GROUP_COLORS[idx % KMAP_GROUP_COLORS.length]
              const isExpanded = expandedGroupIndex === idx
              const term = showSOP ? group.productText : group.sumText

              return (
                <div
                  key={idx}
                  className="rounded border overflow-hidden"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  {/* Group header */}
                  <button
                    onClick={() => setExpandedGroupIndex(isExpanded ? null : idx)}
                    className="w-full text-left p-1.5 flex items-center gap-2 transition-colors hover:opacity-90"
                    style={bg.tertiary}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-sm border"
                      style={{ backgroundColor: color.fill, borderColor: color.border }}
                    />
                    <span className="font-mono text-xs px-1 py-0.5 rounded" style={{ ...bg.card, color: 'var(--accent-secondary)' }}>
                      G{idx + 1}
                    </span>
                    <span className="flex-1 text-xs" style={{ color: 'var(--text-primary)' }}>
                      [{Array.from(group.cells).join(', ')}]
                    </span>
                    <span className="font-mono text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>
                      {term}
                    </span>
                    <span
                      className="text-xs transition-transform"
                      style={{
                        color: 'var(--text-muted)',
                        display: 'inline-block',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      }}
                    >
                      ▶
                    </span>
                  </button>

                  {/* Expanded variable analysis */}
                  {isExpanded && (
                    <div className="px-1.5 pb-1.5 border-t" style={{ borderColor: 'var(--border-color)' }}>
                      <GroupVariableAnalysis
                        cells={group.cells}
                        term={term}
                        mode={activeMode}
                        kmap={kmap}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </SectionCard>

      {/* Logic Circuit Diagram */}
      {(() => {
        const circuitGroups = showSOP ? sopGroupsData : posGroupsData
        if (circuitGroups && circuitGroups.length > 0) {
          return (
            <LogicCircuit
              simplifiedExpression={simplifiedExpression}
              groups={circuitGroups}
              mode={showSOP ? 'sop' : 'pos'}
            />
          )
        }
        return null
      })()}

      {/* Expression-Circuit-TruthTable Chain */}
      {expressionChain}

      {/* Verify */}
      <VerifyPanel
        kmap={kmap}
        showSOP={showSOP}
        sopTerms={sopTerms}
        posTerms={posTerms}
        simplifiedExpression={simplifiedExpression}
        originalExpression={originalExpression}
        selectedGroup={selectedGroup}
      />

      {/* Group Validation */}
      {groupValidation && (
        <SectionCard
          title="Group Validation"
          defaultOpen
        >
          <div className="flex items-center justify-between">
            {groupValidation.valid ? (<div style={{ color: 'var(--success-text)' }}>
              <p className="font-semibold">Valid Group</p>
              <p className="text-sm mt-1" style={bg.muted}>
                Selected cells form a valid K-map group.
              </p>
              <ul className="text-sm mt-2 space-y-1 list-disc list-inside" style={bg.muted}>
                {groupedSummary?.reasons.map((r, idx) => (
                  <li key={idx}>{r.text}</li>
                ))}
              </ul>
            </div>) : (
              <div style={{ color: 'var(--error-text)' }}>
                <p className="font-semibold">Invalid Group</p>
                <ul className="text-sm mt-1 list-disc list-inside" style={bg.muted}>
                  {groupValidation.issues?.map((issue, idx) => (
                    <li key={idx}>{issue.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  )
}
