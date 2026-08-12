import type { ReactNode } from 'react'
import ExpandableSection from '../components/ExpandableSection'
import ErrorBox from './ErrorBox'
import ExprTermBreakdown from './ExprTermBreakdown'
import ExpressionChainView from './ExpressionChainView'
import NiceHeader from './NiceHeader'
import Notice from './Notice'
import { METHOD_LABELS } from './methodLabels'

export type Method = 'minterms' | 'maxterms' | 'expression' | 'truth'

export type MethodInputs = Record<
  Method,
  {
    label: string
    help?: ReactNode
    fields: ReactNode[]
    action: () => void
    actionLabel: string
  }
>

interface Props {
  method: Method
  onSelectMethod: (m: Method) => void
  error: string | null
  notice: readonly string[]
  changedSinceDefine: boolean
  variables: readonly string[]
  expressionText: string
  onSet: readonly number[]
  methodInputs: MethodInputs
}

export default function DefineFunctionPanel({
  method,
  onSelectMethod,
  error,
  notice,
  changedSinceDefine,
  variables,
  expressionText,
  onSet,
  methodInputs,
}: Props) {
  return (
    <>
      <div>
        <NiceHeader
          title="Define the function"
          hint="Pick a representation. Whatever you set appears instantly on the K-map, and the map stays the source of truth."
        />
        <div className="flex flex-wrap gap-2 mb-3">
          {(Object.keys(METHOD_LABELS) as Method[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onSelectMethod(m)}
              className={`px-3 py-1.5 rounded border text-sm transition-colors ${method === m ? 'border-violet-400 bg-violet-600/20 text-white' : 'border-slate-600 text-slate-300 hover:border-violet-400'}`}
              aria-pressed={method === m}
            >
              {METHOD_LABELS[m]}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-slate-400 text-sm">{methodInputs[method].label}</p>
          {methodInputs[method].fields}
          <button
            type="button"
            onClick={methodInputs[method].action}
            className="px-4 py-2 rounded bg-violet-600 hover:bg-violet-500 text-white text-sm"
          >
            {methodInputs[method].actionLabel}
          </button>
        </div>
      </div>

      {error && <ErrorBox message={error} />}
      <Notice lines={notice} />

      {changedSinceDefine && (
        <div className="rounded bg-amber-950/60 border border-amber-700/60 px-3 py-2 text-amber-300 text-sm" role="note">
          The function has changed since you defined it (you painted cells directly on the K-map). The
          map is now the source of truth; the analysis below reflects the current map, not your last
          typed input.
        </div>
      )}

      {method === 'expression' && expressionText.trim() !== '' && (
        <ExprTermBreakdown variables={variables} expression={expressionText.trim()} />
      )}
      {method === 'expression' && expressionText.trim() !== '' && !error && (
        <ExpandableSection title="Expression → truth table (each row's output)">
          <ExpressionChainView variables={variables} expression={expressionText.trim()} on={onSet} />
        </ExpandableSection>
      )}
    </>
  )
}