/**
 * ContributionRow - Shows the final contribution from each bit position
 * Leads to the addition step where contributions are summed
 */

import { FlowArrowIcon } from './FlowArrowIcon'

interface ContributionRowProps {
  readonly binaryValue: string
  readonly currentPhase: string
  readonly selectedColumn: number | null
  readonly onColumnHover: (index: number) => void
  readonly onColumnLeave: () => void
  readonly onColumnClick: (index: number) => void
}

export function ContributionRow({
  binaryValue,
  currentPhase,
  selectedColumn,
  onColumnHover,
  onColumnLeave,
  onColumnClick,
}: ContributionRowProps) {
  const bits = binaryValue.split('')
  const isVisible = currentPhase === 'add' || 
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
        Add All (Decimal Value)
      </div>
      <div className="flex gap-2 items-center">
        {bits.map((bit, index) => {
          const position = bits.length - 1 - index
          const isSelected = selectedColumn === index
          const weight = Math.pow(2, position)
          const contribution = bit === '1' ? weight : 0
          const isIncluded = bit === '1'

          return (
            <div key={index} className="flex items-center">
              <div
                className="h-14 flex items-center justify-center rounded-lg font-mono font-bold text-xl cursor-pointer transition-all-smooth border-2"
                onMouseEnter={() => onColumnHover(index)}
                onMouseLeave={onColumnLeave}
                onClick={() => onColumnClick(index)}
                style={{
                  backgroundColor: isSelected ? 'var(--accent-primary)' : 
                                   isIncluded ? 'var(--success-bg)' : 'var(--bg-secondary)',
                  color: isSelected ? 'white' : 
                          isIncluded ? 'var(--success-text)' : 'var(--text-secondary)',
                  borderColor: isSelected ? 'var(--accent-primary)' : isIncluded ? '#059669' : '#dc2626',
                  opacity: isIncluded ? 1 : 0.5,
                  minWidth: cellWidth,
                  maxWidth: cellMaxWidth,
                }}
                role="button"
                tabIndex={0}
                aria-label={`Contribution ${contribution}`}
              >
                {contribution}
              </div>
              {/* Plus sign between contributions (except after last one) */}
              {index < bits.length - 1 && (
                <span className="text-2xl font-bold mx-1" style={{ color: 'var(--text-secondary)' }}>+</span>
              )}
            </div>
          )
        })}
      </div>
      {/* Addition expression */}
      <div className="text-center p-3 rounded-lg mt-2 animate-fade-in" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <div className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
          {bits.map((bit, index) => {
            const position = bits.length - 1 - index
            const weight = Math.pow(2, position)
            const contribution = bit === '1' ? weight : 0
            return contribution
          }).join(' + ')} = <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>{bits.reduce((sum, bit, index) => {
            const position = bits.length - 1 - index
            const weight = Math.pow(2, position)
            return sum + (bit === '1' ? weight : 0)
          }, 0)}</span>
        </div>
      </div>
      {currentPhase === 'add' && (
        <div className="text-sm mt-2 p-3 rounded-lg animate-fade-in" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
          Add all the contributions to get the final decimal value.
        </div>
      )}
    </div>
  )
}
