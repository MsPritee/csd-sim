/**
 * DecimalWeightRow - Displays the decimal weights for each power of 2
 * Shows the actual decimal value each position represents
 */

import { ResponsiveDigitCell } from './ResponsiveDigitCell'
import { FlowArrowIcon } from './FlowArrowIcon'

interface DecimalWeightRowProps {
  readonly binaryValue: string
  readonly currentPhase: string
  readonly selectedColumn: number | null
  readonly onColumnHover: (index: number) => void
  readonly onColumnLeave: () => void
  readonly onColumnClick: (index: number) => void
}

export function DecimalWeightRow({
  binaryValue,
  currentPhase,
  selectedColumn,
  onColumnHover,
  onColumnLeave,
  onColumnClick,
}: DecimalWeightRowProps) {
  const bits = binaryValue.split('')
  const isVisible = currentPhase === 'weights' || 
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
        Decimal Weights (Value of 2ⁿ)
      </div>
      <div className="flex gap-2">
        {bits.map((_bit, index) => {
          const position = bits.length - 1 - index
          const isSelected = selectedColumn === index
          const weight = Math.pow(2, position)

          return (
            <ResponsiveDigitCell
              key={index}
              content={weight}
              isSelected={isSelected}
              size={cellSize}
              backgroundColor={isSelected ? 'var(--accent-primary)' : 'var(--bg-secondary)'}
              color={isSelected ? 'white' : 'var(--text-primary)'}
              borderColor={isSelected ? 'var(--accent-primary)' : 'var(--border-color)'}
              onHover={() => onColumnHover(index)}
              onLeave={onColumnLeave}
              onClick={() => onColumnClick(index)}
              ariaLabel={`Decimal weight ${weight}`}
              fontSize="text-xl"
            />
          )
        })}
      </div>
      {currentPhase === 'weights' && (
        <div className="text-sm mt-2 p-3 rounded-lg animate-fade-in" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
          The decimal weight is the value this position contributes if the bit is 1.
        </div>
      )}
    </div>
  )
}
