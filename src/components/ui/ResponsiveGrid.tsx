/**
 * ResponsiveGrid - Adaptive grid system with breakpoint control
 * Provides responsive column layouts across screen sizes
 */

import type { ReactNode } from 'react'

interface ResponsiveGridProps {
  readonly children: ReactNode
  readonly className?: string
  readonly cols?: {
    readonly xs?: number
    readonly sm?: number
    readonly md?: number
    readonly lg?: number
    readonly xl?: number
  }
  readonly gap?: '0' | '1' | '2' | '3' | '4' | '6' | '8'
  readonly align?: 'start' | 'center' | 'end' | 'stretch'
}

const gapStyles: Record<Exclude<ResponsiveGridProps['gap'], undefined>, string> = {
  '0': 'gap-0',
  '1': 'gap-1',
  '2': 'gap-2',
  '3': 'gap-3',
  '4': 'gap-4',
  '6': 'gap-6',
  '8': 'gap-8',
}

const alignStyles: Record<Exclude<ResponsiveGridProps['align'], undefined>, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
}

export function ResponsiveGrid({
  children,
  className = '',
  cols = { xs: 1, sm: 1, md: 2, lg: 3, xl: 4 },
  gap = '4',
  align = 'stretch',
}: ResponsiveGridProps) {
  const gapClass = gapStyles[gap]
  const alignClass = alignStyles[align]

  // Build base grid class
  const gridClasses = [`grid`, `grid-cols-${cols.xs || 1}`]

  // Add responsive grid classes using standard Tailwind syntax
  // The custom CSS from Phase 1 provides fallback for non-Tailwind setups
  if (cols.sm) gridClasses.push(`sm:grid-cols-${cols.sm}`)
  if (cols.md) gridClasses.push(`md:grid-cols-${cols.md}`)
  if (cols.lg) gridClasses.push(`lg:grid-cols-${cols.lg}`)
  if (cols.xl) gridClasses.push(`xl:grid-cols-${cols.xl}`)

  gridClasses.push(gapClass, alignClass)

  return (
    <div className={gridClasses.join(' ') + ' ' + className}>
      {children}
    </div>
  )
}
