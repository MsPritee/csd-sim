import type { TruthTableSpec } from '../../../concepts/sop-pos'
import KMapConnection from '../KMapConnection'

interface ToCellStepProps {
  mode: 'sop' | 'pos'
  spec: TruthTableSpec
  focusMinterms: readonly number[]
  labelMinterm?: number
}

export default function ToCellStep({ mode, spec, focusMinterms, labelMinterm }: ToCellStepProps) {
  return <KMapConnection mode={mode} spec={spec} focusMinterms={focusMinterms} labelMinterm={labelMinterm} />
}