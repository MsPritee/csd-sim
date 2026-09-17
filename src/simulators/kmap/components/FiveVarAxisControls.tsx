import CompactSelect from './CompactSelect'
import SegmentedControl from './SegmentedControl'

interface FiveVarAxisControlsProps {
  variables: readonly string[]
  planeVar: string
  onPlaneVarChange: (v: string) => void
  swapAxes: boolean
  onSwapAxesChange: (swapped: boolean) => void
}

/**
 * Compact "Layout" control for the 5-variable plane view: which variable
 * separates the two planes (dropdown) and which variables run along the rows
 * vs columns (segmented toggle that shows the actual split). The model rebuild
 * happens in the simulator via applyAssignment.
 */
export default function FiveVarAxisControls({
  variables,
  planeVar,
  onPlaneVarChange,
  swapAxes,
  onSwapAxesChange,
}: FiveVarAxisControlsProps) {
  const selected = variables.includes(planeVar)
    ? planeVar
    : (variables[variables.length - 1] ?? '')
  const remaining = variables.filter((v) => v !== selected)
  const normalRows = remaining.slice(0, 2).join(' ')
  const normalCols = remaining.slice(2).join(' ')

  const planeOptions = variables.map((v) => ({ value: v, label: v }))

  const splitSegments = [
    { value: 'rows', label: `Rows ${normalRows} · Cols ${normalCols}` },
    { value: 'cols', label: `Rows ${normalCols} · Cols ${normalRows}` },
  ]

  return (
    <div className="flex flex-wrap gap-control-group items-center flex-shrink-0">
      <div className="flex items-center gap-2 flex-shrink-0">
        <label
          className="text-xs sm:text-sm whitespace-nowrap"
          style={{ color: 'var(--text-secondary)' }}
        >
          Layout:
        </label>
        <CompactSelect
          value={selected}
          onChange={(val) => onPlaneVarChange(val)}
          options={planeOptions}
          title="Choose which variable separates the two K-map planes"
        />
      </div>
      <SegmentedControl
        size="sm"
        options={splitSegments}
        value={swapAxes ? 'cols' : 'rows'}
        onChange={(val) => onSwapAxesChange(val === 'cols')}
      />
    </div>
  )
}