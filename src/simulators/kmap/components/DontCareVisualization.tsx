import { useMemo, useState } from 'react'
import SectionCard from './SectionCard'
import { KMAP_GROUP_COLORS } from './kmapHighlight'
import type { KMapModel } from '../../../core/kmap'
import { createKMap } from '../../../core/kmap'

interface DontCareExample {
  title: string
  description: string
  variables: readonly string[]
  ones: readonly number[]
  zeros: readonly number[]
  dontCares: readonly number[]
  optimalGroups: readonly {
    cells: readonly number[]
    term: string
    usesDontCare: boolean
  }[]
  explanation: string
}

const DONT_CARE_EXAMPLES: readonly DontCareExample[] = [
  {
    title: 'Basic Don\'t-Care Usage',
    description: 'A 3-variable function where one don\'t-care helps create a larger group.',
    variables: ['A', 'B', 'C'],
    ones: [1, 3, 5, 7],
    zeros: [0, 2],
    dontCares: [4, 6],
    optimalGroups: [
      { cells: [1, 3, 5, 7], term: 'C', usesDontCare: false },
      { cells: [0, 2, 4, 6], term: 'C\'', usesDontCare: true },
    ],
    explanation: 'The don\'t-care cells (4, 6) are NOT used in the optimal group for 1s. Group [1,3,5,7] covers all 1-minterms with just one term: C. The don\'t-cares were available but not needed here.',
  },
  {
    title: 'Don\'t-Care Enables Larger Group',
    description: 'A 4-variable function where a don\'t-care doubles the group size.',
    variables: ['A', 'B', 'C', 'D'],
    ones: [0, 1, 2, 5, 6, 7],
    zeros: [3, 4],
    dontCares: [8, 10],
    optimalGroups: [
      { cells: [0, 1, 4, 5], term: 'A\'D\'', usesDontCare: false },
      { cells: [0, 2, 8, 10], term: 'B\'D\'', usesDontCare: true },
      { cells: [2, 6, 10], term: 'CD\'', usesDontCare: true },
      { cells: [1, 5, 7], term: 'A\'D', usesDontCare: false },
    ],
    explanation: 'Don\'t-care cell 10 enables the group [0,2,8,10] which covers minterms 0 and 2 with a simpler term. Without the don\'t-care, we would need two separate smaller groups. The don\'t-care acts as a "wildcard" — the optimizer treats it as either 0 or 1, whichever produces a simpler expression.',
  },
  {
    title: 'Multiple Don\'t-Cares',
    description: 'A function with several don\'t-cares that can be selectively used.',
    variables: ['A', 'B', 'C', 'D'],
    ones: [1, 3, 7, 13],
    zeros: [0, 2, 4, 8, 12, 14, 15],
    dontCares: [5, 9, 10, 11],
    optimalGroups: [
      { cells: [1, 3, 5, 7], term: 'A\'D', usesDontCare: true },
      { cells: [9, 13], term: 'AB\'D', usesDontCare: true },
    ],
    explanation: 'Don\'t-care 5 extends the group [1,3] to [1,3,5,7], eliminating one variable. Don\'t-care 9 pairs with minterm 13. The other don\'t-cares (10, 11) are not used because they don\'t help cover any required 1-minterms more efficiently.',
  },
]

function ExampleCard({ example, index }: { example: DontCareExample; index: number }) {
  const [showGrid, setShowGrid] = useState(false)

  const kmap = useMemo(() => {
    const model = createKMap(example.variables)
    let current = model
    for (const m of example.ones) {
      const { row, col } = (current.layout as unknown as { variables: string[] }).variables.length === example.variables.length
        ? { row: Math.floor(m / (2 ** Math.ceil(example.variables.length / 2))), col: m % (2 ** Math.floor(example.variables.length / 2)) }
        : { row: 0, col: 0 }
      current = {
        layout: current.layout,
        cells: current.cells.map((r, ri) => r.map((c, ci) => {
          if (ri === row && ci === col) return { ...c, value: 1 as const }
          return c
        })),
      }
    }
    for (const m of example.zeros) {
      const row = Math.floor(m / (2 ** Math.ceil(example.variables.length / 2)))
      const col = m % (2 ** Math.floor(example.variables.length / 2))
      current = {
        layout: current.layout,
        cells: current.cells.map((r, ri) => r.map((c, ci) => {
          if (ri === row && ci === col) return { ...c, value: 0 as const }
          return c
        })),
      }
    }
    for (const m of example.dontCares) {
      const row = Math.floor(m / (2 ** Math.ceil(example.variables.length / 2)))
      const col = m % (2 ** Math.floor(example.variables.length / 2))
      current = {
        layout: current.layout,
        cells: current.cells.map((r, ri) => r.map((c, ci) => {
          if (ri === row && ci === col) return { ...c, value: 'X' as const }
          return c
        })),
      }
    }
    return current
  }, [example])

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
    >
      <div className="p-3" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm" style={{ color: 'var(--accent-primary)' }}>
            Example {index + 1}: {example.title}
          </h4>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className="text-xs px-2 py-1 rounded transition-colors"
            style={{
              backgroundColor: showGrid ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: showGrid ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {showGrid ? 'Hide Grid' : 'Show Grid'}
          </button>
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          {example.description}
        </p>
      </div>

      {showGrid && (
        <div className="p-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <MiniKMapGrid kmap={kmap} />
        </div>
      )}

      <div className="p-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(74,222,128,0.15)', color: 'var(--success-text)' }}>
            1s: [{example.ones.join(', ')}]
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(148,163,184,0.15)', color: 'var(--text-secondary)' }}>
            0s: [{example.zeros.join(', ')}]
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(250,204,21,0.15)', color: '#eab308' }}>
            X: [{example.dontCares.join(', ')}]
          </span>
        </div>

        <div className="space-y-1.5">
          {example.optimalGroups.map((group, gi) => (
            <div
              key={gi}
              className="flex items-center gap-2 text-xs rounded px-2 py-1"
              style={{
                backgroundColor: group.usesDontCare ? 'rgba(250,204,21,0.08)' : 'var(--bg-tertiary)',
                border: group.usesDontCare ? '1px solid rgba(250,204,21,0.3)' : '1px solid var(--border-color)',
              }}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-sm"
                style={{ backgroundColor: KMAP_GROUP_COLORS[gi % KMAP_GROUP_COLORS.length].border }}
              />
              <span className="font-mono font-medium" style={{ color: 'var(--accent-primary)' }}>
                {group.term}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>=</span>
              <span style={{ color: 'var(--text-primary)' }}>
                [{group.cells.join(', ')}]
              </span>
              {group.usesDontCare && (
                <span className="text-[10px] px-1 py-0.5 rounded" style={{ backgroundColor: 'rgba(250,204,21,0.2)', color: '#eab308' }}>
                  uses don't-care
                </span>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {example.explanation}
        </p>
      </div>
    </div>
  )
}

function MiniKMapGrid({ kmap }: { kmap: KMapModel }) {
  const { layout, cells } = kmap
  const cellSize = 32
  const labelWidth = 24
  const headerHeight = 20
  const width = layout.cols * cellSize + labelWidth
  const height = layout.rows * cellSize + headerHeight

  return (
    <svg width={width} height={height} className="mx-auto">
      {layout.colLabels.map((label, i) => (
        <text
          key={`col-${i}`}
          x={labelWidth + i * cellSize + cellSize / 2}
          y={headerHeight - 6}
          textAnchor="middle"
          className="text-[9px] font-mono"
          style={{ fill: 'var(--text-secondary)' }}
        >
          {label}
        </text>
      ))}
      {layout.rowLabels.map((label, i) => (
        <text
          key={`row-${i}`}
          x={labelWidth - 4}
          y={headerHeight + i * cellSize + cellSize / 2 + 3}
          textAnchor="end"
          className="text-[9px] font-mono"
          style={{ fill: 'var(--text-secondary)' }}
        >
          {label}
        </text>
      ))}
      {cells.flatMap((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <g key={`${rowIndex}-${colIndex}`}>
            <rect
              x={labelWidth + colIndex * cellSize}
              y={headerHeight + rowIndex * cellSize}
              width={cellSize}
              height={cellSize}
              fill="var(--bg-tertiary)"
              stroke="var(--border-color)"
              strokeWidth={1}
            />
            <text
              x={labelWidth + colIndex * cellSize + cellSize / 2}
              y={headerHeight + rowIndex * cellSize + cellSize / 2 + 4}
              textAnchor="middle"
              className="text-[10px] font-bold"
              style={{
                fill:
                  cell.value === 1 ? 'var(--cell-1)' :
                  cell.value === 0 ? 'var(--cell-0)' :
                  cell.value === 'X' ? 'var(--cell-x)' :
                  'var(--text-muted)',
              }}
            >
              {cell.value === null ? `m${cell.minterm}` : cell.value}
            </text>
          </g>
        )),
      )}
    </svg>
  )
}

export default function DontCareVisualization() {

  return (
    <SectionCard
      title="Don't-Care Visualization"
      subtitle="Understanding how don't-care cells (X) enable simpler expressions by acting as flexible wildcards in K-Map grouping."
      defaultOpen={false}
    >
      <div className="space-y-3">
        <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
          <h4 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--accent-primary)' }}>
            What are Don't-Cares?
          </h4>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Don't-care cells (marked <span className="font-mono font-bold" style={{ color: 'var(--cell-x)' }}>X</span>) represent input combinations
            that will never occur in practice, or whose output doesn't matter. During K-Map simplification, the optimizer
            can treat each X as either <span className="font-mono" style={{ color: 'var(--cell-1)' }}>1</span> or{' '}
            <span className="font-mono" style={{ color: 'var(--cell-0)' }}>0</span> — whichever produces a simpler expression.
            This flexibility often allows larger groups, eliminating more variables.
          </p>
        </div>

        <div className="grid gap-2">
          {DONT_CARE_EXAMPLES.map((example, i) => (
            <div key={i}>
              <ExampleCard example={example} index={i} />
            </div>
          ))}
        </div>

        <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--accent-bg)', border: '1px solid var(--accent-primary)' }}>
          <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--accent-primary)' }}>
            Key Rule
          </h4>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            Don't-cares are <strong>optional</strong> — they help create larger groups but are never required to be covered.
            The simplification algorithm uses them only when they reduce the total number of terms or literals.
            You can always check which don't-cares were used by expanding the group analysis in the Results tab.
          </p>
        </div>
      </div>
    </SectionCard>
  )
}
