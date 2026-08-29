import { useState } from 'react'

interface SectionCardProps {
  title: string
  subtitle?: string
  /** Optional controls shown on the right of the header, before the collapse button. */
  headerRight?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
}

export default function SectionCard({
  title,
  subtitle,
  headerRight,
  defaultOpen = true,
  children,
  className = '',
}: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`rounded-lg elevation-tertiary ${className}`}>
      <div className="flex items-center justify-between gap-control-group p-1 sm:p-1.5">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold heading-dense" style={{ color: 'var(--accent-primary)' }}>{title}</h2>
          {subtitle && <p className="text-xs mt-0.25 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
        </div>
        <div className="flex items-center gap-control-group shrink-0">
          {headerRight}
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={`Toggle ${title}`}
            className="flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 rounded text-lg leading-none transition-all touch-action-manipulation min-w-[36px] min-h-[36px] control-secondary"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {open ? '−' : '+'}
          </button>
        </div>
      </div>
      {open && <div className="px-1 sm:px-1.5 pb-1 sm:pb-1.5">{children}</div>}
    </div>
  )
}