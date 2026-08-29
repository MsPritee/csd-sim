/**
 * Input - Reusable input component with CSS variable theming
 * Supports text, number, and other input types
 */

import type { KeyboardEvent } from 'react'

interface InputProps {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly placeholder?: string
  readonly label?: string
  readonly disabled?: boolean
  readonly type?: 'text' | 'number' | 'password' | 'email'
  readonly onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
  readonly className?: string
  readonly error?: string
  readonly size?: 'sm' | 'md' | 'lg' | 'responsive'
  readonly fullWidth?: boolean
}

const sizeStyles: Record<Exclude<InputProps['size'], undefined>, string> = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-4 py-2 text-base min-h-[40px]',
  lg: 'px-5 py-3 text-lg min-h-[44px]',
  responsive: 'px-3 py-2 text-sm xs:px-3 xs:py-2 xs:text-sm sm:px-4 sm:py-2 sm:text-base md:px-5 md:py-3 md:text-lg min-h-[44px]',
}

export function Input({
  value,
  onChange,
  placeholder = '',
  label,
  disabled = false,
  type = 'text',
  onKeyDown,
  className = '',
  error,
  size = 'md',
  fullWidth = false,
}: InputProps) {
  const sizeClass = sizeStyles[size]

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-medium mb-2 xs:text-xs sm:text-sm" style={{ color: 'var(--text-primary)' }}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full border rounded-md focus:outline-none focus:ring-2 transition-colors disabled:bg-gray-100 ${sizeClass} ${className}`}
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: error ? 'var(--error-border)' : 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
      />
      {error && (
        <p className="text-xs mt-1 xs:text-[10px] sm:text-xs" style={{ color: 'var(--error-text)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
