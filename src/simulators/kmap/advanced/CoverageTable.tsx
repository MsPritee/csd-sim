import { minterms, type KMapModel } from '../../../core/kmap'
import { coverageMatrix } from '../../../core/kmap/prime-implicants'

export default function CoverageTable({ model }: { model: KMapModel }) {
  const { coverage, primes, uniquelyCovered } = coverageMatrix(model)
  const on = [...new Set(minterms(model))].sort((a, b) => a - b)
  if (on.length === 0) return <p className="text-slate-500 text-sm">No ON-set cells to cover.</p>
  return (
    <div className="overflow-x-auto">
      <table className="text-xs text-slate-200 border-collapse">
        <thead>
          <tr>
            <th className="border border-slate-700 px-2 py-1 text-left text-slate-400">Prime</th>
            {on.map((m) => <th key={m} className="border border-slate-700 px-1 py-1 text-slate-400">m{m}</th>)}
            <th className="border border-slate-700 px-2 py-1 text-slate-400">Role</th>
          </tr>
        </thead>
        <tbody>
          {primes.map((p) => {
            const covers = coverage.get(p.id) ?? new Set<number>()
            return (
              <tr key={p.id}>
                <td className="border border-slate-700 px-2 py-1"><code className="text-green-300">m{p.cells.join(',m')}</code></td>
                {on.map((m) => (
                  <td key={m} className="border border-slate-700 px-1 py-1 text-center">
                    {covers.has(m) ? <span className="text-green-400">●</span> : <span className="text-slate-700">·</span>}
                  </td>
                ))}
                <td className="border border-slate-700 px-2 py-1">
                  {p.essential ? (
                    <span className="text-violet-300">essential (m{uniquelyCovered.get(p.id) ?? ''})</span>
                  ) : (
                    <span className="text-slate-500">optional</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}