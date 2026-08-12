import type { InputState } from '../../../concepts/sop-pos'
import VariableTransformation from '../VariableTransformation'
import GateExplanation from '../GateExplanation'

interface TransformationStepProps {
  mode: 'sop' | 'pos'
  input: InputState
}

export default function TransformationStep({ mode, input }: TransformationStepProps) {
  return (
    <div className="space-y-4">
      <VariableTransformation mode={mode} input={input} />
      <GateExplanation mode={mode} input={input} />
    </div>
  )
}