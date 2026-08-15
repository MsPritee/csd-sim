/**
 * MultiplicationRow - Shows the multiplication of each bit by its weight
 * Displays the calculation and contribution for each position
 */

import { FlowArrowIcon } from './FlowArrowIcon'

interface MultiplicationRowProps {
  readonly binaryValue: string
  readonly currentPhase: string
  readonly selectedColumn: number | null
  readonly onColumnHover: (index: number) => void
  readonly onColumnLeave: () => void
  readonly onColumnClick: (index: number) => void
}

export function MultiplicationRow({
  binaryValue,
  currentPhase,
  selectedColumn,
  onColumnHover,
  onColumnLeave,
  onColumnClick,
}: MultiplicationRowProps) {
  const bits = binaryValue.split('')
  const isVisible = currentPhase === 'multiply' || 
                   currentPhase === 'add' || 
                   currentPhase === 'result'

  if (!isVisible) return null

  // Determine cell size based on binary length
  const cellSize = bits.length > 8 ? 'compact' : bits.length > 5 ? 'auto' : 'large'
  const cellWidth = cellSize === 'compact' ? '2.5rem' : cellSize === 'large' ? '3.5rem' : '3rem'
  const cellMaxWidth = cellSize === 'compact' ? '3rem' : cellSize === 'large' ? '4.5rem' : '4rem'

  return (
    <div className="space-y-2 pt-2 animate-fade-in-up">
      {/* Arrow from previous row */}
      <FlowArrowIcon size={20} />
      
      <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
        Multiply (Bit × Weight)
      </div>
      <div className="flex gap-2">
        {bits.map((bit, index) => {
          const position = bits.length - 1 - index
          const isSelected = selectedColumn === index
          const weight = Math.pow(2, position)
          const contribution = bit === '1' ? weight : 0
          const isIncluded = bit === '1'

          return (
            <div
              key={index}
              className="relative"
              onMouseEnter={() => onColumnHover(index)}
              onMouseLeave={onColumnLeave}
              onClick={() => onColumnClick(index)}
            >
              <div
                className="h-14 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all-smooth border-2 p-1"
                style={{
                  backgroundColor: isSelected ? 'var(--accent-primary)' : 
                                   isIncluded ? 'var(--success-bg)' : 'var(--bg-secondary)',
                  borderColor: isSelected ? 'var(--accent-primary)' : isIncluded ? '#059669' : '#dc2626',
                  minWidth: cellWidth,
                  maxWidth: cellMaxWidth,
                }}
                role="button"
                tabIndex={0}
                aria-label={`${bit} times ${weight} equals ${contribution}`}
              >
                <div className="text-xs font-mono font-bold" style={{ color: isSelected ? 'white' : 'var(--text-secondary)' }}>
                  {bit}×{weight}
                </div>
                <div className="text-sm font-bold font-mono" style={{ color: isSelected ? 'white' : isIncluded ? 'var(--success-text)' : 'var(--text-secondary)' }}>
                  {contribution}
                </div>
                <div className="text-lg">
                  {isIncluded ? '✓' : '✗'}
                </div>
              </div>
              {isSelected && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap p-1 rounded font-bold animate-fade-in"
                     style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                  {isIncluded ? 'INCLUDED' : 'SKIPPED'}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {currentPhase === 'multiply' && (
        <div className="text-sm mt-2 p-3 rounded-lg animate-fade-in" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
          When the bit is 1, the position is <strong>included</strong> (✓). When 0, it is <strong>skipped</strong> (✗).
        </div>
      )}
    </div>
  )
}
