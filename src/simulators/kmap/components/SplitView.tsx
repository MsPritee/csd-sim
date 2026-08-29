import { useState, useRef, useEffect, useCallback } from 'react'
import KMapGrid from './KMapGrid'
import TruthTablePanel from './TruthTablePanel'
import CellInfoPopup from './CellInfoPopup'
import type { KMapModel } from '../../../core/kmap'

interface SplitViewProps {
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
  cellInfoPinned: number | null
  setCellInfoPinned: (minterm: number | null) => void
}

export default function SplitView({
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
  cellInfoPinned,
  setCellInfoPinned,
}: SplitViewProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [leftPanelWidth, setLeftPanelWidth] = useState(50) // percentage
  const [showMiniTruthTable, setShowMiniTruthTable] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const resizeHandleRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

    // Constrain between 30% and 70%
    const constrainedWidth = Math.max(30, Math.min(70, newLeftWidth))
    setLeftPanelWidth(constrainedWidth)
  }, [isResizing])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  const bg = {
    card: { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' },
    heading: { color: 'var(--accent-primary)' },
    muted: { color: 'var(--text-secondary)' },
  }

  return (
    <div ref={containerRef} className="relative rounded-lg p-2 sm:p-3 md:p-4" style={bg.card}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg sm:text-xl font-semibold" style={bg.heading}>Split View</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMiniTruthTable(!showMiniTruthTable)}
            className="px-2 py-1 rounded text-xs sm:text-sm transition-all"
            style={{
              backgroundColor: showMiniTruthTable ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: showMiniTruthTable ? '#fff' : 'var(--text-primary)',
            }}
          >
            {showMiniTruthTable ? 'Hide Mini Truth Table' : 'Show Mini Truth Table'}
          </button>
        </div>
      </div>

      <div className="relative flex" style={{ minHeight: '400px' }}>
        {/* Left Panel - K-Map */}
        <div
          className="overflow-hidden"
          style={{ width: `${leftPanelWidth}%`, minWidth: '30%' }}
        >
          <div className="h-full overflow-auto">
            <KMapGrid
              kmap={kmap}
              onCellClick={onCellClick}
              onCellSelect={onCellSelect}
              onCellInfo={onCellInfo}
              selectedCells={selectedCells}
              hoveredCell={hoveredCell}
              onCellHover={onCellHover}
              showMintermNumbers={showMintermNumbers}
              showSOP={showSOP}
              groupOverlays={groupOverlays}
              showAdjacency={showAdjacency}
            />
            {(cellInfoPinned !== null || hoveredCell !== null) && (
              <CellInfoPopup
                kmap={kmap}
                minterm={hoveredCell ?? cellInfoPinned!}
                showSOP={showSOP}
                onClose={() => setCellInfoPinned(null)}
              />
            )}
          </div>
        </div>

        {/* Resize Handle */}
        <div
          ref={resizeHandleRef}
          onMouseDown={handleMouseDown}
          onKeyDown={(e) => {
            const step = 5
            switch (e.key) {
              case 'ArrowLeft':
                e.preventDefault()
                setLeftPanelWidth(Math.max(30, leftPanelWidth - step))
                break
              case 'ArrowRight':
                e.preventDefault()
                setLeftPanelWidth(Math.min(70, leftPanelWidth + step))
                break
              case 'Escape':
                e.preventDefault()
                setIsResizing(false)
                break
            }
          }}
          tabIndex={0}
          className="absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-accent-primary transition-colors z-10"
          style={{
            left: `${leftPanelWidth}%`,
            transform: 'translateX(-50%)',
            backgroundColor: isResizing ? 'var(--accent-primary)' : 'var(--border-color)',
          }}
          role="separator"
          aria-orientation="vertical"
          aria-label={`Resize panels. Left panel ${Math.round(leftPanelWidth)}%, right panel ${Math.round(100 - leftPanelWidth)}%. Use arrow keys to adjust size.`}
          aria-valuenow={leftPanelWidth}
          aria-valuemin={30}
          aria-valuemax={70}
        />

        {/* Right Panel - Truth Table */}
        <div
          className="overflow-hidden"
          style={{ width: `${100 - leftPanelWidth}%`, minWidth: '30%' }}
        >
          <div className="h-full overflow-auto">
            <TruthTablePanel
              kmap={kmap}
              showSOP={showSOP}
              highlightedCell={hoveredCell ?? cellInfoPinned}
              onSelectCell={(minterm) => onCellHover(minterm)}
            />
          </div>
        </div>

        {/* Mini Truth Table Overlay */}
        {showMiniTruthTable && (
          <div
            className="absolute bottom-4 right-4 rounded-lg border elevation-tertiary p-3 max-w-xs"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              maxHeight: '200px',
              overflow: 'auto',
            }}
          >
            <h3 className="text-xs font-semibold mb-2" style={bg.heading}>Mini Truth Table</h3>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{ color: 'var(--text-secondary)' }} className="text-left">
                  {kmap.layout.variables.map((v) => (
                    <th key={v} className="px-1 py-0.5 border font-medium" style={{ borderColor: 'var(--border-color)' }}>
                      {v}
                    </th>
                  ))}
                  <th className="px-1 py-0.5 border font-medium" style={{ borderColor: 'var(--border-color)' }}>F</th>
                </tr>
              </thead>
              <tbody>
                {kmap.cells.flatMap((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isActive = (hoveredCell ?? cellInfoPinned) === cell.minterm
                    const bits = cell.minterm.toString(2).padStart(kmap.layout.variables.length, '0')
                    return (
                      <tr
                        key={`${rowIndex}-${colIndex}`}
                        className="transition-colors cursor-pointer"
                        style={{
                          backgroundColor: isActive ? 'var(--accent-bg)' : 'transparent',
                        }}
                        onClick={() => onCellHover(cell.minterm)}
                      >
                        {Array.from(bits).map((bit, i) => (
                          <td key={i} className="px-1 py-0.5 border font-mono" style={{ borderColor: 'var(--border-color)' }}>
                            {bit}
                          </td>
                        ))}
                        <td
                          className="px-1 py-0.5 border font-mono font-bold"
                          style={{
                            borderColor: 'var(--border-color)',
                            color:
                              cell.value === 1
                                ? 'var(--cell-1)'
                                : cell.value === 0
                                  ? 'var(--cell-0)'
                                  : cell.value === 'X'
                                    ? 'var(--cell-x)'
                                    : 'var(--cell-empty)',
                          }}
                        >
                          {cell.value === null ? '—' : cell.value}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs sm:text-sm mt-2" style={bg.muted}>
        Drag the divider to resize panels. Hovering cells in either view highlights the corresponding cell/row in both views.
      </p>
    </div>
  )
}
