/**
 * ExplanationPanel - Shows contextual explanations for each conversion step
 * Provides educational content about what's happening and why
 */

import { Card } from '../../components/ui/Card'

interface ExplanationPanelProps {
  readonly explanation: string
  readonly currentPhase: string
  readonly binaryValue: string
  readonly decimalResult: number
  readonly isComplete: boolean
}

export function ExplanationPanel({
  explanation,
  currentPhase,
  binaryValue,
  decimalResult,
  isComplete,
}: ExplanationPanelProps) {
  const getPhaseTitle = () => {
    switch (currentPhase) {
      case 'identify':
        return 'Step 1: Identify Binary Digits'
      case 'powers':
        return 'Step 2: Assign Powers of 2'
      case 'weights':
        return 'Step 3: Calculate Decimal Weights'
      case 'multiply':
        return 'Step 4: Multiply and Add'
      case 'add':
        return 'Step 5: Add Contributions'
      case 'result':
        return 'Conversion Complete!'
      default:
        return 'Current Step'
    }
  }

  return (
    <Card title={getPhaseTitle()}>
      <div className="p-4">
        <p className="text-base leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {explanation}
        </p>
        {isComplete && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--success-bg)' }}>
              <div className="text-2xl font-mono font-bold mb-2" style={{ color: 'var(--success-text)' }}>
                ({binaryValue})₂ = ({decimalResult})₁₀
              </div>
              <div className="text-sm" style={{ color: 'var(--success-text)' }}>
                Binary → Decimal conversion complete!
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
