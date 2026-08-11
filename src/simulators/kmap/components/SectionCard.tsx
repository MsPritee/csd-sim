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
    <div className="bg-slate-900 rounded-lg border border-slate-700">
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-violet-300">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {headerRight}
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={`Toggle ${title}`}
            className="flex items-center justify-center h-8 w-8 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xl leading-none"
          >
            {open ? '−' : '+'}
          </button>
        </div>
      </div>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}