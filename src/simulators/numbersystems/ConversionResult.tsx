/**
 * ConversionResult - Displays the result of a number system conversion
 * Shows input, output, steps, explanations, and shortcuts
 * Enhanced with visual mode toggle and integrated visualizers
 */

import { useState } from 'react'
import type { NumberSystem } from '../../core/numbersystems/types'
import { Card } from '../../components/ui'
import { Alert } from '../../components/ui'
import { Button } from '../../components/ui'
import { DivisionStepsVisualizer } from './DivisionStepsVisualizer'
import { ConversionAnimator } from './ConversionAnimator'
import { createDivisionSteps, createBitGroupingSteps, createPositionValueSteps } from './AnimationAdapters'
import { calculatePositionValues } from '../../application/numbersystems'

type DisplayMode = 'text' | 'visual'

interface ConversionResultProps {
  readonly fromSystem: NumberSystem
  readonly toSystem: NumberSystem
  readonly inputValue: string
  readonly result: any
}

export function ConversionResult({
  fromSystem,
  toSystem,
  inputValue,
  result,
}: ConversionResultProps) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('text')
  const [positionValueData, setPositionValueData] = useState<any>(null)
  const [binaryForGrouping, setBinaryForGrouping] = useState<string>('')

  if (!result) {
    return null
  }

  // Determine which visualizations are available
  const hasDivisionSteps = result.divisionSteps && result.divisionSteps.steps
  const isToDecimal = toSystem === 'decimal'
  const canShowPositionValue = (fromSystem === 'binary' || fromSystem === 'octal' || fromSystem === 'hexadecimal') && isToDecimal
  const canShowBitGrouping = (fromSystem === 'binary' || toSystem === 'binary')

  // Prepare data for visualizations
  const preparePositionValueData = () => {
    if (canShowPositionValue && !positionValueData) {
      const data = calculatePositionValues(inputValue, fromSystem as 'binary' | 'octal' | 'hexadecimal')
      setPositionValueData(data)
    }
  }

  const prepareBinaryForGrouping = () => {
    if (canShowBitGrouping && !binaryForGrouping) {
      let groupingBinary = ''
      if (fromSystem === 'binary') {
        groupingBinary = inputValue
      } else if (toSystem === 'binary' && result.result) {
        groupingBinary = result.result
      }
      setBinaryForGrouping(groupingBinary)
    }
  }

  // Load visualization data when switching to visual mode
  const handleModeChange = (newMode: DisplayMode) => {
    setDisplayMode(newMode)
    if (newMode === 'visual') {
      preparePositionValueData()
      prepareBinaryForGrouping()
    }
  }

  const getVisualizationContent = () => {
    if (displayMode === 'text') {
      return (
        <div className="space-y-4">
          {result.steps && result.steps.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Conversion Steps</h3>
              <div
                className="p-4 rounded-md border"
                style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}
              >
                <ol className="list-decimal list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {result.steps.map((step: string, index: number) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {result.explanation && (
            <div>
              <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Explanation</h3>
              <Alert variant="info">
                <p className="text-sm whitespace-pre-line">{result.explanation}</p>
              </Alert>
            </div>
          )}

          {result.shortcuts && result.shortcuts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Conversion Shortcuts</h3>
              <div className="space-y-2">
                {result.shortcuts.map((shortcut: any, index: number) => (
                  <Alert key={index} variant="warning">
                    <div className="font-medium mb-1">{shortcut.name}</div>
                    <div className="text-sm mb-2">{shortcut.description}</div>
                    <div className="text-xs">
                      Example: {shortcut.examples[0]?.input} → {shortcut.examples[0]?.output}
                    </div>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {result.divisionSteps && (
            <DivisionStepsVisualizer
              steps={result.divisionSteps.steps}
              targetBase={result.divisionSteps.targetBase}
              decimalValue={result.divisionSteps.decimalValue}
              result={result.divisionSteps.result}
            />
          )}
        </div>
      )
    }

    // Visual mode
    return (
      <div className="space-y-4">
        {hasDivisionSteps && result.divisionSteps && (
          <ConversionAnimator
            conversionType="division"
            steps={createDivisionSteps(
              result.divisionSteps.steps,
              result.divisionSteps.targetBase,
              result.divisionSteps.decimalValue,
              result.divisionSteps.result
            )}
            initialSpeed={1}
            showTimeline={true}
            showSpeedControl={true}
            enableKeyboardShortcuts={true}
          />
        )}

        {canShowPositionValue && positionValueData && positionValueData.success && (
          <ConversionAnimator
            conversionType="position-value"
            steps={createPositionValueSteps(positionValueData, fromSystem as 'binary' | 'octal' | 'hexadecimal')}
            initialSpeed={1}
            showTimeline={true}
            showSpeedControl={true}
            enableKeyboardShortcuts={true}
          />
        )}

        {canShowBitGrouping && binaryForGrouping && (
          <ConversionAnimator
            conversionType="bit-grouping"
            steps={createBitGroupingSteps(binaryForGrouping, 'hexadecimal')}
            initialSpeed={1}
            showTimeline={true}
            showSpeedControl={true}
            enableKeyboardShortcuts={true}
          />
        )}

        {!hasDivisionSteps && !canShowPositionValue && !canShowBitGrouping && (
          <Alert variant="info">
            <div className="text-sm">No visualizations available for this conversion type.</div>
          </Alert>
        )}
      </div>
    )
  }

  return (
    <Card title="Conversion Result">
      {result.success ? (
        <div className="space-y-4">
          {/* Input/Result Display */}
          <div
            className="flex items-center gap-4 p-4 rounded-md border"
            style={{ backgroundColor: 'var(--success-bg)', borderColor: 'var(--success-border)' }}
          >
            <div className="flex-1">
              <div className="text-sm mb-1" style={{ color: 'var(--success-text)' }}>Input ({fromSystem})</div>
              <div className="text-2xl font-mono font-bold" style={{ color: 'var(--success-text)' }}>
                {inputValue}
              </div>
            </div>

            <svg
              className="w-8 h-8"
              style={{ color: 'var(--success-text)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>

            <div className="flex-1">
              <div className="text-sm mb-1" style={{ color: 'var(--accent-primary)' }}>Result ({toSystem})</div>
              <div className="text-2xl font-mono font-bold" style={{ color: 'var(--accent-primary)' }}>
                {result.result}
              </div>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2 p-3 rounded-md" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Display Mode:
            </span>
            <Button
              onClick={() => handleModeChange('text')}
              variant={displayMode === 'text' ? 'primary' : 'secondary'}
              size="sm"
            >
              📝 Text Mode
            </Button>
            <Button
              onClick={() => handleModeChange('visual')}
              variant={displayMode === 'visual' ? 'primary' : 'secondary'}
              size="sm"
            >
              🎨 Visual Mode
            </Button>
          </div>

          {/* Content based on mode */}
          {getVisualizationContent()}
        </div>
      ) : (
        <Alert variant="error">
          <div className="font-medium">Conversion Failed</div>
          <div className="text-sm mt-1">{result.error}</div>
        </Alert>
      )}
    </Card>
  )
}
