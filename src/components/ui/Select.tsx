/**
 * Select - Reusable select component with CSS variable theming
 * Provides consistent dropdown styling
 */

interface SelectOption {
  readonly value: string
  readonly label: string
  readonly disabled?: boolean
}

interface SelectProps {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly options: readonly SelectOption[]
  readonly label?: string
  readonly disabled?: boolean
  readonly className?: string
  readonly description?: string
}

export function Select({
  value,
  onChange,
  options,
  label,
  disabled = false,
  className = '',
  description,
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors disabled:bg-gray-100 ${className}`}
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {description && (
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      )}
    </div>
  )
}
