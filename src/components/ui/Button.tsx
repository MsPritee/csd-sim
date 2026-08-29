/**
 * Button - Reusable button component with CSS variable theming
 * Supports multiple variants and states
 */

import type { ReactNode } from 'react'

interface ButtonProps {
  readonly children: ReactNode
  readonly onClick?: () => void
  readonly disabled?: boolean
  readonly loading?: boolean
  readonly variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost'
  readonly size?: 'xs' | 'sm' | 'md' | 'lg' | 'responsive'
  readonly className?: string
  readonly type?: 'button' | 'submit' | 'reset'
  readonly fullWidth?: boolean
  readonly minWidth?: string
}

const variantStyles: Record<
  Exclude<ButtonProps['variant'], undefined>,
  { backgroundColor: string; color: string; hoverBackgroundColor?: string }
> = {
  primary: {
    backgroundColor: 'var(--accent-primary)',
    color: 'var(--text-on-accent)',
    hoverBackgroundColor: 'var(--accent-primary-hover)',
  },
  secondary: {
    backgroundColor: 'var(--accent-secondary)',
    color: 'var(--text-on-accent)',
    hoverBackgroundColor: 'var(--accent-secondary-hover)',
  },
  success: {
    backgroundColor: 'var(--success-bg)',
    color: 'var(--success-text)',
    hoverBackgroundColor: 'var(--success-bg)',
  },
  warning: {
    backgroundColor: 'var(--warning-bg)',
    color: 'var(--warning-text)',
    hoverBackgroundColor: 'var(--warning-bg)',
  },
  error: {
    backgroundColor: 'var(--error-bg)',
    color: 'var(--error-text)',
    hoverBackgroundColor: 'var(--error-bg)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
    hoverBackgroundColor: 'var(--bg-tertiary)',
  },
}

const sizeStyles: Record<Exclude<ButtonProps['size'], undefined>, string> = {
  xs: 'px-2 py-1 text-xs min-h-[36px]',
  sm: 'px-2.5 py-1.5 text-sm min-h-[40px]',
  md: 'px-3 py-2 text-base min-h-[44px]',
  lg: 'px-8 py-3 text-lg min-h-[48px]',
  responsive: 'px-4 py-2 text-sm xs:px-5 xs:py-2 xs:text-base sm:px-6 sm:py-2.5 sm:text-base md:px-8 md:py-3 md:text-lg min-h-[44px]',
}

export function Button({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  fullWidth = false,
  minWidth,
}: ButtonProps) {
  const style = variantStyles[variant]
  const sizeClass = sizeStyles[size]

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`rounded-md transition-colors disabled:opacity-50 ${sizeClass} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{
        backgroundColor: disabled || loading ? 'var(--bg-tertiary)' : style.backgroundColor,
        color: style.color,
        minWidth: minWidth,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading && style.hoverBackgroundColor) {
          e.currentTarget.style.backgroundColor = style.hoverBackgroundColor
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = style.backgroundColor
        }
      }}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}
