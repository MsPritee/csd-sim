import { useMemo } from 'react'
import type { KMapModel } from '../../../core/kmap'
import { kmapToTruthTable } from '../../../core/kmap/truth-table'
import { explainRow } from '../../../education/explanations/minterm-maxterm'
import { grayCodeRows, grayBitChanged, explainGrayCode } from '../../../education/explanations/gray-code'
import SectionCard from './SectionCard'

interface TruthTablePanelProps {
  kmap: KMapModel
  showSOP: boolean
  /** Minterm currently highlighted in the K-map (or null). */
  highlightedCell: number | null
  /** Called when a truth-table row is activated so the K-map can match it. */
  onSelectCell: (minterm: number) => void
}

export default function TruthTablePanel({
  kmap,
  showSOP,
  highlightedCell,
  onSelectCell,
}: TruthTablePanelProps) {
  const variables = kmap.layout.variables
  const n = variables.length

  const rows = useMemo(() => {
    const tt = kmapToTruthTable(kmap)
    return tt.outputs.map((value, minterm) => {
      const bits = minterm.toString(2).padStart(n, '0')
      return { minterm, bits, value }
    })
  }, [kmap, n])

  const selected = highlightedCell !== null ? explainRow(variables, highlightedCell) : null
  const gray = useMemo(() => explainGrayCode(n), [n])
  const grayRows = useMemo(() => grayCodeRows(n), [n])

  return (
    <SectionCard
      title="Truth Table"
      subtitle="Full function from the K-map. Hover/click a row to highlight its cell in the K-map, or hover a K-map cell to highlight its row here."
    >

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-slate-400">
              {variables.map((v) => (
                <th key={v} className="px-2 py-1 border border-slate-700 font-medium">
                  {v}
                </th>
              ))}
              <th className="px-2 py-1 border border-slate-700 font-medium">F</th>
              <th className="px-2 py-1 border border-slate-700 font-medium">#</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ minterm, bits, value }) => {
              const isActive = highlightedCell === minterm
              const isOn = value === 1
              return (
                <tr
                  key={minterm}
                  className={`transition-colors ${
                    isActive ? 'bg-violet-600/30' : isOn ? 'bg-green-900/20' : 'bg-slate-800/40'
                  }`}
                >
                  {Array.from(bits).map((bit, i) => (
                    <td key={i} className="px-2 py-1 border border-slate-700 font-mono">
                      {bit}
                    </td>
                  ))}
                  <td
                    className={`px-2 py-1 border border-slate-700 font-mono font-bold ${
                      value === 1
                        ? 'text-green-400'
                        : value === 0
                          ? 'text-red-400'
                          : value === 'X'
                            ? 'text-yellow-400'
                            : 'text-slate-500'
                    }`}
                  >
                    {value === null ? '—' : value}
                  </td>
                  <td className="px-2 py-1 border border-slate-700 font-mono text-slate-500">
                    m{minterm}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {rows.some((r) => r.value === null) && (
        <p className="text-xs text-slate-500 mt-2">
          Empty cells (—) are treated as 0 for output; set them in the K-map to complete the
          function.
        </p>
      )}

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-slate-400">
          Click a row to match it to its K-map cell
        </span>
        <span className="text-slate-500">
          Highlighted: {highlightedCell === null ? 'none' : `m${highlightedCell}`}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <button
          type="button"
          className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:border-violet-500"
          onClick={() => {
            const firstOn = rows.find((r) => r.value === 1)
            if (firstOn) onSelectCell(firstOn.minterm)
          }}
          data-testid="truth-table-focus-minterm"
        >
          Focus first 1-minterm (the K-map cell used in {showSOP ? 'SOP' : 'this mode'})
        </button>

        <details className="group">
          <summary className="cursor-pointer rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-violet-300">
            Why are rows ordered {grayRows.map((g) => g.gray).join(', ')}? (Gray code)
          </summary>
          <div className="mt-2 space-y-2 text-sm text-slate-400">
            <p>{gray.summary}</p>
            <ul className="list-disc list-inside space-y-1">
              {grayRows.map((r, i) => (
                <li key={r.gray} className="text-xs">
                  <span className="font-mono text-white">{r.binary} → {r.gray}</span>
                  {i > 0 && (
                    <span className="text-slate-500">
                      {' '}(flips bit {grayBitChanged(grayRows, i - 1, i) + 1})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </details>
      </div>

      {selected && (
        <div
          className="mt-4 rounded-lg border border-violet-500/30 bg-slate-800 p-4"
          data-testid="truth-table-row-explanation"
        >
          <h3 className="text-sm font-semibold text-violet-300">
            Row m{selected.minterm} — why it is what it is
          </h3>
          <p className="mt-1 font-mono text-white">
            Binary <span className="text-slate-300">{selected.binary}</span> →{' '}
            {selected.mintermTerm} (minterm) &amp; {selected.maxtermSum} (maxterm)
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-400">
            {selected.reasons.map((r, i) => (
              <li key={i} className="flex flex-col gap-0.5">
                <span className="font-mono text-white">
                  {r.variable}={r.bit}: {r.mintermLiteral} / {r.maxtermLiteral}
                </span>
                <span className="pl-4">
                  <span className="text-green-400">SOP {r.mintermReason}.</span>{' '}
                  <span className="text-red-400">POS {r.maxtermReason}.</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  )
}