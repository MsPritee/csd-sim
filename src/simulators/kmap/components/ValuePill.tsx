interface ValuePillProps {
  options: readonly { value: string | number | null; label: string }[]
  value: string | number | null
  onChange: (value: string | number | null) => void
  size?: 'sm' | 'md'
  tooltip?: string
}

export default function ValuePill({
  options,
  value,
  onChange,
  size = 'md',
  tooltip,
}: ValuePillProps) {
  const sizeClasses = size === 'sm'
    ? 'w-8 h-8 text-xs min-h-[32px]'
    : 'w-10 h-10 text-sm min-h-[40px] sm:min-h-[40px]'

  return (
    <div className="flex gap-1" title={tooltip}>
      {options.map((option) => (
        <button
          key={String(option.value)}
          onClick={() => onChange(option.value)}
          className={`rounded-md transition-colors touch-action-manipulation flex items-center justify-center ${sizeClasses}`}
          style={{
            backgroundColor: String(value) === String(option.value) ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
            color: String(value) === String(option.value) ? '#ffffff' : 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => {
            if (String(value) !== String(option.value)) {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
            }
          }}
          onMouseLeave={(e) => {
            if (String(value) !== String(option.value)) {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
            }
          }}
          title={tooltip || option.label}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
