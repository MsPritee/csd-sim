import { useState } from 'react'
import type { KMapModel } from '../../../core/kmap'
import { explainNeighbors } from '../../../education/adjacency'
import { explainRow } from '../../../education/explanations/minterm-maxterm'

interface CellInfoPopupProps {
  kmap: KMapModel
  minterm: number
  showSOP: boolean
  onClose: () => void
}

export default function CellInfoPopup({ kmap, minterm, showSOP, onClose }: CellInfoPopupProps) {
  const [closeHovered, setCloseHovered] = useState(false)
  const variables = kmap.layout.variables
  const cell = kmap.cells.flat().find((c) => c.minterm === minterm)
  if (!cell) return null

  const explanation = explainRow(variables, minterm)
  const termLabel = showSOP ? 'Product Term' : 'Sum Term'
  const termValue = showSOP ? explanation.mintermTerm : explanation.maxtermSum
  const isMinterm = cell.value === 1
  const isMaxterm = cell.value === 0

  const adjacent = explainNeighbors(kmap, minterm)

  return (
    <div className="mt-4 rounded-lg p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--accent-primary)', borderWidth: 1, borderStyle: 'solid' }}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--accent-secondary)' }}>Cell Information</h3>
        <button
          onClick={onClose}
          onMouseEnter={() => setCloseHovered(true)}
          onMouseLeave={() => setCloseHovered(false)}
          className="text-xl leading-none"
          style={{ color: closeHovered ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          ×
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Minterm:</span>
            <span className="font-mono" style={{ color: 'var(--text-primary)' }}>m{minterm}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Maxterm:</span>
            <span className="font-mono" style={{ color: 'var(--text-primary)' }}>M{minterm}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Binary:</span>
            <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{explanation.binary}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>{termLabel}:</span>
            <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{termValue}</span>
          </div>
        </div>

        <div className="pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
          <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-secondary)' }}>Variable States</h4>
          <div className="space-y-1">
            {explanation.reasons.map(({ variable, bit, mintermLiteral, maxtermLiteral, mintermReason, maxtermReason }) => {
              const literal = showSOP ? mintermLiteral : maxtermLiteral
              const reason = showSOP ? mintermReason : maxtermReason
              return (
                <div key={variable} className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>{variable}:</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: bit === 1 ? 'var(--success-bg)' : 'var(--error-bg)',
                        color: bit === 1 ? 'var(--cell-1)' : 'var(--cell-0)'
                      }}
                    >
                      {bit}
                    </span>
                    <span className="font-mono" style={{ color: 'var(--text-primary)' }}>→</span>
                    <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{literal}</span>
                    <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-muted)' }}>{reason}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Current Value:</span>
            <span
              className="font-mono"
              style={{
                color: cell.value === 1 ? 'var(--cell-1)' :
                  cell.value === 0 ? 'var(--cell-0)' :
                  cell.value === 'X' ? 'var(--cell-x)' : 'var(--cell-empty)'
              }}
            >
              {cell.value === null ? 'Empty' : cell.value}
            </span>
          </div>
          {isMinterm && (
            <p className="text-xs mt-1" style={{ color: 'var(--cell-1)' }}>This cell is a minterm (output = 1)</p>
          )}
          {isMaxterm && (
            <p className="text-xs mt-1" style={{ color: 'var(--cell-0)' }}>This cell is a maxterm (output = 0)</p>
          )}
        </div>

        {adjacent.length > 0 && (
          <div className="pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
            <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-secondary)' }}>Adjacent Cells</h4>
            <ul className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              {adjacent.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
          <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-secondary)' }}>Complementation Rules</h4>
          <div className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {showSOP ? (
              <>
                <p><span style={{ color: 'var(--cell-1)' }}>Bit = 1:</span> Variable is TRUE → keep as-is (e.g., A)</p>
                <p><span style={{ color: 'var(--cell-0)' }}>Bit = 0:</span> Variable is FALSE → complement (e.g., A')</p>
                <p className="mt-2" style={{ color: 'var(--cell-empty)' }}>
                  In SOP minterms, we complement 0s so the AND product equals 1 only for this row.
                </p>
              </>
            ) : (
              <>
                <p><span style={{ color: 'var(--cell-1)' }}>Bit = 1:</span> Variable is TRUE → complement (e.g., A')</p>
                <p><span style={{ color: 'var(--cell-0)' }}>Bit = 0:</span> Variable is FALSE → keep as-is (e.g., A)</p>
                <p className="mt-2" style={{ color: 'var(--cell-empty)' }}>
                  In POS maxterms, we complement 1s so the OR sum equals 0 only for this row.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
