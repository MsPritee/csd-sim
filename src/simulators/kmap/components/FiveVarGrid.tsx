import { useLayoutEffect, useRef, useState, useCallback, useMemo } from 'react'
import type { KMapModel } from '../../../core/kmap'
import { adjacentMinterms, mintermToCell } from '../../../core/kmap'
import { KMAP_GROUP_COLORS, contiguousRuns } from './kmapHighlight'
import { toGrayCode, fromGrayCode, grayString } from '../../../core/kmap/gray'

const BASE_CELL_SIZE = 64
const MIN_CELL_SIZE = 40
const LABEL_WIDTH = 40
const HEADER_HEIGHT = 40
const PLANE_GAP = 24
const PLANE_LABEL_HEIGHT = 22
/** Extra SVG canvas room so group-border strokes at the bottom/right edge are not clipped. */
const CANVAS_PAD = 4

interface FiveVarGridProps {
  kmap: KMapModel
  onCellClick: (minterm: number) => void
  onCellSelect: (minterm: number) => void
  onCellInfo: (minterm: number) => void
  selectedCells: Set<number>
  hoveredCell: number | null
  onCellHover: (minterm: number | null) => void
  showMintermNumbers: boolean
  showSOP: boolean
  groupOverlays?: readonly { minterms: readonly number[]; colorIndex: number }[]
  showAdjacency?: boolean
}

interface PlaneCell {
  minterm: number
  value: 0 | 1 | 'X' | null
  row: number
  col: number
}

/**
 * Minterm of a cell at (planeRow, planeCol) with the fifth variable fixed to
 * eValue. Uses the core model convention for 5 variables:
 * binary bits = A B C D E (A=bit4 … E=bit0), with rows = {A,B} in gray order
 * and columns = {C,D} in gray order.
 */
function planeCellMinterm(planeRow: number, planeCol: number, eValue: 0 | 1): number {
  const ab = toGrayCode(planeRow)
  const cd = toGrayCode(planeCol)
  return (ab << 3) | (cd << 1) | eValue
}

function buildPlaneCells(kmap: KMapModel, eValue: 0 | 1): PlaneCell[][] {
  const grid: PlaneCell[][] = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => ({ minterm: 0, value: null as 0 | 1 | 'X' | null, row: 0, col: 0 })),
  )

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const minterm = planeCellMinterm(row, col, eValue)
      const { row: modelRow, col: modelCol } = mintermToCell(kmap, minterm)
      const cell = kmap.cells[modelRow]?.[modelCol]
      grid[row]![col] = {
        minterm,
        value: cell?.value ?? null,
        row,
        col,
      }
    }
  }

  return grid
}

/** Plane position (e, row, col) of a minterm under the model's 5-variable convention. */
function mintermToPlanePos(minterm: number): { e: 0 | 1; row: number; col: number } {
  const e = (minterm & 1) as 0 | 1
  const row = fromGrayCode((minterm >> 3) & 0x03)
  const col = fromGrayCode((minterm >> 1) & 0x03)
  return { e, row, col }
}

export default function FiveVarGrid({
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
}: FiveVarGridProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [cellSize, setCellSize] = useState(BASE_CELL_SIZE)

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const fitCell = (clientWidth: number) => {
      const totalCols = 4 + 4
      const available = clientWidth - LABEL_WIDTH * 2 - PLANE_GAP
      const want = available / totalCols
      setCellSize(Math.max(MIN_CELL_SIZE, Math.min(BASE_CELL_SIZE, want)))
    }
    fitCell(el.clientWidth)
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) fitCell(entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const planeE0 = useMemo(() => buildPlaneCells(kmap, 0), [kmap])
  const planeE1 = useMemo(() => buildPlaneCells(kmap, 1), [kmap])

  const e1Vars = kmap.layout.variables.slice(0, 4)
  const eVar = kmap.layout.variables[4] ?? 'E'

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

  const renderPlane = (
    grid: PlaneCell[][],
    eValue: 0 | 1,
    vars: readonly string[],
    offsetX: number,
  ) => {
    const colLabels = Array.from({ length: 4 }, (_, i) => grayString(toGrayCode(i), 2))
    const rowLabels = Array.from({ length: 4 }, (_, i) => grayString(toGrayCode(i), 2))

    return (
      <g>
        {/* Plane label */}
        <text
          x={offsetX + 4 * cellSize / 2}
          y={PLANE_LABEL_HEIGHT - 4}
          textAnchor="middle"
          className="text-xs font-semibold"
          style={{ fill: 'var(--accent-primary)' }}
        >
          {eVar} = {eValue}
        </text>

        {/* Column labels */}
        {colLabels.map((label, i) => (
          <text
            key={`col-${eValue}-${i}`}
            x={offsetX + i * cellSize + cellSize / 2}
            y={PLANE_LABEL_HEIGHT + HEADER_HEIGHT - 10}
            textAnchor="middle"
            className="text-xs font-mono"
            style={{ fill: 'var(--text-secondary)' }}
          >
            {label}
          </text>
        ))}

        {/* Row labels */}
        {rowLabels.map((label, i) => (
          <text
            key={`row-${eValue}-${i}`}
            x={offsetX - 8}
            y={PLANE_LABEL_HEIGHT + HEADER_HEIGHT + i * cellSize + cellSize / 2 + 4}
            textAnchor="end"
            className="text-xs font-mono"
            style={{ fill: 'var(--text-secondary)' }}
          >
            {label}
          </text>
        ))}

        {/* Variable labels */}
        <text
          x={offsetX + 4 * cellSize / 2}
          y={PLANE_LABEL_HEIGHT + 14}
          textAnchor="middle"
          className="text-[10px] font-semibold"
          style={{ fill: 'var(--accent-secondary, var(--accent-primary))' }}
        >
          {vars.slice(2).join('')}
        </text>
        <text
          x={offsetX - 20}
          y={PLANE_LABEL_HEIGHT + HEADER_HEIGHT + 4 * cellSize / 2}
          textAnchor="middle"
          className="text-[10px] font-semibold"
          style={{ fill: 'var(--accent-secondary, var(--accent-primary))' }}
          transform={`rotate(-90, ${offsetX - 20}, ${PLANE_LABEL_HEIGHT + HEADER_HEIGHT + 4 * cellSize / 2})`}
        >
          {vars.slice(0, 2).join('')}
        </text>

        {/* Cells */}
        {grid.flatMap((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <g key={`${eValue}-${rowIndex}-${colIndex}`}>
              <title>Cell m{cell.minterm}: Value {cell.value === null ? 'empty' : cell.value}. Click to set value, right-click for info, Ctrl+click to select.</title>
              <rect
                data-testid={`kmap-cell-${cell.minterm}`}
                x={offsetX + colIndex * cellSize}
                y={PLANE_LABEL_HEIGHT + HEADER_HEIGHT + rowIndex * cellSize}
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
                  x={offsetX + colIndex * cellSize + 3}
                  y={PLANE_LABEL_HEIGHT + HEADER_HEIGHT + rowIndex * cellSize + 3}
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
                x={offsetX + colIndex * cellSize + cellSize / 2}
                y={PLANE_LABEL_HEIGHT + HEADER_HEIGHT + rowIndex * cellSize + cellSize / 2 + 4}
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
                  x={offsetX + colIndex * cellSize + cellSize - 4}
                  y={PLANE_LABEL_HEIGHT + HEADER_HEIGHT + rowIndex * cellSize + cellSize - 6}
                  textAnchor="end"
                  className="text-[9px] font-mono font-bold pointer-events-none"
                  style={{ fill: 'var(--text-secondary)' }}
                >
                  {cell.minterm}
                </text>
              )}
            </g>
          )),
        )}

        {/* Group overlay rectangles — unified bounding rect per group per plane (rendered AFTER cells so they appear on top) */}
        {groupOverlays?.map((group, gi) => {
          const planeMinterms = group.minterms.filter((m) => {
            const eBit = m & 1
            return eBit === eValue
          })
          if (planeMinterms.length === 0) return null

          const color = KMAP_GROUP_COLORS[group.colorIndex % KMAP_GROUP_COLORS.length]
          const pad = 2

          const positions = planeMinterms.map((m) => mintermToPlanePos(m))
          const rows = new Set(positions.map((p) => p.row))
          const cols = new Set(positions.map((p) => p.col))

          // Flatten each axis into contiguous runs so every component of the
          // group (including wrap-around pieces split at a seam) is drawn as
          // one solid rectangle — same style as a regular one-piece group.
          const rowRuns = contiguousRuns(Array.from(rows).sort((a, b) => a - b))
          const colRuns = contiguousRuns(Array.from(cols).sort((a, b) => a - b))

          return (
            <g key={`group-${eValue}-${gi}`} className="pointer-events-none">
              {rowRuns.flatMap((rowRun, ri) =>
                colRuns.map((colRun, ci) => {
                  const minRow = rowRun[0]!
                  const minCol = colRun[0]!
                  const x = offsetX + minCol * cellSize - pad
                  const y = PLANE_LABEL_HEIGHT + HEADER_HEIGHT + minRow * cellSize - pad
                  const w = colRun.length * cellSize + pad * 2
                  const h = rowRun.length * cellSize + pad * 2
                  return (
                    <g key={`gb-${eValue}-${gi}-${ri}-${ci}`}>
                      <rect x={x} y={y} width={w} height={h} fill={color.fill} rx={4} ry={4} />
                      <rect
                        x={x}
                        y={y}
                        width={w}
                        height={h}
                        fill="none"
                        stroke={color.border}
                        strokeWidth={2.5}
                        rx={4}
                        ry={4}
                        strokeLinejoin="round"
                      />
                    </g>
                  )
                })
              )}
            </g>
          )
        })}
      </g>
    )
  }

  const planeWidth = 4 * cellSize
  const totalWidth = LABEL_WIDTH + planeWidth + PLANE_GAP + planeWidth + LABEL_WIDTH + CANVAS_PAD
  const totalHeight = PLANE_LABEL_HEIGHT + HEADER_HEIGHT + 4 * cellSize + CANVAS_PAD

  return (
    <div ref={wrapRef} className="overflow-x-auto">
      <svg
        width={totalWidth}
        height={totalHeight}
        className="mx-auto"
      >
        {/* E=0 plane */}
        {renderPlane(planeE0, 0, e1Vars, LABEL_WIDTH)}

        {/* Cross-plane adjacency lines */}
        {Array.from({ length: 4 }, (_, row) =>
          Array.from({ length: 4 }, (_, col) => {
            const m0 = planeCellMinterm(row, col, 0)
            const m1 = planeCellMinterm(row, col, 1)
            if (!selectedCells.has(m0) && !selectedCells.has(m1)) return null
            if (selectedCells.has(m0) && selectedCells.has(m1)) {
              return (
                <line
                  key={`cross-${row}-${col}`}
                  x1={LABEL_WIDTH + planeWidth}
                  y1={PLANE_LABEL_HEIGHT + HEADER_HEIGHT + row * cellSize + cellSize / 2}
                  x2={LABEL_WIDTH + planeWidth + PLANE_GAP}
                  y2={PLANE_LABEL_HEIGHT + HEADER_HEIGHT + row * cellSize + cellSize / 2}
                  stroke="var(--accent-primary)"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  className="pointer-events-none"
                />
              )
            }
            return null
          }),
        )}

        {/* E=1 plane */}
        {renderPlane(planeE1, 1, e1Vars, LABEL_WIDTH + planeWidth + PLANE_GAP)}
      </svg>
    </div>
  )
}