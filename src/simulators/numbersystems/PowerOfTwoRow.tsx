/**
 * PowerOfTwoRow - Displays the powers of 2 for each bit position
 * Shows the relationship between bit position and power of 2
 */

import { FlowArrowIcon } from './FlowArrowIcon'

interface PowerOfTwoRowProps {
  readonly binaryValue: string
  readonly currentPhase: string
  readonly selectedColumn: number | null
  readonly onColumnHover: (index: number) => void
  readonly onColumnLeave: () => void
  readonly onColumnClick: (index: number) => void
}

export function PowerOfTwoRow({
  binaryValue,
  currentPhase,
  selectedColumn,
  onColumnHover,
  onColumnLeave,
  onColumnClick,
}: PowerOfTwoRowProps) {
  const bits = binaryValue.split('')
  const isVisible = currentPhase === 'powers' || 
                   currentPhase === 'weights' || 
                   currentPhase === 'multiply' || 
                   currentPhase === 'add' || 
                   currentPhase === 'result'

  if (!isVisible) return null

  // Determine cell size based on binary length
  const cellSize = bits.length > 8 ? 'compact' : bits.length > 5 ? 'auto' : 'large'

  return (
    <div className="space-y-2 pt-2 animate-fade-in-up">
      {/* Arrow from previous row */}
      <FlowArrowIcon size={20} />
      
      <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
        Place Values (Powers of 2)
      </div>
      <div className="flex gap-2">
        {bits.map((_bit, index) => {
          const position = bits.length - 1 - index
          const isSelected = selectedColumn === index
          const exponent = position
          const decimalValue = Math.pow(2, position)

          return (
            <div
              key={index}
              className="h-14 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all-smooth border-2"
              onMouseEnter={() => onColumnHover(index)}
              onMouseLeave={onColumnLeave}
              onClick={() => onColumnClick(index)}
              style={{
                backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: isSelected ? 'white' : 'var(--accent-primary)',
                borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-color)',
                minWidth: cellSize === 'compact' ? '2.5rem' : cellSize === 'large' ? '3.5rem' : '3rem',
                maxWidth: cellSize === 'compact' ? '3rem' : cellSize === 'large' ? '4.5rem' : '4rem',
              }}
              role="button"
              tabIndex={0}
              aria-label={`2 to the power of ${exponent}`}
            >
              <div className="text-sm font-mono font-bold">
                2<sup>{exponent}</sup>
              </div>
              <div className="text-xs" style={{ color: isSelected ? 'white' : 'var(--text-secondary)' }}>
                ({decimalValue})
              </div>
            </div>
          )
        })}
      </div>
      {currentPhase === 'powers' && (
        <div className="text-sm mt-2 p-3 rounded-lg animate-fade-in" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
          Starting from the right, the exponent begins at 0 and increases by 1 as we move left.
        </div>
      )}
    </div>
  )
}
