/**
 * Card - Reusable card component with CSS variable theming
 * Provides consistent container styling
 */

import React from 'react'

interface CardProps {
  readonly children: React.ReactNode
  readonly title?: string
  readonly subtitle?: string
  readonly className?: string
  readonly padding?: 'sm' | 'md' | 'lg'
}

const paddingStyles: Record<Exclude<CardProps['padding'], undefined>, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({
  children,
  title,
  subtitle,
  className = '',
  padding = 'md',
}: CardProps) {
  const paddingClass = paddingStyles[padding]

  return (
    <div
      className={`rounded-lg border ${paddingClass} ${className}`}
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
