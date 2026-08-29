/**
 * HexadecimalDigitCard - Interactive hexadecimal digit card component for lessons
 * Specialized for hexadecimal digits (0-9, A-F)
 */

import type { HexDigit } from '../types/lesson.types'

interface HexadecimalDigitCardProps {
  digit: number | HexDigit
  selected?: boolean
  highlighted?: boolean
  onClick?: () => void
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

// Helper function to convert number to hex digit for display
const numberToHexDigit = (num: number): HexDigit => {
  if (num >= 0 && num <= 9) return num.toString() as HexDigit
  return ['A', 'B', 'C', 'D', 'E', 'F'][num - 10] as HexDigit
}

export function HexadecimalDigitCard({ 
  digit, 
  selected = false, 
  highlighted = false,
  onClick,
  size = 'medium',
  disabled = false
}: HexadecimalDigitCardProps) {
  const sizeClasses = {
    small: 'w-12 h-12 text-xl',
    medium: 'w-16 h-16 text-2xl',
    large: 'w-20 h-20 text-3xl'
  }

  // Convert digit to display format
  const displayDigit = typeof digit === 'number' ? numberToHexDigit(digit) : digit

  const getCardStyle = () => {
    if (selected) {
      return {
        backgroundColor: 'var(--success-border)',
        color: 'white',
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4)'
      }
    }
    if (highlighted) {
      return {
        backgroundColor: 'var(--accent-primary)',
        color: 'white',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
      }
    }
    return {
      backgroundColor: 'var(--bg-tertiary)',
      color: 'var(--text-primary)',
      transform: 'translateY(0)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        rounded-xl font-bold
        transition-all duration-200 ease-out
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      style={getCardStyle()}
      aria-label={`Hexadecimal digit ${displayDigit}`}
      aria-pressed={selected}
    >
      {displayDigit}
    </button>
  )
}
