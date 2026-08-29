import { useMemo } from 'react'
import type { KMapModel } from '../../../core/kmap'
import { kmapToTruthTable } from '../../../core/kmap/truth-table'
import { explainRow } from '../../../education/explanations/minterm-maxterm'
import { grayCodeRows, grayBitChanged, explainGrayCode } from '../../../education/explanations/gray-code'
import SectionCard from './SectionCard'
import Badge from './Badge'

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

      <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
        <table className="w-full text-xs sm:text-sm border-collapse min-w-[300px]">
          <thead>
            <tr style={{ color: 'var(--text-secondary)' }} className="text-left">
              {variables.map((v) => (
                <th key={v} className="px-2 py-1.5 border font-medium" style={{ borderColor: 'var(--border-color)' }}>
                  {v}
                </th>
              ))}
              <th className="px-2 py-1.5 border font-medium" style={{ borderColor: 'var(--border-color)' }}>F</th>
              <th className="px-2 py-1.5 border font-medium" style={{ borderColor: 'var(--border-color)' }}>#</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ minterm, bits, value }) => {
              const isActive = highlightedCell === minterm
              const isOn = value === 1
              return (
                <tr
                  key={minterm}
                  className="transition-colors cursor-pointer"
                  style={{
                    backgroundColor: isActive
                      ? 'var(--accent-bg)'
                      : isOn
                        ? 'var(--success-bg)'
                        : 'var(--bg-tertiary)',
                  }}
                  onClick={() => onSelectCell(minterm)}
                >
                  {Array.from(bits).map((bit, i) => (
                    <td key={i} className="px-2 py-1.5 border font-mono" style={{ borderColor: 'var(--border-color)' }}>
                      {bit}
                    </td>
                  ))}
                  <td
                    className="px-2 py-1.5 border font-mono font-bold"
                    style={{
                      borderColor: 'var(--border-color)',
                      color:
                        value === 1
                          ? 'var(--cell-1)'
                          : value === 0
                            ? 'var(--cell-0)'
                            : value === 'X'
                              ? 'var(--cell-x)'
                              : 'var(--cell-empty)',
                    }}
                  >
                    {value === null ? '—' : value}
                  </td>
                  <td className="px-2 py-1.5 border font-mono" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                    <Badge variant="neutral" size="xs" compact>m{minterm}</Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {rows.some((r) => r.value === null) && (
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          Empty cells (—) are treated as 0 for output; set them in the K-map to complete the
          function.
        </p>
      )}

      <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs">
        <span style={{ color: 'var(--text-secondary)' }}>
          Tap a row to match it to its K-map cell
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          Highlighted: {highlightedCell === null ? 'none' : `m${highlightedCell}`}
        </span>
      </div>

      <div className="mt-3 sm:mt-4 space-y-2">
        <button
          type="button"
          className="w-full rounded border px-3 py-2 text-left text-xs sm:text-sm transition-colors touch-action-manipulation"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
          onClick={() => {
            const firstOn = rows.find((r) => r.value === 1)
            if (firstOn) onSelectCell(firstOn.minterm)
          }}
          data-testid="truth-table-focus-minterm"
        >
          Focus first 1-minterm (the K-map cell used in {showSOP ? 'SOP' : 'this mode'})
        </button>

        <details className="group">
          <summary className="cursor-pointer rounded border px-3 py-2 text-xs sm:text-sm touch-action-manipulation" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-primary)' }}>
            Why are rows ordered {grayRows.map((g) => g.gray).join(', ')}? (Gray code)
          </summary>
          <div className="mt-2 space-y-2 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>{gray.summary}</p>
            <ul className="list-disc list-inside space-y-1">
              {grayRows.map((r, i) => (
                <li key={r.gray} className="text-xs">
                  <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{r.binary} → {r.gray}</span>
                  {i > 0 && (
                    <span style={{ color: 'var(--text-muted)' }}>
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
          className="mt-3 sm:mt-4 rounded-lg p-3 sm:p-4"
          style={{ border: '1px solid color-mix(in srgb, var(--accent-primary) 30%, transparent)', backgroundColor: 'var(--bg-tertiary)' }}
          data-testid="truth-table-row-explanation"
        >
          <h3 className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--accent-primary)' }}>
            Row m{selected.minterm} — why it is what it is
          </h3>
          <p className="mt-1 font-mono text-xs sm:text-sm" style={{ color: 'var(--text-primary)' }}>
            Binary <span style={{ color: 'var(--text-primary)' }}>{selected.binary}</span> →{' '}
            {selected.mintermTerm} (minterm) &amp; {selected.maxtermSum} (maxterm)
          </p>
          <ul className="mt-2 space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {selected.reasons.map((r, i) => (
              <li key={i} className="flex flex-col gap-0.5">
                <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                  {r.variable}={r.bit}: {r.mintermLiteral} / {r.maxtermLiteral}
                </span>
                <span className="pl-4">
                  <span style={{ color: 'var(--cell-1)' }}>SOP {r.mintermReason}.</span>{' '}
                  <span style={{ color: 'var(--cell-0)' }}>POS {r.maxtermReason}.</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  )
}
