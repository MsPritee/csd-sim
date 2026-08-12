import type { Implicant } from '../../../core/kmap/prime-implicants'

export default function PrimeRow({ p }: { p: Implicant }) {
  return (
    <li className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
      <code className="text-green-300">m{p.cells.join(',m')}</code>
      {p.essential ? (
        <span className="text-violet-300 text-xs">essential — covers m{p.essentialFor.join(',m')} uniquely</span>
      ) : (
        <span className="text-slate-400 text-xs">non-essential</span>
      )}
    </li>
  )
}