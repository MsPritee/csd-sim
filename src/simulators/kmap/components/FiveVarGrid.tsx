import { useLayoutEffect, useRef, useState, useCallback, useMemo } from 'react'
import type { KMapModel, CellValue } from '../../../core/kmap'
import {
  adjacentMinterms,
  mintermToCell,
  cellToMinterm,
  valueAt,
  buildAssignment,
  createKMap,
  translateMinterm,
} from '../../../core/kmap'
import { KMAP_GROUP_COLORS, contiguousRuns } from './kmapHighlight'
import { toGrayCode, grayString } from '../../../core/kmap/gray'

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
  /** Minterm shown in the cell (plane-first numbering: plane variable = MSB). */
  displayMinterm: number
  /** Model-space minterm for this cell (canonical variable ordering). */
  baseMinterm: number
  value: CellValue
  row: number
  col: number
}

/**
 * Describes how a 5-variable mapping is shown as two virtual planes. Everything
 * is derived from the model's axis assignment: the plane variable, the row and
 * column variables, the cell→minterm mapping (`cellToMinterm`) and the
 * minterm→position lookup (`mintermToCell`). The display always uses a
 * plane-first numbering — whichever variable holds the plane axis becomes the
 * MSB, so plane 0 shows 0..15 and plane 1 shows 16..31 — while `toBase`/
 * `toDisplay` translate between that view and the model's canonical numbering.
 * No E-bit is ever hard-coded, so the same rendering works for any plane
 * variable and any row/column split.
 */
interface PlaneLayout {
  planeVar: string
  rowVars: readonly string[]
  colVars: readonly string[]
  rowCount: number
  colCount: number
  /** Minterm displayed at (row, col, plane) in the plane-first numbering. */
  cellMinterm: (row: number, col: number, plane: 0 | 1) => number
  /** Grid position of a displayed minterm (plane-first numbering). */
  posOf: (minterm: number) => { plane: 0 | 1; row: number; col: number }
  /** Convert a display (plane-first) minterm to the model's canonical space. */
  toBase: (minterm: number) => number
  /** Convert a model minterm to the display (plane-first) space. */
  toDisplay: (minterm: number) => number
}

/**
 * Builds a light-weight plane model for the grid, always in plane-first
 * variable order (the plane variable is placed first = MSB). For flat layouts
 * (planes === 1, e.g. the legacy default whose E is folded into the column
 * axis) the last column-axis variable becomes the virtual plane variable. The
 * canonical model is left untouched — all cell values/events still live in the
 * model's own numbering and are translated only at the display boundary.
 */
function derivePlaneFirstModel(kmap: KMapModel): KMapModel {
  const { variables, rowVariables, colVariables, planeVariables } = kmap.layout
  const hasPlane = kmap.layout.planes > 1
  const planeVar = hasPlane
    ? planeVariables[0]!
    : colVariables[colVariables.length - 1]!
  const colVars = hasPlane ? [...colVariables] : colVariables.slice(0, -1)
  const displayVars = [planeVar, ...variables.filter((v) => v !== planeVar)]
  return createKMap(displayVars, buildAssignment([planeVar], [...rowVariables], colVars))
}

function usePlaneLayout(kmap: KMapModel): PlaneLayout {
  return useMemo(() => {
    const variables = kmap.layout.variables
    const renderModel = variables.length === 5 ? derivePlaneFirstModel(kmap) : kmap
    const rowVars = renderModel.layout.rowVariables
    const colVars = renderModel.layout.colVariables
    const displayVars = renderModel.layout.variables

    return {
      planeVar: renderModel.layout.planeVariables[0] ?? 'E',
      rowVars,
      colVars,
      rowCount: 2 ** rowVars.length,
      colCount: 2 ** colVars.length,
      cellMinterm: (row, col, plane) => cellToMinterm(renderModel, row, col, plane),
      posOf: (minterm) => {
        const { row, col, plane } = mintermToCell(renderModel, minterm)
        return { plane: (plane ?? 0) as 0 | 1, row, col }
      },
      toBase: (minterm) => translateMinterm(minterm, displayVars, variables),
      toDisplay: (minterm) => translateMinterm(minterm, variables, displayVars),
    }
  }, [kmap])
}

function buildPlaneCells(
  kmap: KMapModel,
  layout: PlaneLayout,
  plane: 0 | 1,
): PlaneCell[][] {
  const grid: PlaneCell[][] = Array.from({ length: layout.rowCount }, () =>
    Array.from({ length: layout.colCount }, () => ({
      displayMinterm: 0,
      baseMinterm: 0,
      value: null as CellValue,
      row: 0,
      col: 0,
    })),
  )

  for (let row = 0; row < layout.rowCount; row++) {
    for (let col = 0; col < layout.colCount; col++) {
      const displayMinterm = layout.cellMinterm(row, col, plane)
      const baseMinterm = layout.toBase(displayMinterm)
      grid[row]![col] = {
        displayMinterm,
        baseMinterm,
        value: valueAt(kmap, baseMinterm),
        row,
        col,
      }
    }
  }

  return grid
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
  const layout = usePlaneLayout(kmap)

  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const fitCell = (clientWidth: number) => {
      const totalCols = layout.colCount * 2
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
  }, [layout.colCount])

  const plane0 = useMemo(() => buildPlaneCells(kmap, layout, 0), [kmap, layout])
  const plane1 = useMemo(() => buildPlaneCells(kmap, layout, 1), [kmap, layout])

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

  const labelBits = Math.round(Math.log2(layout.colCount)) || 1

  const renderPlane = (
    grid: PlaneCell[][],
    plane: 0 | 1,
    layout: PlaneLayout,
    offsetX: number,
  ) => {
    const colLabels = Array.from({ length: layout.colCount }, (_, i) =>
      grayString(toGrayCode(i), labelBits),
    )
    const rowLabels = Array.from({ length: layout.rowCount }, (_, i) =>
      grayString(toGrayCode(i), labelBits),
    )
    const colHeaderX = offsetX + layout.colCount * cellSize / 2
    const rowHeaderY = PLANE_LABEL_HEIGHT + HEADER_HEIGHT + layout.rowCount * cellSize / 2

    return (
      <g>
        {/* Plane label */}
        <text
          x={colHeaderX}
          y={PLANE_LABEL_HEIGHT - 4}
          textAnchor="middle"
          className="text-xs font-semibold"
          style={{ fill: 'var(--accent-primary)' }}
        >
          {layout.planeVar} = {plane}
        </text>

        {/* Column labels */}
        {colLabels.map((label, i) => (
          <text
            key={`col-${plane}-${i}`}
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
            key={`row-${plane}-${i}`}
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
          x={colHeaderX}
          y={PLANE_LABEL_HEIGHT + 14}
          textAnchor="middle"
          className="text-[10px] font-semibold"
          style={{ fill: 'var(--accent-secondary, var(--accent-primary))' }}
        >
          {layout.colVars.join('')}
        </text>
        <text
          x={offsetX - 20}
          y={rowHeaderY}
          textAnchor="middle"
          className="text-[10px] font-semibold"
          style={{ fill: 'var(--accent-secondary, var(--accent-primary))' }}
          transform={`rotate(-90, ${offsetX - 20}, ${rowHeaderY})`}
        >
          {layout.rowVars.join('')}
        </text>

        {/* Cells */}
        {grid.flatMap((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <g key={`${plane}-${rowIndex}-${colIndex}`}>
              <title>Cell m{cell.displayMinterm}: Value {cell.value === null ? 'empty' : cell.value}. Click to set value, right-click for info, Ctrl+click to select.</title>
              <rect
                data-testid={`kmap-cell-${cell.displayMinterm}`}
                x={offsetX + colIndex * cellSize}
                y={PLANE_LABEL_HEIGHT + HEADER_HEIGHT + rowIndex * cellSize}
                width={cellSize}
                height={cellSize}
                className={`cursor-pointer kmap-cell ${
                  selectedCells.has(cell.baseMinterm) ? 'stroke-2 kmap-cell-selected' : ''
                } ${
                  hoveredCell === cell.baseMinterm ? 'stroke-2' : ''
                }`}
                style={{
                  fill: 'var(--bg-tertiary)',
                  stroke: selectedCells.has(cell.baseMinterm) || hoveredCell === cell.baseMinterm
                    ? 'var(--accent-primary)'
                    : 'var(--border-light)',
                }}
                onClick={() => handleCellClick(cell.baseMinterm)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  onCellInfo(cell.baseMinterm)
                }}
                onMouseDown={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    e.preventDefault()
                    handleCellSelect(cell.baseMinterm)
                  }
                }}
                onMouseEnter={() => onCellHover(cell.baseMinterm)}
                onMouseLeave={() => onCellHover(null)}
              />
              {adjacencySet?.has(cell.baseMinterm) && (
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
                  ? (showSOP ? `m${cell.displayMinterm}` : `M${cell.displayMinterm}`)
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
                  {cell.displayMinterm}
                </text>
              )}
            </g>
          )),
        )}

        {/* Group overlay rectangles — unified bounding rect per group per plane (rendered AFTER cells so they appear on top) */}
        {groupOverlays?.map((group, gi) => {
          // Overlay minterms live in the model's canonical space; translate them
          // into the plane-first view before locating them on the grid.
          const planeMinterms = group.minterms.filter((m) => {
            return layout.posOf(layout.toDisplay(m)).plane === plane
          })
          if (planeMinterms.length === 0) return null

          const color = KMAP_GROUP_COLORS[group.colorIndex % KMAP_GROUP_COLORS.length]
          const pad = 2

          const positions = planeMinterms.map((m) => layout.posOf(layout.toDisplay(m)))
          const rows = new Set(positions.map((p) => p.row))
          const cols = new Set(positions.map((p) => p.col))

          // Flatten each axis into contiguous runs so every component of the
          // group (including wrap-around pieces split at a seam) is drawn as
          // one solid rectangle — same style as a regular one-piece group.
          const rowRuns = contiguousRuns(Array.from(rows).sort((a, b) => a - b))
          const colRuns = contiguousRuns(Array.from(cols).sort((a, b) => a - b))

          return (
            <g key={`group-${plane}-${gi}`} className="pointer-events-none">
              {rowRuns.flatMap((rowRun, ri) =>
                colRuns.map((colRun, ci) => {
                  const minRow = rowRun[0]!
                  const minCol = colRun[0]!
                  const x = offsetX + minCol * cellSize - pad
                  const y = PLANE_LABEL_HEIGHT + HEADER_HEIGHT + minRow * cellSize - pad
                  const w = colRun.length * cellSize + pad * 2
                  const h = rowRun.length * cellSize + pad * 2
                  return (
                    <g key={`gb-${plane}-${gi}-${ri}-${ci}`}>
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

  const planeWidth = layout.colCount * cellSize
  const totalWidth = LABEL_WIDTH + planeWidth + PLANE_GAP + planeWidth + LABEL_WIDTH + CANVAS_PAD
  const totalHeight = PLANE_LABEL_HEIGHT + HEADER_HEIGHT + layout.rowCount * cellSize + CANVAS_PAD

  return (
    <div ref={wrapRef} className="overflow-x-auto">
      <svg
        width={totalWidth}
        height={totalHeight}
        className="mx-auto"
      >
        {/* plane = 0 */}
        {renderPlane(plane0, 0, layout, LABEL_WIDTH)}

        {/* Cross-plane adjacency lines */}
        {Array.from({ length: layout.rowCount }, (_, row) =>
          Array.from({ length: layout.colCount }, (_, col) => {
            const b0 = layout.toBase(layout.cellMinterm(row, col, 0))
            const b1 = layout.toBase(layout.cellMinterm(row, col, 1))
            if (!selectedCells.has(b0) && !selectedCells.has(b1)) return null
            if (selectedCells.has(b0) && selectedCells.has(b1)) {
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

        {/* plane = 1 */}
        {renderPlane(plane1, 1, layout, LABEL_WIDTH + planeWidth + PLANE_GAP)}
      </svg>
    </div>
  )
}