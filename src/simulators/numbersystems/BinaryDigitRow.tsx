/**
 * BinaryDigitRow - Displays the binary digits as interactive tiles
 * Shows MSB/LSB labels and allows hover/click interactions
 */

import { ResponsiveDigitCell } from './ResponsiveDigitCell'

interface BinaryDigitRowProps {
  readonly binaryValue: string
  readonly currentPhase: string
  readonly selectedColumn: number | null
  readonly onColumnHover: (index: number) => void
  readonly onColumnLeave: () => void
  readonly onColumnClick: (index: number) => void
}

export function BinaryDigitRow({
  binaryValue,
  currentPhase,
  selectedColumn,
  onColumnHover,
  onColumnLeave,
  onColumnClick,
}: BinaryDigitRowProps) {
  const bits = binaryValue.split('')
  const isVisible = currentPhase === 'identify' || 
                   currentPhase === 'powers' || 
                   currentPhase === 'weights' || 
                   currentPhase === 'multiply' || 
                   currentPhase === 'add' || 
                   currentPhase === 'result'

  if (!isVisible) return null

  // Determine cell size based on binary length
  const cellSize = bits.length > 8 ? 'compact' : bits.length > 5 ? 'auto' : 'large'

  return (
    <div className="space-y-2 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
          Binary Digits
        </div>
        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          MSB → ← LSB
        </div>
      </div>
      <div className="flex gap-2 items-center">
        {bits.map((bit, index) => {
          const isSelected = selectedColumn === index
          const isMSB = index === 0
          const isLSB = index === bits.length - 1
          const isIncluded = bit === '1'

          return (
            <div
              key={index}
              className="relative"
              onMouseEnter={() => onColumnHover(index)}
              onMouseLeave={onColumnLeave}
              onClick={() => onColumnClick(index)}
            >
              <ResponsiveDigitCell
                content={bit}
                isSelected={isSelected}
                isIncluded={isIncluded}
                size={cellSize}
                backgroundColor={isIncluded ? '#10b981' : '#ef4444'}
                color="white"
                borderColor={isSelected ? 'var(--accent-primary)' : isIncluded ? '#059669' : '#dc2626'}
                ariaLabel={`Bit ${bit} at position ${bits.length - 1 - index}`}
                fontSize="text-2xl"
              />
              {isMSB && (
                <div className="text-xs text-center mt-1 font-bold" style={{ color: 'var(--accent-primary)' }}>
                  MSB
                </div>
              )}
              {isLSB && (
                <div className="text-xs text-center mt-1 font-bold" style={{ color: 'var(--accent-primary)' }}>
                  LSB
                </div>
              )}
            </div>
          )
        })}
      </div>
      {currentPhase === 'identify' && (
        <div className="text-sm mt-2 p-3 rounded-lg animate-fade-in" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
          <strong>MSB</strong> = Most Significant Bit (leftmost position, highest power)<br />
          <strong>LSB</strong> = Least Significant Bit (rightmost position, 2⁰)
        </div>
      )}
    </div>
  )
}
