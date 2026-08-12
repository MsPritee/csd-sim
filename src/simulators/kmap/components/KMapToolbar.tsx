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
    <div className="rounded-lg p-6 mb-6 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Variables</label>
          <select
            value={variableCount}
            onChange={(e) => onVariableCountChange(Number(e.target.value) as 2 | 3 | 4)}
            className="rounded px-3 py-2 transition-colors"
            style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            <option value={2}>2 Variables (A, B)</option>
            <option value={3}>3 Variables (A, B, C)</option>
            <option value={4}>4 Variables (A, B, C, D)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Cell Value</label>
          <div className="flex gap-2">
            {[0, 1, 'X'].map((val) => (
              <button
                key={val}
                onClick={() => onCurrentValueChange(val as CellValue)}
                className="px-3 py-2 rounded transition-colors"
                style={{
                  backgroundColor: currentValue === val ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: currentValue === val ? '#ffffff' : 'var(--text-secondary)'
                }}
                onMouseEnter={(e) => {
                  if (currentValue !== val) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentValue !== val) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  }
                }}
              >
                {val === 'X' ? 'X' : val}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Display</label>
          <button
            onClick={onToggleMintermNumbers}
            className="px-3 py-2 rounded transition-colors"
            style={{
              backgroundColor: showMintermNumbers ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: showMintermNumbers ? '#ffffff' : 'var(--text-secondary)'
            }}
            onMouseEnter={(e) => {
              if (!showMintermNumbers) {
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!showMintermNumbers) {
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              }
            }}
          >
            {showMintermNumbers ? 'Hide Numbers' : 'Show Numbers'}
          </button>
        </div>

        <button
          onClick={onClear}
          className="px-4 py-2 rounded text-white ml-auto transition-colors"
          style={{ backgroundColor: '#dc2626' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
        >
          Clear K-Map
        </button>
      </div>
    </div>
  )
}