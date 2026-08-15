/**
 * Input - Reusable input component with CSS variable theming
 * Supports text, number, and other input types
 */

import React from 'react'

interface InputProps {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly placeholder?: string
  readonly label?: string
  readonly disabled?: boolean
  readonly type?: 'text' | 'number' | 'password' | 'email'
  readonly onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  readonly className?: string
  readonly error?: string
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
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
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
        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors disabled:bg-gray-100 ${className}`}
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: error ? 'var(--error-border)' : 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
      />
      {error && (
        <p className="text-xs mt-1" style={{ color: 'var(--error-text)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
