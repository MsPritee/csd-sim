import type { MistakeDetail } from '../../../../education/practice/types'
import { categoryLabel } from '../../../../education/practice/mastery'

interface MistakeListProps {
  mistakes: readonly MistakeDetail[]
}

export default function MistakeList({ mistakes }: MistakeListProps) {
  if (mistakes.length === 0) return null
  return (
    <div className="mt-3 space-y-3">
      <h3 className="text-sm font-semibold text-slate-200">
        Feedback · {mistakes.length} issue{mistakes.length === 1 ? '' : 's'}
      </h3>
      {mistakes.map((m, i) => (
        <div key={i} className="rounded border border-slate-700 bg-slate-950/40 p-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-red-900/50 px-2 py-0.5 text-xs font-medium text-red-300">
              {categoryLabel(m.category)}
            </span>
            <span className="text-sm text-slate-200">{m.happened}</span>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            <span className="font-medium text-slate-300">Why: </span>
            {m.why}
          </p>
          <p className="mt-1 text-sm text-emerald-300/90">
            <span className="font-medium">Correct idea: </span>
            {m.correctConcept}
          </p>
          <p className="mt-1 text-sm text-violet-300/90">
            <span className="font-medium">Try: </span>
            {m.tryAgain}
          </p>
        </div>
      ))}
    </div>
  )
}