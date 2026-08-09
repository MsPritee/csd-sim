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
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-750 flex items-center justify-between text-left transition-colors"
      >
        <span className="font-medium text-violet-300">{title}</span>
        <span className="text-slate-400 text-lg">
          {isExpanded ? '−' : '+'}
        </span>
      </button>
      {isExpanded && (
        <div className="px-4 py-3 bg-slate-800/50">
          {children}
        </div>
      )}
    </div>
  )
}
