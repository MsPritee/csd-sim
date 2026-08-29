import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral'
  size?: 'xs' | 'sm' | 'md'
  compact?: boolean
}

export default function Badge({ children, variant = 'neutral', size = 'sm', compact = false }: BadgeProps) {
  const sizeClasses = size === 'xs' 
    ? 'px-1 py-0.5 text-[10px]' 
    : size === 'sm' 
      ? 'px-1.5 py-0.5 text-xs' 
      : 'px-2 py-1 text-sm'
  
  const compactClasses = compact ? 'px-1 py-0.5 text-[10px]' : ''

  const variantStyles = {
    success: {
      backgroundColor: 'var(--success-bg)',
      color: 'var(--success-text)',
      borderColor: 'var(--success-border)',
    },
    error: {
      backgroundColor: 'var(--error-bg)',
      color: 'var(--error-text)',
      borderColor: 'var(--error-border)',
    },
    warning: {
      backgroundColor: 'var(--warning-bg)',
      color: 'var(--warning-text)',
      borderColor: 'var(--warning-border)',
    },
    info: {
      backgroundColor: 'var(--accent-bg)',
      color: 'var(--accent-primary)',
      borderColor: 'var(--accent-primary)',
    },
    neutral: {
      backgroundColor: 'var(--bg-tertiary)',
      color: 'var(--text-secondary)',
      borderColor: 'var(--border-color)',
    },
  }

  const style = variantStyles[variant]

  return (
    <span
      className={`rounded inline-flex items-center justify-center font-medium ${compact ? compactClasses : sizeClasses}`}
      style={{
        backgroundColor: style.backgroundColor,
        color: style.color,
        border: `1px solid ${style.borderColor}`,
      }}
    >
      {children}
    </span>
  )
}
