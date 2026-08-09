import type { KMapModel } from '../../../core/kmap'

interface KMapGridProps {
  kmap: KMapModel
  onCellClick: (minterm: number) => void
  onCellSelect: (minterm: number) => void
  selectedCells: Set<number>
  hoveredCell: number | null
  onCellHover: (minterm: number | null) => void
  showMintermNumbers: boolean
}

export default function KMapGrid({
  kmap,
  onCellClick,
  onCellSelect,
  selectedCells,
  hoveredCell,
  onCellHover,
  showMintermNumbers,
}: KMapGridProps) {
  const { layout, cells } = kmap
  const cellSize = 60
  const labelWidth = 40
  const headerHeight = 40

  const width = layout.cols * cellSize + labelWidth
  const height = layout.rows * cellSize + headerHeight

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="mx-auto">
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
                onMouseDown={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    e.preventDefault()
                    onCellSelect(cell.minterm)
                  }
                }}
                onMouseEnter={() => onCellHover(cell.minterm)}
                onMouseLeave={() => onCellHover(null)}
              />
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
                    : 'fill-slate-500'
                }`}
              >
                {cell.value === null ? (showMintermNumbers ? cell.minterm : '') : cell.value}
              </text>
            </g>
          )),
        )}
      </svg>
    </div>
  )
}
