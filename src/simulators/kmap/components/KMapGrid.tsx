import type { KMapModel } from '../../../core/kmap'
import { adjacentMinterms } from '../../../core/kmap'
import { KMAP_HIGHLIGHT_COLORS } from './kmapHighlight'

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
  /** minterm -> highlight color index (rendered as a translucent overlay). */
  highlightMap?: ReadonlyMap<number, number>
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
  highlightMap,
  showAdjacency = false,
}: KMapGridProps) {
  const { layout, cells } = kmap
  const cellSize = 60
  const labelWidth = 40
  const headerHeight = 40

  const adjacencySet =
    showAdjacency && hoveredCell !== null
      ? new Set(adjacentMinterms(kmap, hoveredCell))
      : null

  const width = layout.cols * cellSize + labelWidth
  const height = layout.rows * cellSize + headerHeight

  return (
    <div className="overflow-x-auto">
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
            y={headerHeight - 10}
            textAnchor="middle"
            className="fill-slate-400 text-sm font-mono"
          >
            {label}
          </text>
        ))}

        {/* Row Labels */}
        {layout.rowLabels.map((label, i) => (
          <text
            key={`row-${i}`}
            x={labelWidth - 10}
            y={headerHeight + i * cellSize + cellSize / 2 + 4}
            textAnchor="end"
            className="fill-slate-400 text-sm font-mono"
          >
            {label}
          </text>
        ))}

        {/* Variable Labels */}
        <text
          x={labelWidth + layout.cols * cellSize / 2}
          y={20}
          textAnchor="middle"
          className="fill-violet-400 text-xs font-semibold"
        >
          {layout.colVariables.join('')}
        </text>
        <text
          x={15}
          y={headerHeight + layout.rows * cellSize / 2}
          textAnchor="middle"
          className="fill-violet-400 text-xs font-semibold"
          transform={`rotate(-90, 15, ${headerHeight + layout.rows * cellSize / 2})`}
        >
          {layout.rowVariables.join('')}
        </text>

        {/* Cells */}
        {cells.flatMap((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <g key={`${rowIndex}-${colIndex}`}>
              <rect
                x={labelWidth + colIndex * cellSize}
                y={headerHeight + rowIndex * cellSize}
                width={cellSize}
                height={cellSize}
                className={`fill-slate-800 stroke-slate-600 cursor-pointer transition-colors ${
                  selectedCells.has(cell.minterm) ? 'stroke-violet-400 stroke-2' : ''
                } ${
                  hoveredCell === cell.minterm ? 'stroke-violet-300 stroke-2' : ''
                }`}
                onClick={() => onCellClick(cell.minterm)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  onCellInfo(cell.minterm)
                }}
                onMouseDown={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    e.preventDefault()
                    onCellSelect(cell.minterm)
                  }
                }}
                onMouseEnter={() => onCellHover(cell.minterm)}
                onMouseLeave={() => onCellHover(null)}
              />
              {highlightMap?.has(cell.minterm) && (
                <rect
                  x={labelWidth + colIndex * cellSize}
                  y={headerHeight + rowIndex * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill={KMAP_HIGHLIGHT_COLORS[highlightMap.get(cell.minterm)! % KMAP_HIGHLIGHT_COLORS.length]}
                  className="pointer-events-none mix-blend-screen"
                />
              )}
              {adjacencySet?.has(cell.minterm) && (
                <rect
                  x={labelWidth + colIndex * cellSize + 3}
                  y={headerHeight + rowIndex * cellSize + 3}
                  width={cellSize - 6}
                  height={cellSize - 6}
                  fill="none"
                  stroke="#c4b5fd"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  className="pointer-events-none"
                />
              )}
              <text
                x={labelWidth + colIndex * cellSize + cellSize / 2}
                y={headerHeight + rowIndex * cellSize + cellSize / 2 + 4}
                textAnchor="middle"
                className={`fill-current pointer-events-none ${
                  cell.value === 1
                    ? 'fill-green-400 font-bold'
                    : cell.value === 0
                    ? 'fill-red-400 font-bold'
                    : cell.value === 'X'
                    ? 'fill-yellow-400 font-bold'
                    : 'fill-slate-400'
                }`}
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
                  className="fill-slate-600 text-[9px] font-mono pointer-events-none"
                >
                  {cell.minterm}
                </text>
              )}
            </g>
          )),
        )}
      </svg>
    </div>
  )
}
