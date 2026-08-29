import { useMemo, useState } from 'react'
import type { KMapSolution } from '../../../application/kmap'
import { analyzeGroupVariables, groupWraps } from '../../../core/kmap/group-reasoning'
import { KMAP_GROUP_COLORS } from './kmapHighlight'

interface GroupingSolutionProps {
  solution: KMapSolution
  /** Reuses the shared K-map highlight so a clicked group is spotlighted on the grid. */
  onHighlightChange: (groups: { minterms: readonly number[]; colorIndex: number }[]) => void
}

/**
 * Variable comparison table for a single group.
 * Shows each cell's bit values per variable, highlighting which variables
 * stay constant (kept in the term) and which change (eliminated).
 */
function VariableComparisonTable({
  variables,
  rows,
  changed,
}: {
  variables: readonly string[]
  rows: readonly { minterm: number; bits: readonly number[] }[]
  changed: readonly string[]
}) {
  const bg = {
    header: { backgroundColor: 'var(--bg-tertiary)' },
    changed: { color: 'var(--error-text)' },
    constant: { color: 'var(--success-text)' },
  }

  return (
    <table className="w-full text-xs rounded overflow-hidden border" style={{ borderColor: 'var(--border-color)' }}>
      <thead>
        <tr style={bg.header}>
          <th className="px-1.5 py-1 font-medium text-left" style={{ color: 'var(--text-secondary)' }}>Cell</th>
          {variables.map((v, i) => {
            const isChanged = changed.includes(v)
            return (
              <th
                key={i}
                className="px-1.5 py-1 font-medium text-center"
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
        {rows.map((row) => (
          <tr key={row.minterm} className="border-t" style={{ borderColor: 'var(--bg-tertiary)' }}>
            <td className="px-1.5 py-0.5 font-mono" style={{ color: 'var(--text-primary)' }}>m{row.minterm}</td>
            {row.bits.map((b, i) => {
              const v = variables[i]!
              const isChanged = changed.includes(v)
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
  )
}

/**
 * Term derivation badge showing how the simplified term was built.
 */
function TermDerivation({
  constant,
  mode,
  term,
}: {
  constant: readonly { name: string; value: number }[]
  mode: 'sop' | 'pos'
  term: string
}) {
  if (constant.length === 0) {
    return (
      <div className="rounded p-1.5 text-xs" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <span style={{ color: 'var(--text-secondary)' }}>All variables eliminated → </span>
        <span className="font-mono font-medium" style={{ color: 'var(--accent-primary)' }}>1</span>
      </div>
    )
  }

  return (
    <div className="rounded p-1.5 text-xs" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
      <span className="font-medium block mb-0.5" style={{ color: 'var(--text-secondary)' }}>Derivation:</span>
      <div className="flex flex-wrap gap-1 items-center">
        {constant.map((c, i) => {
          const negated = mode === 'sop' ? c.value === 0 : c.value === 1
          const literal = negated ? `${c.name}'` : c.name
          return (
            <span key={i} className="flex items-center gap-0.5">
              {i > 0 && <span style={{ color: 'var(--text-muted)' }}>·</span>}
              <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                {c.name}={c.value}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
              <span className="font-mono font-medium" style={{ color: 'var(--accent-primary)' }}>
                {literal}
              </span>
            </span>
          )
        })}
        <span className="ml-1 font-mono font-semibold" style={{ color: 'var(--accent-primary)' }}>= {term}</span>
      </div>
    </div>
  )
}

/**
 * A persistent "Grouping Solution" overview that sits alongside the
 * step-by-step walkthrough. It shows every final group with its cells,
 * variable comparison table, term derivation, and wrap indicators —
 * colour-coded to match the K-map overlay. Clicking a group spotlights
 * just that group on the grid.
 */
export default function GroupingSolution({ solution, onHighlightChange }: GroupingSolutionProps) {
  const { groups, terms, mode, model } = solution
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  // Pre-compute variable analysis for all groups
  const analyses = useMemo(() => {
    return groups.map((group) => {
      const analysis = analyzeGroupVariables(model, group)
      const wraps = groupWraps(model, [...new Set(group)])
      return { ...analysis, wraps }
    })
  }, [groups, model])

  if (groups.length === 0) {
    return (
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        No groups were formed (no relevant cells to group).
      </p>
    )
  }

  const highlightGroup = (groupIndex: number) => {
    setActiveIndex(groupIndex)
    onHighlightChange([{
      minterms: groups[groupIndex]!,
      colorIndex: groupIndex % KMAP_GROUP_COLORS.length,
    }])
  }

  const clearActive = () => {
    setActiveIndex(null)
  }

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  // Group size context
  const getGroupSizeLabel = (size: number): string => {
    if (size === 1) return '1 cell (no elimination)'
    if (size === 2) return '2 cells → eliminates 1 variable'
    if (size === 4) return '4 cells → eliminates 2 variables'
    if (size === 8) return '8 cells → eliminates 3 variables'
    return `${size} cells`
  }

  return (
    <div className="mt-3 rounded-lg border p-3" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
      <div className="mb-2 flex items-center justify-between">
        <h5 className="text-sm font-semibold" style={{ color: 'var(--accent-primary)' }}>Grouping Solution</h5>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {groups.length} group{groups.length === 1 ? '' : 's'} · {mode.toUpperCase()}
        </span>
      </div>
      <p className="mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        Click a group to highlight its cells on the K-map.{' '}
        {activeIndex !== null && (
          <button onClick={clearActive} className="underline decoration-dotted" style={{ color: 'var(--accent-primary)' }}>
            clear highlight
          </button>
        )}
      </p>

      <div className="space-y-2">
        {groups.map((group, gi) => {
          const color = KMAP_GROUP_COLORS[gi % KMAP_GROUP_COLORS.length]
          const active = activeIndex === gi
          const hovered = hoveredIndex === gi
          const isActive = active || (hovered && !active)
          const isExpanded = expandedIndex === gi
          const analysis = analyses[gi]!

          return (
            <div
              key={gi}
              className="rounded border transition-colors"
              style={{
                borderColor: active
                  ? 'var(--accent-primary)'
                  : hovered
                    ? 'var(--border-light)'
                    : 'var(--border-color)',
                backgroundColor: isActive
                  ? 'var(--accent-bg)'
                  : 'var(--bg-tertiary)',
              }}
            >
              {/* Group header — clickable to highlight */}
              <button
                onClick={() => highlightGroup(gi)}
                onMouseEnter={() => setHoveredIndex(gi)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="w-full p-2 text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-sm border"
                      style={{ backgroundColor: color.fill, borderColor: color.border }}
                    />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Group {gi + 1}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {group.length} cell{group.length === 1 ? '' : 's'}
                    </span>
                    {analysis.wraps && (
                      <span className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                        ↻ wrap
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-sm" style={{ color: 'var(--accent-primary)' }}>
                    {terms[gi] ?? ''}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {group.map((m) => (
                    <span
                      key={m}
                      className="rounded px-1.5 py-0.5 font-mono text-xs"
                      style={{ backgroundColor: 'var(--border-light)', color: 'var(--text-primary)' }}
                    >
                      m{m}
                    </span>
                  ))}
                </div>
              </button>

              {/* Expand/collapse toggle for variable analysis */}
              <div className="px-2 pb-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpand(gi)
                  }}
                  className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  <span className="transition-transform" style={{ display: 'inline-block', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                    ▶
                  </span>
                  {isExpanded ? 'Hide details' : `Show variable analysis`}
                </button>
              </div>

              {/* Expanded variable analysis */}
              {isExpanded && (
                <div className="px-2 pb-2 space-y-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  {/* Group size context */}
                  <p className="text-xs pt-2" style={{ color: 'var(--text-secondary)' }}>
                    {getGroupSizeLabel(group.length)}
                  </p>

                  {/* Variable comparison table */}
                  <VariableComparisonTable
                    variables={analysis.variables}
                    rows={analysis.rows}
                    changed={analysis.changed}
                  />

                  {/* Term derivation */}
                  <TermDerivation
                    constant={analysis.constant}
                    mode={mode}
                    term={terms[gi] ?? ''}
                  />

                  {/* Summary badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.constant.length > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(74,222,128,0.15)', color: 'var(--success-text)' }}>
                        {analysis.constant.length} constant: {analysis.constant.map((c) => `${c.name}=${c.value}`).join(', ')}
                      </span>
                    )}
                    {analysis.changed.length > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(248,113,113,0.15)', color: 'var(--error-text)' }}>
                        {analysis.changed.length} eliminated: {analysis.changed.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
