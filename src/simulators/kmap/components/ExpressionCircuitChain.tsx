import { useMemo, useState, useCallback } from 'react'
import type { KMapModel } from '../../../core/kmap'
import type { GroupedTerm } from '../../../core/kmap/simplify'

interface ChainItem {
  id: string
  type: 'expression' | 'group' | 'circuit-gate' | 'truth-row'
  label: string
  relatedIds: string[]
}

interface ExpressionCircuitTruthTableChainProps {
  simplifiedExpression: string
  groups: readonly GroupedTerm[]
  mode: 'sop' | 'pos'
  kmap: KMapModel
  onHighlightCells?: (minterms: number[]) => void
}

export default function ExpressionCircuitTruthTableChain({
  simplifiedExpression,
  groups,
  mode,
  kmap,
  onHighlightCells,
}: ExpressionCircuitTruthTableChainProps) {
  const [selectedChainItem, setSelectedChainItem] = useState<string | null>(null)
  const [highlightedItems, setHighlightedItems] = useState<Set<string>>(new Set())

  const chainItems = useMemo<ChainItem[]>(() => {
    const items: ChainItem[] = []

    items.push({
      id: 'expression',
      type: 'expression',
      label: simplifiedExpression,
      relatedIds: groups.map((_, i) => `group-${i}`),
    })

    groups.forEach((group, i) => {
      const term = mode === 'sop' ? group.productText : group.sumText
      const cellMinterms = [...group.cells]
      items.push({
        id: `group-${i}`,
        type: 'group',
        label: `G${i + 1}: ${term} [${cellMinterms.join(', ')}]`,
        relatedIds: ['expression', ...cellMinterms.map((m) => `row-${m}`)],
      })
    })

    const variables = kmap.layout.variables
    const n = variables.length
    for (let minterm = 0; minterm < 2 ** n; minterm++) {
      const cell = kmap.cells.flat().find((c) => c.minterm === minterm)
      if (cell && cell.value !== null) {
        const bits = minterm.toString(2).padStart(n, '0')
        const matchingGroups = groups
          .map((g, i) => ({ g, i }))
          .filter(({ g }) => g.cells.includes(minterm))
          .map(({ i }) => `group-${i}`)

        items.push({
          id: `row-${minterm}`,
          type: 'truth-row',
          label: `m${minterm}: ${bits} → ${cell.value}`,
          relatedIds: [...matchingGroups],
        })
      }
    }

    return items
  }, [simplifiedExpression, groups, mode, kmap])

  const handleItemClick = useCallback((item: ChainItem) => {
    setSelectedChainItem(item.id)

    const related = new Set<string>([item.id, ...item.relatedIds])
    for (const relId of item.relatedIds) {
      const relItem = chainItems.find((ci) => ci.id === relId)
      if (relItem) {
        related.add(relItem.id)
        for (const rr of relItem.relatedIds) {
          related.add(rr)
        }
      }
    }
    setHighlightedItems(related)

    if (onHighlightCells) {
      const cellMinterms: number[] = []
      if (item.type === 'group') {
        const groupIdx = parseInt(item.id.split('-')[1]!)
        const group = groups[groupIdx]
        if (group) cellMinterms.push(...group.cells)
      } else if (item.type === 'truth-row') {
        const minterm = parseInt(item.id.split('-')[1]!)
        cellMinterms.push(minterm)
      } else if (item.type === 'expression') {
        for (const g of groups) {
          cellMinterms.push(...g.cells)
        }
      }
      if (cellMinterms.length > 0) {
        onHighlightCells(cellMinterms)
      }
    }
  }, [chainItems, groups, onHighlightCells])

  const handleClearSelection = useCallback(() => {
    setSelectedChainItem(null)
    setHighlightedItems(new Set())
    onHighlightCells?.([])
  }, [onHighlightCells])

  const expressionItem = chainItems.find((ci) => ci.type === 'expression')
  const groupItems = chainItems.filter((ci) => ci.type === 'group')
  const truthRowItems = chainItems.filter((ci) => ci.type === 'truth-row')

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
    >
      <div className="flex items-center justify-between p-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--accent-primary)' }}>
            Expression → Circuit → Truth Table Chain
          </h3>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Click any element to highlight its connections across all representations
          </p>
        </div>
        {selectedChainItem && (
          <button
            onClick={handleClearSelection}
            className="text-xs px-2 py-1 rounded transition-colors"
            style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)' }}
          >
            Clear
          </button>
        )}
      </div>

      <div className="p-2 space-y-2">
        {/* Expression Row */}
        <div className="flex items-center gap-2">
          <div className="w-16 text-[10px] font-semibold shrink-0" style={{ color: 'var(--text-muted)' }}>
            Expression
          </div>
          <button
            onClick={() => expressionItem && handleItemClick(expressionItem)}
            className="flex-1 text-left px-2 py-1.5 rounded font-mono text-xs transition-all border"
            style={{
              backgroundColor: highlightedItems.has('expression') ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
              borderColor: selectedChainItem === 'expression' ? 'var(--accent-primary)' : 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            {simplifiedExpression}
          </button>
        </div>

        {/* Arrow */}
        <div className="flex items-center gap-2">
          <div className="w-16 shrink-0" />
          <div className="flex-1 flex justify-center">
            <svg width="20" height="16" viewBox="0 0 20 16">
              <path d="M10 0 L10 10 M6 7 L10 12 L14 7" stroke="var(--text-muted)" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
        </div>

        {/* Groups */}
        <div className="flex items-start gap-2">
          <div className="w-16 text-[10px] font-semibold shrink-0 pt-1" style={{ color: 'var(--text-muted)' }}>
            Groups
          </div>
          <div className="flex-1 space-y-1">
            {groupItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="w-full text-left px-2 py-1 rounded text-xs transition-all border"
                style={{
                  backgroundColor: highlightedItems.has(item.id) ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
                  borderColor: selectedChainItem === item.id ? 'var(--accent-primary)' : 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center gap-2">
          <div className="w-16 shrink-0" />
          <div className="flex-1 flex justify-center">
            <svg width="20" height="16" viewBox="0 0 20 16">
              <path d="M10 0 L10 10 M6 7 L10 12 L14 7" stroke="var(--text-muted)" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
        </div>

        {/* Truth Table Rows */}
        <div className="flex items-start gap-2">
          <div className="w-16 text-[10px] font-semibold shrink-0 pt-1" style={{ color: 'var(--text-muted)' }}>
            Truth Table
          </div>
          <div className="flex-1 max-h-32 overflow-y-auto space-y-0.5">
            {truthRowItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="w-full text-left px-2 py-0.5 rounded text-[10px] font-mono transition-all border"
                style={{
                  backgroundColor: highlightedItems.has(item.id) ? 'var(--accent-bg)' : 'transparent',
                  borderColor: selectedChainItem === item.id ? 'var(--accent-primary)' : 'transparent',
                  color: 'var(--text-primary)',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
