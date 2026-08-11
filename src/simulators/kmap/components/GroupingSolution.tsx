import { useState } from 'react'
import type { KMapSolution } from '../../../application/kmap'
import { KMAP_HIGHLIGHT_COLORS } from './kmapHighlight'

interface GroupingSolutionProps {
  solution: KMapSolution
  /** Reuses the shared K-map highlight so a clicked group is spotlighted on the grid. */
  onHighlightChange: (highlight: Map<number, number>) => void
}

/**
 * A persistent "Grouping Solution" overview that sits alongside the
 * step-by-step walkthrough. It shows every final group with its cells and the
 * term it produces, colour-coded to match the K-map overlay. Clicking a group
 * spotlights just that group on the grid.
 */
export default function GroupingSolution({ solution, onHighlightChange }: GroupingSolutionProps) {
  const { groups, terms, mode } = solution
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (groups.length === 0) {
    return (
      <p className="text-xs text-slate-500">
        No groups were formed (no relevant cells to group).
      </p>
    )
  }

  const highlightGroup = (groupIndex: number) => {
    setActiveIndex(groupIndex)
    const map = new Map<number, number>()
    groups[groupIndex]!.forEach((m) => map.set(m, groupIndex % KMAP_HIGHLIGHT_COLORS.length))
    onHighlightChange(map)
  }

  const clearActive = () => {
    setActiveIndex(null)
  }

  return (
    <div className="mt-3 rounded-lg border border-slate-700 bg-slate-800/50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h5 className="text-sm font-semibold text-violet-300">Grouping Solution</h5>
        <span className="text-xs text-slate-400">
          {groups.length} group{groups.length === 1 ? '' : 's'} · {mode.toUpperCase()}
        </span>
      </div>
      <p className="mb-2 text-xs text-slate-500">
        Click a group to highlight its cells on the K-map.{' '}
        {activeIndex !== null && (
          <button onClick={clearActive} className="text-violet-400 underline decoration-dotted">
            clear highlight
          </button>
        )}
      </p>

      <div className="space-y-2">
        {groups.map((group, gi) => {
          const color = KMAP_HIGHLIGHT_COLORS[gi % KMAP_HIGHLIGHT_COLORS.length]
          const active = activeIndex === gi
          return (
            <button
              key={gi}
              onClick={() => highlightGroup(gi)}
              className={`w-full rounded border p-2 text-left transition-colors ${
                active
                  ? 'border-violet-400 bg-slate-700/60'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-500'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-sm border border-white/20"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium text-white">
                    Group {gi + 1}
                  </span>
                  <span className="text-xs text-slate-400">
                    {group.length} cell{group.length === 1 ? '' : 's'}
                  </span>
                </div>
                <span className="font-mono text-sm text-violet-200">
                  {terms[gi] ?? ''}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {group.map((m) => (
                  <span
                    key={m}
                    className="rounded bg-slate-700 px-1.5 py-0.5 font-mono text-xs text-slate-200"
                  >
                    m{m}
                  </span>
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}