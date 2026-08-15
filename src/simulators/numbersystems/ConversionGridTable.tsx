/**
 * ConversionGridTable - Unified column-aligned grid for binary-to-decimal conversion
 * Uses cumulative row reveal and column highlight animations
 */

import { useMemo } from 'react'
import {
  isRowVisible,
  getCellSize,
  CELL_WIDTH,
} from './visualizerUtils'

interface ConversionGridTableProps {
  readonly binaryValue: string
  readonly currentPhase: string
  readonly activeColumn: number | null
  readonly selectedColumn: number | null
  readonly finalResult: number
  readonly runningTotal: number
  readonly onColumnHover: (index: number) => void
  readonly onColumnLeave: () => void
  readonly onColumnClick: (index: number) => void
}

interface GridCellProps {
  readonly columnIndex: number
  readonly isHighlighted: boolean
  readonly isSelected: boolean
  readonly staggerDelay: number
  readonly onHover: () => void
  readonly onLeave: () => void
  readonly onClick: () => void
  readonly children: React.ReactNode
  readonly ariaLabel: string
  readonly style?: React.CSSProperties
}

function GridCell({
  columnIndex,
  isHighlighted,
  isSelected,
  staggerDelay,
  onHover,
  onLeave,
  onClick,
  children,
  ariaLabel,
  style = {},
}: GridCellProps) {
  return (
    <td
      className={`conversion-grid-cell p-1 relative ${
        isHighlighted ? 'conversion-grid-cell-active' : ''
      } ${isSelected ? 'conversion-grid-cell-selected' : ''}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      role="gridcell"
      aria-label={ariaLabel}
    >
      <div
        className="conversion-grid-cell-inner h-12 flex flex-col items-center justify-center rounded-lg border-2 cursor-pointer transition-all-smooth animate-grid-cell-enter"
        style={{ animationDelay: `${staggerDelay}ms`, ...style }}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
          }
        }}
      >
        {children}
      </div>
      {columnIndex >= 0 && <div className="conversion-grid-connector" aria-hidden="true" />}
    </td>
  )
}

function RowLabel({ children }: { readonly children: React.ReactNode }) {
  return (
    <th
      scope="row"
      className="conversion-grid-label text-xs font-semibold text-left pr-2 py-1 whitespace-nowrap align-middle"
      style={{ color: 'var(--text-primary)', minWidth: '7.5rem' }}
    >
      {children}
    </th>
  )
}

export function ConversionGridTable({
  binaryValue,
  currentPhase,
  activeColumn,
  selectedColumn,
  finalResult,
  runningTotal,
  onColumnHover,
  onColumnLeave,
  onColumnClick,
}: ConversionGridTableProps) {
  const bits = useMemo(() => binaryValue.split(''), [binaryValue])
  const cellSize = getCellSize(bits.length)
  const cellWidth = CELL_WIDTH[cellSize]

  const contributions = useMemo(
    () =>
      bits.map((bit, index) => {
        const position = bits.length - 1 - index
        const weight = Math.pow(2, position)
        return bit === '1' ? weight : 0
      }),
    [bits],
  )

  const showBits = isRowVisible('identify', currentPhase)
  const showPowers = isRowVisible('powers', currentPhase)
  const showWeights = isRowVisible('weights', currentPhase)
  const showMultiply = isRowVisible('multiply', currentPhase)
  const showAdd = isRowVisible('add', currentPhase)

  const isColumnActive = (index: number) =>
    activeColumn === index || selectedColumn === index

  return (
    <div
      className="conversion-grid-wrapper overflow-x-auto rounded-xl border-2 p-3 sm:p-4"
      style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
    >
      {/* MSB / LSB arrow */}
      <div className="flex items-center justify-center mb-3 gap-2 px-8">
        <span className="text-xs font-bold shrink-0" style={{ color: '#8b5cf6' }}>MSB</span>
        <svg
          className="msb-lsb-arrow flex-1"
          height="16"
          viewBox="0 0 200 16"
          fill="none"
          aria-hidden="true"
        >
          <line x1="10" y1="8" x2="190" y2="8" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4 3" />
          <polygon points="190,4 200,8 190,12" fill="#8b5cf6" />
        </svg>
        <span className="text-xs font-bold shrink-0" style={{ color: '#8b5cf6' }}>LSB</span>
      </div>

      <table className="conversion-grid w-full border-collapse" role="grid" aria-label="Binary to decimal conversion grid">
        <tbody>
          {showBits && (
            <tr className="conversion-grid-row animate-grid-row-enter" role="row">
              <RowLabel>Binary Digits</RowLabel>
              {bits.map((bit, index) => {
                const isIncluded = bit === '1'
                const highlighted = isColumnActive(index)
                return (
                  <GridCell
                    key={`bit-${index}`}
                    columnIndex={index}
                    isHighlighted={highlighted && activeColumn === index}
                    isSelected={highlighted && selectedColumn === index}
                    staggerDelay={index * 60}
                    onHover={() => onColumnHover(index)}
                    onLeave={onColumnLeave}
                    onClick={() => onColumnClick(index)}
                    ariaLabel={`Bit ${bit} at position ${bits.length - 1 - index}`}
                    style={{
                      backgroundColor: isIncluded ? '#10b981' : '#ef4444',
                      color: 'white',
                      borderColor: isIncluded ? '#059669' : '#dc2626',
                      minWidth: cellWidth,
                    }}
                  >
                    <span className="text-xl font-mono font-bold">{bit}</span>
                  </GridCell>
                )
              })}
            </tr>
          )}

          {showPowers && (
            <tr className="conversion-grid-row animate-grid-row-enter" role="row">
              <RowLabel>
                <span>Place Values</span>
                <span className="block text-[10px] font-normal" style={{ color: 'var(--text-secondary)' }}>
                  (Powers of 2)
                </span>
              </RowLabel>
              {bits.map((_bit, index) => {
                const position = bits.length - 1 - index
                const exponent = position
                const decimalValue = Math.pow(2, position)
                const highlighted = isColumnActive(index)
                return (
                  <GridCell
                    key={`power-${index}`}
                    columnIndex={index}
                    isHighlighted={highlighted && activeColumn === index}
                    isSelected={highlighted && selectedColumn === index}
                    staggerDelay={index * 60}
                    onHover={() => onColumnHover(index)}
                    onLeave={onColumnLeave}
                    onClick={() => onColumnClick(index)}
                    ariaLabel={`2 to the power of ${exponent}`}
                    style={{
                      backgroundColor: highlighted ? '#8b5cf6' : '#eff6ff',
                      color: highlighted ? 'white' : '#3b82f6',
                      borderColor: highlighted ? '#7c3aed' : '#bfdbfe',
                      minWidth: cellWidth,
                    }}
                  >
                    <span className="text-xs font-mono font-bold">
                      2<sup>{exponent}</sup>
                    </span>
                    <span className="text-[10px]" style={{ opacity: 0.8 }}>
                      ({decimalValue})
                    </span>
                  </GridCell>
                )
              })}
            </tr>
          )}

          {showWeights && (
            <tr className="conversion-grid-row animate-grid-row-enter" role="row">
              <RowLabel>
                <span>Decimal Weights</span>
                <span className="block text-[10px] font-normal" style={{ color: 'var(--text-secondary)' }}>
                  (Value of 2ⁿ)
                </span>
              </RowLabel>
              {bits.map((_bit, index) => {
                const position = bits.length - 1 - index
                const weight = Math.pow(2, position)
                const highlighted = isColumnActive(index)
                return (
                  <GridCell
                    key={`weight-${index}`}
                    columnIndex={index}
                    isHighlighted={highlighted && activeColumn === index}
                    isSelected={highlighted && selectedColumn === index}
                    staggerDelay={index * 60}
                    onHover={() => onColumnHover(index)}
                    onLeave={onColumnLeave}
                    onClick={() => onColumnClick(index)}
                    ariaLabel={`Decimal weight ${weight}`}
                    style={{
                      backgroundColor: highlighted ? '#8b5cf6' : 'var(--bg-secondary)',
                      color: highlighted ? 'white' : '#7c3aed',
                      borderColor: highlighted ? '#7c3aed' : 'var(--border-color)',
                      minWidth: cellWidth,
                    }}
                  >
                    <span className="text-base font-mono font-bold">{weight}</span>
                  </GridCell>
                )
              })}
            </tr>
          )}

          {showMultiply && (
            <tr className="conversion-grid-row animate-grid-row-enter" role="row">
              <RowLabel>
                <span>Multiply</span>
                <span className="block text-[10px] font-normal" style={{ color: 'var(--text-secondary)' }}>
                  (Bit × Weight)
                </span>
              </RowLabel>
              {bits.map((bit, index) => {
                const position = bits.length - 1 - index
                const weight = Math.pow(2, position)
                const contribution = bit === '1' ? weight : 0
                const isIncluded = bit === '1'
                const highlighted = isColumnActive(index)
                return (
                  <GridCell
                    key={`mult-${index}`}
                    columnIndex={index}
                    isHighlighted={highlighted && activeColumn === index}
                    isSelected={highlighted && selectedColumn === index}
                    staggerDelay={index * 60}
                    onHover={() => onColumnHover(index)}
                    onLeave={onColumnLeave}
                    onClick={() => onColumnClick(index)}
                    ariaLabel={`${bit} times ${weight} equals ${contribution}`}
                    style={{
                      backgroundColor: highlighted ? '#8b5cf6' : isIncluded ? '#ecfdf5' : '#fef2f2',
                      borderColor: highlighted ? '#7c3aed' : isIncluded ? '#10b981' : '#ef4444',
                      minWidth: cellWidth,
                    }}
                  >
                    <span className="text-[10px] font-mono font-bold" style={{ color: highlighted ? 'white' : 'var(--text-secondary)' }}>
                      {bit}×{weight}
                    </span>
                    <span className={`text-sm font-mono font-bold ${isIncluded ? 'animate-scale-in' : ''}`} style={{ color: highlighted ? 'white' : isIncluded ? '#059669' : 'var(--text-secondary)' }}>
                      {contribution}
                    </span>
                    <span className={`text-sm ${isIncluded ? 'animate-bounce-subtle' : ''}`} aria-hidden="true">
                      {isIncluded ? '✓' : '✗'}
                    </span>
                  </GridCell>
                )
              })}
            </tr>
          )}

          {showAdd && (
            <tr className="conversion-grid-row animate-grid-row-enter" role="row">
              <RowLabel>
                <span>Add All</span>
                <span className="block text-[10px] font-normal" style={{ color: 'var(--text-secondary)' }}>
                  (Decimal Value)
                </span>
              </RowLabel>
              {bits.map((bit, index) => {
                const position = bits.length - 1 - index
                const weight = Math.pow(2, position)
                const contribution = bit === '1' ? weight : 0
                const isIncluded = bit === '1'
                const highlighted = isColumnActive(index)
                return (
                  <GridCell
                    key={`add-${index}`}
                    columnIndex={index}
                    isHighlighted={highlighted && activeColumn === index}
                    isSelected={highlighted && selectedColumn === index}
                    staggerDelay={index * 60}
                    onHover={() => onColumnHover(index)}
                    onLeave={onColumnLeave}
                    onClick={() => onColumnClick(index)}
                    ariaLabel={`Contribution ${contribution}`}
                    style={{
                      backgroundColor: highlighted ? '#8b5cf6' : isIncluded ? '#ecfdf5' : 'var(--bg-secondary)',
                      color: highlighted ? 'white' : isIncluded ? '#059669' : 'var(--text-secondary)',
                      borderColor: highlighted ? '#7c3aed' : isIncluded ? '#10b981' : 'var(--border-color)',
                      opacity: isIncluded ? 1 : 0.5,
                      minWidth: cellWidth,
                    }}
                  >
                    <span className="text-base font-mono font-bold">{contribution}</span>
                  </GridCell>
                )
              })}
            </tr>
          )}
        </tbody>
      </table>

      {showAdd && (
        <div
          className="mt-3 p-3 rounded-lg text-center font-mono text-sm animate-grid-row-enter"
          style={{ backgroundColor: '#fefce8', color: 'var(--text-primary)' }}
        >
          {contributions.join(' + ')} ={' '}
          <span className="font-bold text-lg animate-number-count" style={{ color: '#ef4444' }}>
            {finalResult}
          </span>
        </div>
      )}

      {(showMultiply || showAdd) && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fade-in-up" role="status" aria-live="polite">
          <div className="p-2 rounded-lg border-2 text-center" style={{ backgroundColor: '#ecfdf5', borderColor: '#10b981' }}>
            <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#059669' }}>
              Current Total
            </div>
            <div className="text-2xl font-mono font-bold animate-number-count" style={{ color: '#059669' }}>
              {runningTotal}
            </div>
          </div>
          <div className="p-2 rounded-lg border text-sm font-mono" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
            <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Addition Process
            </div>
            {contributions.filter((c) => c > 0).join(' + ')} = {runningTotal}
          </div>
        </div>
      )}
    </div>
  )
}
