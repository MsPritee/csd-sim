import { useState } from 'react'

interface ExpandableSectionProps {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
}

export default function ExpandableSection({ title, children, defaultExpanded = false }: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-800">
        <span className="font-medium text-violet-300">{title}</span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label={`Toggle ${title}`}
          className="flex items-center justify-center h-8 w-8 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xl leading-none shrink-0"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      {isExpanded && (
        <div className="px-4 py-3 bg-slate-800/50">
          {children}
        </div>
      )}
    </div>
  )
}
