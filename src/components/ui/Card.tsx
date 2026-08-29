/**
 * Card - Reusable card component with CSS variable theming
 * Provides consistent container styling
 */

import type { ReactNode } from 'react'

interface CardProps {
  readonly children: ReactNode
  readonly title?: string
  readonly subtitle?: string
  readonly className?: string
  readonly padding?: 'sm' | 'md' | 'lg' | 'responsive'
  readonly fullWidth?: boolean
  readonly stackOnMobile?: boolean
}

const paddingStyles: Record<Exclude<CardProps['padding'], undefined>, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  responsive: 'p-4 xs:p-4 sm:p-5 md:p-6 lg:p-8',
}

export function Card({
  children,
  title,
  subtitle,
  className = '',
  padding = 'md',
  fullWidth = false,
  stackOnMobile = false,
}: CardProps) {
  const paddingClass = paddingStyles[padding]

  return (
    <div
      className={`rounded-lg border ${paddingClass} ${fullWidth ? 'w-full' : ''} ${stackOnMobile ? 'xs:flex-col sm:flex-row' : ''} ${className}`}
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-xl font-semibold xs:text-lg sm:text-xl md:text-2xl" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm mt-1 xs:text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
