/**
 * ResponsiveFlex - Adaptive flexbox wrapper with breakpoint control
 * Provides responsive flex layouts across screen sizes
 */

import type { ReactNode } from 'react'

interface ResponsiveFlexProps {
  readonly children: ReactNode
  readonly className?: string
  readonly direction?: {
    readonly xs?: 'row' | 'col'
    readonly sm?: 'row' | 'col'
    readonly md?: 'row' | 'col'
    readonly lg?: 'row' | 'col'
    readonly xl?: 'row' | 'col'
  }
  readonly wrap?: 'wrap' | 'nowrap' | 'wrap-reverse'
  readonly justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  readonly align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
  readonly gap?: '0' | '1' | '2' | '3' | '4' | '6' | '8'
}

const directionStyles: Record<'row' | 'col', string> = {
  row: 'flex-row',
  col: 'flex-col',
}

const wrapStyles: Record<Exclude<ResponsiveFlexProps['wrap'], undefined>, string> = {
  wrap: 'flex-wrap',
  nowrap: 'flex-nowrap',
  'wrap-reverse': 'flex-wrap-reverse',
}

const justifyStyles: Record<Exclude<ResponsiveFlexProps['justify'], undefined>, string> = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
}

const alignStyles: Record<Exclude<ResponsiveFlexProps['align'], undefined>, string> = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  baseline: 'items-baseline',
  stretch: 'items-stretch',
}

const gapStyles: Record<Exclude<ResponsiveFlexProps['gap'], undefined>, string> = {
  '0': 'gap-0',
  '1': 'gap-1',
  '2': 'gap-2',
  '3': 'gap-3',
  '4': 'gap-4',
  '6': 'gap-6',
  '8': 'gap-8',
}

export function ResponsiveFlex({
  children,
  className = '',
  direction = { xs: 'row', sm: 'row', md: 'row', lg: 'row', xl: 'row' },
  wrap = 'nowrap',
  justify = 'start',
  align = 'stretch',
  gap = '4',
}: ResponsiveFlexProps) {
  const directionClass = directionStyles[direction.xs || 'row']
  const wrapClass = wrapStyles[wrap]
  const justifyClass = justifyStyles[justify]
  const alignClass = alignStyles[align]
  const gapClass = gapStyles[gap]

  // Build flex classes
  const flexClasses = ['flex', directionClass, wrapClass, justifyClass, alignClass, gapClass]

  // Add responsive direction classes using standard Tailwind syntax
  // The custom CSS from Phase 1 provides fallback support
  if (direction.sm === 'col') flexClasses.push('sm:flex-col')
  if (direction.sm === 'row') flexClasses.push('sm:flex-row')
  if (direction.md === 'col') flexClasses.push('md:flex-col')
  if (direction.md === 'row') flexClasses.push('md:flex-row')
  if (direction.lg === 'col') flexClasses.push('lg:flex-col')
  if (direction.lg === 'row') flexClasses.push('lg:flex-row')
  if (direction.xl === 'col') flexClasses.push('xl:flex-col')
  if (direction.xl === 'row') flexClasses.push('xl:flex-row')

  return (
    <div className={flexClasses.join(' ') + ' ' + className}>
      {children}
    </div>
  )
}
