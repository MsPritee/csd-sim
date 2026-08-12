import { useState } from 'react'

interface SectionCardProps {
  title: string
  subtitle?: string
  /** Optional controls shown on the right of the header, before the collapse button. */
  headerRight?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}

export default function SectionCard({
  title,
  subtitle,
  headerRight,
  defaultOpen = true,
  children,
}: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--accent-primary)' }}>{title}</h2>
          {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {headerRight}
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={`Toggle ${title}`}
            className="flex items-center justify-center h-8 w-8 rounded text-xl leading-none transition-colors"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
          >
            {open ? '−' : '+'}
          </button>
        </div>
      </div>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}