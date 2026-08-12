import type { CellValue } from '../../../core/kmap'

interface KMapToolbarProps {
  variableCount: 2 | 3 | 4
  currentValue: CellValue
  showMintermNumbers: boolean
  onVariableCountChange: (count: 2 | 3 | 4) => void
  onCurrentValueChange: (value: CellValue) => void
  onToggleMintermNumbers: () => void
  onClear: () => void
}

export default function KMapToolbar({
  variableCount,
  currentValue,
  showMintermNumbers,
  onVariableCountChange,
  onCurrentValueChange,
  onToggleMintermNumbers,
  onClear,
}: KMapToolbarProps) {
  return (
    <div className="bg-slate-900 rounded-lg p-6 mb-6 border border-slate-700">
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Variables</label>
          <select
            value={variableCount}
            onChange={(e) => onVariableCountChange(Number(e.target.value) as 2 | 3 | 4)}
            className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
          >
            <option value={2}>2 Variables (A, B)</option>
            <option value={3}>3 Variables (A, B, C)</option>
            <option value={4}>4 Variables (A, B, C, D)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Cell Value</label>
          <div className="flex gap-2">
            {[0, 1, 'X'].map((val) => (
              <button
                key={val}
                onClick={() => onCurrentValueChange(val as CellValue)}
                className={`px-3 py-2 rounded ${
                  currentValue === val
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {val === 'X' ? 'X' : val}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Display</label>
          <button
            onClick={onToggleMintermNumbers}
            className={`px-3 py-2 rounded ${
              showMintermNumbers
                ? 'bg-violet-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {showMintermNumbers ? 'Hide Numbers' : 'Show Numbers'}
          </button>
        </div>

        <button
          onClick={onClear}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white ml-auto"
        >
          Clear K-Map
        </button>
      </div>
    </div>
  )
}