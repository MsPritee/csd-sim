/**
 * RemainderIndicator - Visual indicator for remainders in the division process
 * Highlights remainders with educational animations
 */

interface RemainderIndicatorProps {
  readonly remainder: number
  readonly targetBase: 2 | 8 | 16
  readonly isCurrent: boolean
  readonly isCompleted: boolean
  readonly animate?: boolean
}

export function RemainderIndicator({
  remainder,
  targetBase,
  isCurrent,
  isCompleted,
  animate = true,
}: RemainderIndicatorProps) {
  const formatRemainder = (value: number) => {
    if (targetBase === 16 && value >= 10) {
      return value.toString(16).toUpperCase()
    }
    return value.toString()
  }

  const getIndicatorStyle = () => {
    if (isCurrent) {
      return {
        backgroundColor: 'var(--accent-primary)',
        color: 'white',
        transform: animate ? 'scale(1.1)' : 'scale(1)',
        boxShadow: '0 0 12px var(--accent-primary)',
      }
    }
    if (isCompleted) {
      return {
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        border: '2px solid var(--accent-primary)',
      }
    }
    return {
      backgroundColor: 'var(--bg-tertiary)',
      color: 'var(--text-secondary)',
    }
  }

  const style = getIndicatorStyle()

  return (
    <div
      className="flex items-center justify-center w-12 h-12 rounded-lg font-mono font-bold text-xl transition-all duration-300"
      style={style}
      aria-label={`Remainder: ${formatRemainder(remainder)}`}
    >
      {formatRemainder(remainder)}
    </div>
  )
}
