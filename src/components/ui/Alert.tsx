/**
 * Alert - Reusable alert component for warnings, errors, and info messages
 * Uses CSS variable theming
 */

import React from 'react'

interface AlertProps {
  readonly children: React.ReactNode
  readonly variant?: 'info' | 'warning' | 'error' | 'success'
  readonly className?: string
}

const variantStyles: Record<
  Exclude<AlertProps['variant'], undefined>,
  { backgroundColor: string; borderColor: string; color: string }
> = {
  info: {
    backgroundColor: 'var(--accent-bg)',
    borderColor: 'var(--accent-border)',
    color: 'var(--accent-text)',
  },
  warning: {
    backgroundColor: 'var(--warning-bg)',
    borderColor: 'var(--warning-border)',
    color: 'var(--warning-text)',
  },
  error: {
    backgroundColor: 'var(--error-bg)',
    borderColor: 'var(--error-border)',
    color: 'var(--error-text)',
  },
  success: {
    backgroundColor: 'var(--success-bg)',
    borderColor: 'var(--success-border)',
    color: 'var(--success-text)',
  },
}

export function Alert({
  children,
  variant = 'info',
  className = '',
}: AlertProps) {
  const style = variantStyles[variant]

  return (
    <div
      className={`p-4 rounded-md border ${className}`}
      style={{
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        color: style.color,
      }}
    >
      {children}
    </div>
  )
}
