import type { DivisionStep } from '../../core/numbersystems/types'
import { DivisionRow } from './DivisionRow'

interface DivisionTableProps { readonly steps: readonly DivisionStep[]; readonly currentStep: number; readonly selectedStep: number | null; readonly onSelectStep: (index: number) => void; readonly targetBase: 2 | 8 | 16; readonly decimalValue: number }

export function DivisionTable({ steps, currentStep, selectedStep, onSelectStep, targetBase }: DivisionTableProps) {
  return <div className="dv-table-wrap"><div className="dv-table-head"><span>Divide By {targetBase}</span><span>Dividend<br /><small>(Current Number)</small></span><span>Quotient<br /><small>(Next Number)</small></span><span>Remainder<br /><small>(Binary Digit)</small></span></div><div className="dv-table-rows">{steps.map((step, index) => <DivisionRow key={step.stepNumber} step={step} isActive={index === currentStep} isCompleted={index <= currentStep} isSelected={selectedStep === index} onSelect={() => onSelectStep(index)} targetBase={targetBase} />)}</div><div className="dv-stop">Stop (Quotient = 0)</div><div className="dv-vertical-read"><span>↑</span><b>Read<br />Remainders<br />Bottom<br />to<br />Top</b></div></div>
}
