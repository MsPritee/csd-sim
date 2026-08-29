interface CompactSelectProps {
  value: string | number
  onChange: (value: string) => void
  options: readonly { value: string | number; label: string }[]
  className?: string
  title?: string
}

export default function CompactSelect({
  value,
  onChange,
  options,
  className = '',
  title,
}: CompactSelectProps) {
  return (
    <div className="relative">
      <select
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
          <option key={String(option.value)} value={String(option.value)}>
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