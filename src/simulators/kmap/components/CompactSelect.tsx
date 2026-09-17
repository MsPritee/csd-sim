interface CompactSelectProps {
  value: string | number
  onChange: (value: string) => void
  options: readonly { value: string | number; label: string; disabled?: boolean }[]
  className?: string
  title?: string
  id?: string
  ariaLabel?: string
}

export default function CompactSelect({
  value,
  onChange,
  options,
  className = '',
  title,
  id,
  ariaLabel,
}: CompactSelectProps) {
  return (
    <div className="relative">
      <select
        id={id}
        aria-label={ariaLabel}
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className={`rounded px-2.5 py-1.5 pr-8 text-sm transition-colors appearance-none min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-[40px] cursor-pointer ${className}`}
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)'
        }}
        title={title}
      >
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <div 
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-xs"
        style={{ color: 'var(--text-secondary)' }}
      >
        ▼
      </div>
    </div>
  )
}