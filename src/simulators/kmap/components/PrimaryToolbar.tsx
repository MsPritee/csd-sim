import type { CellValue } from '../../../core/kmap'
import ValuePill from './ValuePill'
import CompactSelect from './CompactSelect'

interface PrimaryToolbarProps {
  variableCount: 2 | 3 | 4 | 5
  currentValue: CellValue
  onVariableCountChange: (count: 2 | 3 | 4 | 5) => void
  onCurrentValueChange: (value: CellValue) => void
}

const VALUE_OPTIONS = [
  { value: 0, label: '0' },
  { value: 1, label: '1' },
  { value: 'X', label: 'X' },
] as const

const VARIABLE_OPTIONS = [
  { value: 2, label: '2 Variables' },
  { value: 3, label: '3 Variables' },
  { value: 4, label: '4 Variables' },
  { value: 5, label: '5 Variables' },
] as const

export default function PrimaryToolbar({
  variableCount,
  currentValue,
  onVariableCountChange,
  onCurrentValueChange,
}: PrimaryToolbarProps) {
  return (
    <div className="flex flex-wrap gap-3 sm:gap-4 items-center px-1 sm:px-2">
      <div className="flex items-center gap-2 flex-shrink-0">
        <label className="text-xs sm:text-sm whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>Variables:</label>
        <CompactSelect
          value={variableCount}
          onChange={(val) => onVariableCountChange(Number(val) as 2 | 3 | 4 | 5)}
          options={VARIABLE_OPTIONS}
          title="Select number of variables"
        />
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <label className="text-xs sm:text-sm whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>Value:</label>
        <ValuePill
          options={VALUE_OPTIONS}
          value={currentValue ?? '—'}
          onChange={(val) => onCurrentValueChange(val as CellValue)}
          size="md"
          tooltip="Select cell value to place"
        />
      </div>
    </div>
  )
}
