import type { KMapModel } from '../../../core/kmap'
import { mintermToString } from '../../../core/boolean'
import { explainNeighbors } from '../../../education/adjacency'

interface CellInfoPopupProps {
  kmap: KMapModel
  minterm: number
  onClose: () => void
}

export default function CellInfoPopup({ kmap, minterm, onClose }: CellInfoPopupProps) {
  const variables = kmap.layout.variables
  const cell = kmap.cells.flat().find((c) => c.minterm === minterm)
  if (!cell) return null

  const binaryString = minterm.toString(2).padStart(variables.length, '0')
  const productTerm = mintermToString(variables, minterm)
  const isMinterm = cell.value === 1
  const isMaxterm = cell.value === 0

  const variableStates = variables.map((variable, index) => {
    const bit = (minterm >> (variables.length - 1 - index)) & 1
    const isComplemented = bit === 0
    return {
      variable,
      bit,
      isComplemented,
      literal: isComplemented ? `${variable}'` : variable,
    }
  })

  const adjacent = explainNeighbors(kmap, minterm)

  return (
    <div className="mt-4 bg-slate-800 rounded-lg p-4 border border-violet-500/30">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-violet-300">Cell Information</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xl leading-none"
        >
          ×
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Minterm:</span>
            <span className="text-white font-mono">m{minterm}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Maxterm:</span>
            <span className="text-white font-mono">M{minterm}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Binary:</span>
            <span className="text-white font-mono">{binaryString}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Product Term:</span>
            <span className="text-white font-mono">{productTerm}</span>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-3">
          <h4 className="text-violet-300 font-semibold mb-2">Variable States</h4>
          <div className="space-y-1">
            {variableStates.map(({ variable, bit, literal }) => (
              <div key={variable} className="flex items-center justify-between">
                <span className="text-slate-400">{variable}:</span>
                <div className="flex items-center gap-2">
                  <span className={`font-mono px-2 py-0.5 rounded ${
                    bit === 1
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-red-900/50 text-red-400'
                  }`}>
                    {bit}
                  </span>
                  <span className="text-white font-mono">→</span>
                  <span className="text-white font-mono">{literal}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-700 pt-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Current Value:</span>
            <span className={`font-mono ${
              cell.value === 1 ? 'text-green-400' :
              cell.value === 0 ? 'text-red-400' :
              cell.value === 'X' ? 'text-yellow-400' : 'text-slate-500'
            }`}>
              {cell.value === null ? 'Empty' : cell.value}
            </span>
          </div>
          {isMinterm && (
            <p className="text-green-400 text-xs mt-1">This cell is a minterm (output = 1)</p>
          )}
          {isMaxterm && (
            <p className="text-red-400 text-xs mt-1">This cell is a maxterm (output = 0)</p>
          )}
        </div>

        {adjacent.length > 0 && (
          <div className="border-t border-slate-700 pt-3">
            <h4 className="text-violet-300 font-semibold mb-2">Adjacent Cells</h4>
            <ul className="space-y-1 text-xs text-slate-400">
              {adjacent.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t border-slate-700 pt-3">
          <h4 className="text-violet-300 font-semibold mb-2">Complementation Rules</h4>
          <div className="space-y-1 text-xs text-slate-400">
            <p><span className="text-green-400">Bit = 1:</span> Variable is TRUE → uncomplemented (e.g., A)</p>
            <p><span className="text-red-400">Bit = 0:</span> Variable is FALSE → complemented (e.g., A')</p>
            <p className="mt-2 text-slate-500">
              In SOP: 0 becomes A' because we need the term to be true when A=0
            </p>
            <p className="text-slate-500">
              In POS: 0 becomes A because we want the sum to be 0 when A=0
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}