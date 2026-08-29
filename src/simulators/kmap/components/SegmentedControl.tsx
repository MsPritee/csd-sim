interface SegmentedControlProps {
  options: readonly { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  size?: 'sm' | 'md'
}

export default function SegmentedControl({
  options,
  value,
  onChange,
  size = 'md',
}: SegmentedControlProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-sm'

  return (
    <div className="inline-flex rounded p-0.5" style={{ backgroundColor: 'var(--bg-tertiary)' }} role="group">
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={`rounded transition-colors ${sizeClasses}`}
            style={{
              backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
              color: isActive ? '#ffffff' : 'var(--text-primary)',
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
