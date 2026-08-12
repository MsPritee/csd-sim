import type { TruthTableSpec } from '../../../concepts/sop-pos'
import KMapConnection from '../KMapConnection'
import ReasonChain from './ReasonChain'

interface GroupStepProps {
  mode: 'sop' | 'pos'
  spec: TruthTableSpec
  focusMinterms: readonly number[]
  reasonLabels: readonly string[]
  tone: 'green' | 'red'
}

export default function GroupStep({ mode, spec, focusMinterms, reasonLabels, tone }: GroupStepProps) {
  return (
    <div className="space-y-3">
      <KMapConnection mode={mode} spec={spec} focusMinterms={focusMinterms} />
      <ReasonChain labels={reasonLabels} tone={tone} />
    </div>
  )
}