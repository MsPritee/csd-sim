/**
 * RunningTotalPanel - Shows the running total as contributions are added
 * Displays the addition process step by step
 */

import { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card'

interface RunningTotalPanelProps {
  readonly runningTotal: number
  readonly currentStep: number
  readonly totalSteps: number
  readonly binaryValue: string
  readonly steps: readonly any[]
}

export function RunningTotalPanel({
  runningTotal,
  currentStep,
  totalSteps,
  binaryValue,
  steps,
}: RunningTotalPanelProps) {
  const [displayTotal, setDisplayTotal] = useState(runningTotal)
  const [isAnimating, setIsAnimating] = useState(false)

  // Animate number changes
  useEffect(() => {
    if (displayTotal !== runningTotal) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setDisplayTotal(runningTotal)
        setIsAnimating(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [runningTotal, displayTotal])

  const bits = binaryValue.split('')
  const contributions = bits.map((bit, i) => {
    const position = bits.length - 1 - i
    const weight = Math.pow(2, position)
    return bit === '1' ? weight : 0
  }).filter(c => c > 0)

  const completedSteps = steps.slice(0, currentStep + 1)
  const completedContributions = completedSteps
    .filter(s => s.contribution > 0)
    .map(s => s.contribution)

  return (
    <Card title="Running Total">
      <div className="space-y-3">
        {/* Current Total Display */}
        <div className="text-center p-4 rounded-lg border-2 transition-all-smooth" style={{ 
          backgroundColor: 'var(--success-bg)',
          borderColor: '#059669'
        }}>
          <div className="text-xs font-bold mb-1" style={{ color: 'var(--success-text)' }}>
            Current Total
          </div>
          <div className={`text-4xl font-mono font-bold ${isAnimating ? 'animate-number-count' : ''}`} style={{ color: 'var(--success-text)' }}>
            {displayTotal}
          </div>
        </div>

        {/* Addition Process */}
        {completedContributions.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              Addition Process
            </div>
            <div className="font-mono text-sm p-3 rounded-lg border-2" style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)'
            }}>
              {completedContributions.length > 1 ? (
                <div>
                  {completedContributions.slice(0, -1).join(' + ')} + {completedContributions[completedContributions.length - 1]} = <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>{runningTotal}</span>
                </div>
              ) : (
                <div>
                  {completedContributions[0]} = <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>{runningTotal}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Simplified Expression */}
        {contributions.length > 0 && currentStep === totalSteps - 1 && (
          <div className="space-y-2">
            <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
              Simplified Expression
            </div>
            <div className="font-mono text-sm p-3 rounded-lg border-2" style={{ 
              backgroundColor: 'var(--bg-tertiary)', 
              color: 'var(--accent-primary)',
              borderColor: 'var(--accent-primary)'
            }}>
              {contributions.join(' + ')} = <span className="font-bold">{runningTotal}</span>
            </div>
          </div>
        )}

        {/* Zero Contributions Note */}
        {contributions.length < bits.length && (
          <div className="text-xs p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
            ℹ️ Positions with 0 contribute 0 and are not shown in the addition.
          </div>
        )}
      </div>
    </Card>
  )
}
