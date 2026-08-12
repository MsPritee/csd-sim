import { useMemo } from 'react'
import { expressionChain } from '../../../education/advanced'

export default function ExpressionChainView({ variables, expression, on }: { variables: readonly string[]; expression: string; on: readonly number[] }) {
  const chain = useMemo(() => expressionChain(variables, expression), [variables, expression])
  const onSet = useMemo(() => new Set(on), [on])
  return (
    <div className="overflow-x-auto">
      <table className="text-xs text-slate-200 border-collapse">
        <thead>
          <tr>
            <th className="border border-slate-700 px-2 py-1 text-left text-slate-400">Row</th>
            <th className="border border-slate-700 px-2 py-1 text-left text-slate-400">Inputs</th>
            <th className="border border-slate-700 px-2 py-1 text-left text-slate-400">Output</th>
            <th className="border border-slate-700 px-2 py-1 text-left text-slate-400">On K-map?</th>
          </tr>
        </thead>
        <tbody>
          {chain.rows.map((r) => (
            <tr key={r.minterm}>
              <td className="border border-slate-700 px-2 py-1">m{r.minterm}</td>
              <td className="border border-slate-700 px-2 py-1 font-mono">{r.binary}</td>
              <td className="border border-slate-700 px-2 py-1">{r.output}</td>
              <td className="border border-slate-700 px-2 py-1">{onSet.has(r.minterm) ? '1' : '0'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}