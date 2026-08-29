/**
 * LoadingSpinner - Reusable loading indicator component
 */

interface LoadingSpinnerProps {
  readonly size?: 'sm' | 'md' | 'lg'
  readonly className?: string
  readonly centered?: boolean
}

const sizeStyles: Record<Exclude<LoadingSpinnerProps['size'], undefined>, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-b-2',
  lg: 'h-12 w-12 border-b-3',
}

export function LoadingSpinner({
  size = 'md',
  className = '',
  centered = false,
}: LoadingSpinnerProps) {
  const sizeClass = sizeStyles[size]

  if (centered) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div
          className={`animate-spin rounded-full ${sizeClass} ${className}`}
          style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  return (
    <div
      className={`animate-spin rounded-full ${sizeClass} ${className}`}
      style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }}
    />
  )
}
