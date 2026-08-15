/**
 * ResponsiveDigitCell - Reusable digit cell component with auto-sizing
 * Handles responsive sizing based on binary length and includes hover/click animations
 */

interface ResponsiveDigitCellProps {
  readonly content: string | number
  readonly isSelected: boolean
  readonly isIncluded?: boolean
  readonly size?: 'auto' | 'compact' | 'large'
  readonly backgroundColor?: string
  readonly color?: string
  readonly borderColor?: string
  readonly onClick?: () => void
  readonly onHover?: () => void
  readonly onLeave?: () => void
  readonly ariaLabel?: string
  readonly fontSize?: 'text-xl' | 'text-2xl' | 'text-lg'
  readonly showAnimation?: boolean
}

export function ResponsiveDigitCell({
  content,
  isSelected,
  isIncluded = true,
  size = 'auto',
  backgroundColor,
  color,
  borderColor,
  onClick,
  onHover,
  onLeave,
  ariaLabel,
  fontSize = 'text-xl',
  showAnimation = true,
}: ResponsiveDigitCellProps) {
  const sizeClasses = {
    auto: 'digit-cell-auto',
    compact: 'digit-cell-compact',
    large: 'digit-cell-large',
  }

  const animationClass = showAnimation ? 'transition-all-smooth hover:animate-bounce-subtle' : ''

  const handleClick = () => {
    if (onClick) onClick()
  }

  const handleMouseEnter = () => {
    if (onHover) onHover()
  }

  const handleMouseLeave = () => {
    if (onLeave) onLeave()
  }

  return (
    <div
      className={`relative h-14 flex items-center justify-center rounded-lg font-mono font-bold cursor-pointer border-2 ${sizeClasses[size]} ${fontSize} ${animationClass} ${
        isSelected ? 'ring-2 scale-105' : ''
      }`}
      style={{
        backgroundColor: backgroundColor || (isSelected ? 'var(--accent-primary)' : isIncluded ? 'var(--success-bg)' : 'var(--bg-secondary)'),
        color: color || (isSelected ? 'white' : isIncluded ? 'var(--success-text)' : 'var(--text-secondary)'),
        borderColor: borderColor || (isSelected ? 'var(--accent-primary)' : isIncluded ? '#059669' : '#dc2626'),
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel || `Cell ${content}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      {content}
    </div>
  )
}
