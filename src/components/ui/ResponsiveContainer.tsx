/**
 * ResponsiveContainer - Wrapper with responsive max-width and padding
 * Provides consistent container behavior across breakpoints
 */

import type { ReactNode } from 'react'

interface ResponsiveContainerProps {
  readonly children: ReactNode
  readonly className?: string
  readonly centered?: boolean
  readonly fluid?: boolean
}

export function ResponsiveContainer({
  children,
  className = '',
  centered = true,
  fluid = false,
}: ResponsiveContainerProps) {
  const centerClass = centered ? 'mx-auto' : ''

  if (fluid) {
    return (
      <div className={`container-fluid ${centerClass} ${className}`}>
        {children}
      </div>
    )
  }

  return (
    <div className={`container ${centerClass} ${className}`}>
      {children}
    </div>
  )
}
