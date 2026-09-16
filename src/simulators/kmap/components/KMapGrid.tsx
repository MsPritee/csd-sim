import { useLayoutEffect, useRef, useState, useCallback, useMemo } from 'react'
import type { KMapModel } from '../../../core/kmap'
import { adjacentMinterms } from '../../../core/kmap'
import { KMAP_GROUP_COLORS, contiguousRuns } from './kmapHighlight'

const BASE_CELL_SIZE = 70
const MIN_CELL_SIZE = 45
const LABEL_WIDTH = 45
const HEADER_HEIGHT = 45
/** Extra SVG canvas room so group-border strokes at the right/bottom edge are not clipped. */
const CANVAS_PAD = 4

interface GroupOverlay {
  /** Minterms belonging to this group. */
  readonly minterms: readonly number[]
  /** Index into KMAP_GROUP_COLORS for colour. */
  readonly colorIndex: number
}

interface KMapGridProps {
  kmap: KMapModel
  onCellClick: (minterm: number) => void
  onCellSelect: (minterm: number) => void
  onCellInfo: (minterm: number) => void
  selectedCells: Set<number>
  hoveredCell: number | null
  onCellHover: (minterm: number | null) => void
  showMintermNumbers: boolean
  showSOP: boolean
  /** Group overlays rendered as unified rectangles (one rect per group). */
  groupOverlays?: readonly GroupOverlay[]
  /** When true, subtly mark the valid adjacent cells of the hovered cell. */
  showAdjacency?: boolean
}

export default function KMapGrid({
  kmap,
  onCellClick,
  onCellSelect,
  onCellInfo,
  selectedCells,
  hoveredCell,
  onCellHover,
  showMintermNumbers,
  showSOP,
  groupOverlays,
  showAdjacency = false,
}: KMapGridProps) {
  const { layout, cells } = kmap

  const wrapRef = useRef<HTMLDivElement>(null)
  const [cellSize, setCellSize] = useState(BASE_CELL_SIZE)

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const fitCell = (clientWidth: number) => {
      const available = clientWidth - LABEL_WIDTH
      const want = layout.cols > 0 ? available / layout.cols : BASE_CELL_SIZE
      setCellSize(Math.max(MIN_CELL_SIZE, Math.min(BASE_CELL_SIZE, want)))
    }
    fitCell(el.clientWidth)
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) fitCell(entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [layout.cols])

  const labelWidth = LABEL_WIDTH
  const headerHeight = HEADER_HEIGHT

  const adjacencySet =
    showAdjacency && hoveredCell !== null
      ? new Set(adjacentMinterms(kmap, hoveredCell))
      : null

  const handleCellClick = useCallback((minterm: number) => {
    onCellClick(minterm)
  }, [onCellClick])

  const handleCellSelect = useCallback((minterm: number) => {
    onCellSelect(minterm)
  }, [onCellSelect])

  const width = layout.cols * cellSize + labelWidth + CANVAS_PAD
  const height = layout.rows * cellSize + headerHeight + CANVAS_PAD

  // Convert minterm → (row, col) lookup
  const mintermToPos = useMemo(() => {
    const map = new Map<number, { row: number; col: number }>()
    for (const row of cells) {
      for (const cell of row) {
        map.set(cell.minterm, { row: cell.row, col: cell.col })
      }
    }
    return map
  }, [cells])

  // Compute bounding rectangles for each group overlay
  const groupRects = useMemo(() => {
    if (!groupOverlays || groupOverlays.length === 0) return []

    const result: { x: number; y: number; w: number; h: number; colorIndex: number; groupIdx: number }[] = []

    for (let gi = 0; gi < groupOverlays.length; gi++) {
      const group = groupOverlays[gi]!
      const rows = new Set<number>()
      const cols = new Set<number>()

      for (const m of group.minterms) {
        const pos = mintermToPos.get(m)
        if (!pos) continue
        rows.add(pos.row)
        cols.add(pos.col)
      }

      // Flatten each axis into contiguous runs. A valid group is one rectangle
      // (possibly wrapping at a seam), so it is a product of row-runs and
      // col-runs; drawing one solid rectangle per block makes a non-wrap group
      // a single rectangle and a wrap-around group two (or four) solid pieces
      // that line up with the seam — matching the normal-group style.
      const rowRuns = contiguousRuns(Array.from(rows).sort((a, b) => a - b))
      const colRuns = contiguousRuns(Array.from(cols).sort((a, b) => a - b))
      const pad = 2

      for (const rowRun of rowRuns) {
        for (const colRun of colRuns) {
          const minRow = rowRun[0]!
          const minCol = colRun[0]!
          result.push({
            x: labelWidth + minCol * cellSize - pad,
            y: headerHeight + minRow * cellSize - pad,
            w: colRun.length * cellSize + pad * 2,
            h: rowRun.length * cellSize + pad * 2,
            colorIndex: group.colorIndex,
            groupIdx: gi,
          })
        }
      }
    }

    return result
  }, [groupOverlays, mintermToPos, cellSize, labelWidth, headerHeight, layout])

  return (
    <div ref={wrapRef} className="overflow-x-auto">
      <svg
        width={width}
        height={height}
        className="mx-auto"
      >
        {/* Column Labels */}
        {layout.colLabels.map((label, i) => (
          <text
            key={`col-${i}`}
            x={labelWidth + i * cellSize + cellSize / 2}
            y={headerHeight - 12}
            textAnchor="middle"
            className="text-sm font-mono"
            style={{ fill: 'var(--text-secondary)' }}
          >
            {label}
          </text>
        ))}

        {/* Row Labels */}
        {layout.rowLabels.map((label, i) => (
          <text
            key={`row-${i}`}
            x={labelWidth - 12}
            y={headerHeight + i * cellSize + cellSize / 2 + 4}
            textAnchor="end"
            className="text-sm font-mono"
            style={{ fill: 'var(--text-secondary)' }}
          >
            {label}
          </text>
        ))}

        {/* Variable Labels */}
        <text
          x={labelWidth + layout.cols * cellSize / 2}
          y={22}
          textAnchor="middle"
          className="text-xs font-semibold"
          style={{ fill: 'var(--accent-primary)' }}
        >
          {layout.colVariables.join('')}
        </text>
        <text
          x={18}
          y={headerHeight + layout.rows * cellSize / 2}
          textAnchor="middle"
          className="text-xs font-semibold"
          style={{ fill: 'var(--accent-primary)' }}
          transform={`rotate(-90, 18, ${headerHeight + layout.rows * cellSize / 2})`}
        >
          {layout.rowVariables.join('')}
        </text>

        {/* Cells */}
        {cells.flatMap((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <g key={`${rowIndex}-${colIndex}`}>
              <title>Cell m{cell.minterm}: Value {cell.value === null ? 'empty' : cell.value}. Click to set value, right-click for info, Ctrl+click to select.</title>
              <rect
                data-testid={`kmap-cell-${cell.minterm}`}
                x={labelWidth + colIndex * cellSize}
                y={headerHeight + rowIndex * cellSize}
                width={cellSize}
                height={cellSize}
                className={`cursor-pointer kmap-cell ${
                  selectedCells.has(cell.minterm) ? 'stroke-2 kmap-cell-selected' : ''
                } ${
                  hoveredCell === cell.minterm ? 'stroke-2' : ''
                }`}
                style={{
                  fill: 'var(--bg-tertiary)',
                  stroke: selectedCells.has(cell.minterm) || hoveredCell === cell.minterm
                    ? 'var(--accent-primary)'
                    : 'var(--border-light)',
                }}
                onClick={() => handleCellClick(cell.minterm)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  onCellInfo(cell.minterm)
                }}
                onMouseDown={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    e.preventDefault()
                    handleCellSelect(cell.minterm)
                  }
                }}
                onMouseEnter={() => onCellHover(cell.minterm)}
                onMouseLeave={() => onCellHover(null)}
              />
              {adjacencySet?.has(cell.minterm) && (
                <rect
                  x={labelWidth + colIndex * cellSize + 3}
                  y={headerHeight + rowIndex * cellSize + 3}
                  width={cellSize - 6}
                  height={cellSize - 6}
                  fill="none"
                  stroke="var(--accent-secondary, var(--accent-primary))"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  className="pointer-events-none"
                />
              )}
              <text
                x={labelWidth + colIndex * cellSize + cellSize / 2}
                y={headerHeight + rowIndex * cellSize + cellSize / 2 + 4}
                textAnchor="middle"
                className="pointer-events-none font-bold"
                style={{
                  fill:
                    cell.value === 1
                      ? 'var(--cell-1)'
                      : cell.value === 0
                      ? 'var(--cell-0)'
                      : cell.value === 'X'
                      ? 'var(--cell-x)'
                      : 'var(--text-primary)',
                }}
              >
                {cell.value === null
                  ? (showSOP ? `m${cell.minterm}` : `M${cell.minterm}`)
                  : cell.value}
              </text>
              {showMintermNumbers && (
                <text
                  x={labelWidth + colIndex * cellSize + cellSize - 4}
                  y={headerHeight + rowIndex * cellSize + cellSize - 6}
                  textAnchor="end"
                  className="text-[10px] font-mono font-bold pointer-events-none"
                  style={{ fill: 'var(--text-secondary)' }}
                >
                  {cell.minterm}
                </text>
              )}
            </g>
          )),
        )}

        {/* Group overlay rectangles — one unified rect per group (rendered AFTER cells so they appear on top) */}
        {groupRects.map((rect) => {
          const color = KMAP_GROUP_COLORS[rect.colorIndex % KMAP_GROUP_COLORS.length]
          return (
            <g key={`group-${rect.groupIdx}-${rect.x}-${rect.y}`} className="pointer-events-none">
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.w}
                height={rect.h}
                fill={color.fill}
                rx={4}
                ry={4}
              />
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.w}
                height={rect.h}
                fill="none"
                stroke={color.border}
                strokeWidth={2.5}
                rx={4}
                ry={4}
                strokeLinejoin="round"
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}