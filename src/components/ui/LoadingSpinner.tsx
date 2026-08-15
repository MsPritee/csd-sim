/**
 * LoadingSpinner - Reusable loading indicator component
 */

interface LoadingSpinnerProps {
  readonly size?: 'sm' | 'md' | 'lg'
  readonly className?: string
}

const sizeStyles: Record<Exclude<LoadingSpinnerProps['size'], undefined>, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-b-2',
  lg: 'h-12 w-12 border-b-3',
}

export function LoadingSpinner({
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClass = sizeStyles[size]

  return (
    <div
      className={`animate-spin rounded-full ${sizeClass} ${className}`}
      style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }}
    />
  )
}
