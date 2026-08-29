import { useState } from 'react'

interface ExpandableSectionProps {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
}

export default function ExpandableSection({ title, children, defaultExpanded = false }: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div
      className="border rounded-lg overflow-hidden"
      style={{ borderColor: 'var(--border-color)' }}
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-3"
        style={{ backgroundColor: 'var(--bg-tertiary)' }}
      >
        <span className="font-medium" style={{ color: 'var(--accent-primary)' }}>{title}</span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label={`Toggle ${title}`}
          className="flex items-center justify-center h-8 w-8 rounded text-xl leading-none shrink-0"
          style={{ backgroundColor: 'var(--border-light)', color: 'var(--text-primary)' }}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      {isExpanded && (
        <div
          className="px-4 py-3"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
