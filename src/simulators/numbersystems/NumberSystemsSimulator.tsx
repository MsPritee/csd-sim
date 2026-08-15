/**
 * NumberSystemsSimulator - Main simulator component
 * Integrates conversion, comparison, and visualization for number systems
 */

import { useState } from 'react'
import type { NumberSystem } from '../../core/numbersystems/types'
import { NumberSystemSelector } from './NumberSystemSelector'
import { ConversionMatrix } from './ConversionMatrix'
import { AdvancedVisualization } from './AdvancedVisualization'
import { ConversionResult } from './ConversionResult'
import { PositionValueVisualizer } from './PositionValueVisualizer'
import { BitGroupingVisualizer } from './BitGroupingVisualizer'
import { ConversionAnimator } from './ConversionAnimator'
import { ConversionPractice } from './ConversionPractice'
import { ExplorationMode } from './ExplorationMode'
import { DecimalToBinaryVisualizer } from './DecimalToBinaryVisualizer'
import { BinaryToDecimalVisualizer } from './BinaryToDecimalVisualizer'
import { createBitGroupingSteps, createPositionValueSteps } from './AnimationAdapters'
import { Button, Input, Card } from '../../components/ui'
import {
  orchestrateConversion,
  calculatePositionValues,
} from '../../application/numbersystems/conversion'
import {
  compareAcrossAllSystems,
  createComparisonTable,
  generateConversionMatrix,
} from '../../application/numbersystems/comparison'

interface NumberSystemsSimulatorProps {
  onBackToHome: () => void
}

export function NumberSystemsSimulator({ onBackToHome }: NumberSystemsSimulatorProps) {
  const [showPracticeMode, setShowPracticeMode] = useState(false)
  const [showExplorationMode, setShowExplorationMode] = useState(false)
  const [showDecimalToBinaryVisualizer, setShowDecimalToBinaryVisualizer] = useState(false)
  const [showBinaryToDecimalVisualizer, setShowBinaryToDecimalVisualizer] = useState(false)
  const [fromSystem, setFromSystem] = useState<NumberSystem>('decimal')
  const [toSystem, setToSystem] = useState<NumberSystem>('binary')
  const [inputValue, setInputValue] = useState<string>('10')
  const [showMatrix, setShowMatrix] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showPositionValues, setShowPositionValues] = useState(false)
  const [showBitGrouping, setShowBitGrouping] = useState(false)
  const [useUnifiedAnimator, setUseUnifiedAnimator] = useState(false)
  const [conversionResult, setConversionResult] = useState<any>(null)
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [matrixData, setMatrixData] = useState<Record<string, string>>({})
  const [positionValueData, setPositionValueData] = useState<any>(null)
  const [binaryForGrouping, setBinaryForGrouping] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Practice mode - show separate component
  if (showPracticeMode) {
    return <ConversionPractice onBackToHome={() => setShowPracticeMode(false)} />
  }

  // Exploration mode - show separate component
  if (showExplorationMode) {
    return <ExplorationMode onBackToHome={() => setShowExplorationMode(false)} />
  }

  // Decimal to Binary Visualizer - show separate component
  if (showDecimalToBinaryVisualizer) {
    const decimalValue = parseInt(inputValue, 10)
    return (
      <div>
        <nav
          className="px-4 py-1.5 flex items-center gap-4 border-b"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
        >
          <Button
            variant="ghost"
            onClick={() => setShowDecimalToBinaryVisualizer(false)}
            className="font-medium"
          >
            Back to Converter
          </Button>
        </nav>
        <div className="division-mode light min-h-screen">
          <DecimalToBinaryVisualizer decimalValue={decimalValue} onBack={() => setShowDecimalToBinaryVisualizer(false)} />
        </div>
      </div>
    )
  }

  // Binary to Decimal Visualizer - show separate component
  if (showBinaryToDecimalVisualizer) {
    return (
      <div>
        <nav
          className="px-4 py-1.5 flex items-center gap-4 border-b"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
        >
          <Button
            variant="ghost"
            onClick={() => setShowBinaryToDecimalVisualizer(false)}
            className="font-medium"
          >
            Back to Converter
          </Button>
        </nav>
        <div
          className="min-h-screen p-6"
          style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        >
          <div className="max-w-6xl mx-auto">
            <BinaryToDecimalVisualizer binaryValue={inputValue} />
          </div>
        </div>
      </div>
    )
  }

  const handleConvert = () => {
    setLoading(true)

    // Perform conversion
    const result = orchestrateConversion({
      value: inputValue,
      fromSystem,
      toSystem,
      showSteps: true,
      useShortcuts: true,
    })

    setConversionResult(result)

    // Get comparison data
    const comparison = compareAcrossAllSystems({
      value: inputValue,
      baseSystem: fromSystem,
    })

    if (comparison.success) {
      const table = createComparisonTable(inputValue, fromSystem)
      if (table.success && table.data) {
        setComparisonData(table.data)
      }
    }

    // Generate conversion matrix if enabled
    if (showMatrix) {
      const matrix = generateConversionMatrix(inputValue, fromSystem)
      if (matrix.success && matrix.matrix) {
        setMatrixData(matrix.matrix)
      }
    }

    // Calculate position values if enabled and applicable
    if (showPositionValues && (fromSystem === 'binary' || fromSystem === 'octal' || fromSystem === 'hexadecimal')) {
      const positionValues = calculatePositionValues(inputValue, fromSystem)
      setPositionValueData(positionValues)
    }

    // Update bit grouping if already enabled
    if (showBitGrouping) {
      handleToggleBitGrouping()
    }

    setLoading(false)
  }

  const handleToggleMatrix = () => {
    setShowMatrix(!showMatrix)
    if (!showMatrix) {
      const matrix = generateConversionMatrix(inputValue, fromSystem)
      if (matrix.success && matrix.matrix) {
        setMatrixData(matrix.matrix)
      }
    }
  }

  const handleTogglePositionValues = () => {
    setShowPositionValues(!showPositionValues)
    if (!showPositionValues && (fromSystem === 'binary' || fromSystem === 'octal' || fromSystem === 'hexadecimal')) {
      const positionValues = calculatePositionValues(inputValue, fromSystem)
      setPositionValueData(positionValues)
    }
  }

  const handleToggleBitGrouping = () => {
    const newState = !showBitGrouping
    setShowBitGrouping(newState)
    
    if (newState) {
      // Prepare binary value for bit grouping
      let groupingBinary = ''
      if (fromSystem === 'binary') {
        groupingBinary = inputValue
      } else {
        // Convert to binary first
        const toBinary = orchestrateConversion({
          value: inputValue,
          fromSystem,
          toSystem: 'binary',
          showSteps: false,
        })
        if (toBinary.success && toBinary.result) {
          groupingBinary = toBinary.result
        }
      }
      setBinaryForGrouping(groupingBinary)
    }
  }

  return (
    <div>
      <nav
        className="px-4 py-1.5 flex items-center gap-4 border-b"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
      >
        <Button
          variant="ghost"
          onClick={onBackToHome}
          className="font-medium"
        >
          Back to Home
        </Button>
      </nav>
      <div
        className="min-h-screen p-6"
        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
      >
        <div className="max-w-6xl mx-auto space-y-6">
          <Card
            title="Number Systems Converter"
            subtitle="Convert between decimal, binary, hexadecimal, and octal number systems with step-by-step explanations."
          >
            <NumberSystemSelector
              fromSystem={fromSystem}
              toSystem={toSystem}
              onFromSystemChange={setFromSystem}
              onToSystemChange={setToSystem}
            />

            <div className="mt-6">
              <Input
                value={inputValue}
                onChange={setInputValue}
                onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
                placeholder={`Enter ${fromSystem} value`}
                label="Enter Value"
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={handleConvert}
                disabled={loading}
                loading={loading}
                variant="primary"
              >
                Convert
              </Button>

              <Button
                onClick={handleToggleMatrix}
                variant="secondary"
              >
                {showMatrix ? 'Hide Matrix' : 'Show Matrix'}
              </Button>

              <Button
                onClick={() => setShowAdvanced(!showAdvanced)}
                variant="success"
              >
                {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
              </Button>

              {(fromSystem === 'binary' || fromSystem === 'octal' || fromSystem === 'hexadecimal') && (
                <Button
                  onClick={handleTogglePositionValues}
                  variant="warning"
                >
                  {showPositionValues ? 'Hide Position Values' : 'Show Position Values'}
                </Button>
              )}

              <Button
                onClick={handleToggleBitGrouping}
                variant="secondary"
              >
                {showBitGrouping ? 'Hide Bit Grouping' : 'Show Bit Grouping'}
              </Button>

              <Button
                onClick={() => setUseUnifiedAnimator(!useUnifiedAnimator)}
                variant="secondary"
              >
                {useUnifiedAnimator ? 'Use Classic Animation' : 'Use Unified Animator'}
              </Button>

              {fromSystem === 'decimal' && toSystem === 'binary' && (
                <Button
                  onClick={() => setShowDecimalToBinaryVisualizer(true)}
                  variant="success"
                >
                  Visual Division Mode
                </Button>
              )}

              {fromSystem === 'binary' && toSystem === 'decimal' && (
                <Button
                  onClick={() => setShowBinaryToDecimalVisualizer(true)}
                  variant="success"
                >
                  Visual Position Mode
                </Button>
              )}

              <Button
                onClick={() => setShowPracticeMode(true)}
                variant="success"
              >
                Practice Mode
              </Button>

              <Button
                onClick={() => setShowExplorationMode(true)}
                variant="secondary"
              >
                Exploration Mode
              </Button>
            </div>
          </Card>

          {/* Conversion Result */}
          <ConversionResult
            fromSystem={fromSystem}
            toSystem={toSystem}
            inputValue={inputValue}
            result={conversionResult}
          />

          {/* Conversion Matrix */}
          {showMatrix && (
            <ConversionMatrix
              value={inputValue}
              baseSystem={fromSystem}
              matrix={matrixData}
              loading={loading}
            />
          )}

          {/* Advanced Visualization */}
          {showAdvanced && comparisonData && (
            <AdvancedVisualization
              binary={comparisonData.binary}
              hexadecimal={comparisonData.hexadecimal}
              octal={comparisonData.octal}
              bitGrouping={{
                success: true,
                nibbles: comparisonData.nibbles.map((n: string) => ({
                  bits: n.split('').map((b: string) => (b === '1' ? 1 : 0)) as any,
                  hexDigit: parseInt(n, 16).toString(16).toUpperCase() as any,
                  decimalValue: parseInt(n, 16),
                })),
                octalGroups: comparisonData.octalGroups,
                groupedBinary: comparisonData.binaryGrouped,
              }}
              bitAnalysis={{
                bitCount: comparisonData.bitLength,
                onesCount: comparisonData.onesCount,
                zerosCount: comparisonData.zerosCount,
                isPowerOfTwo: comparisonData.isPowerOfTwo,
              }}
            />
          )}

          {/* Position Value Visualizer */}
          {showPositionValues && positionValueData && (fromSystem === 'binary' || fromSystem === 'octal' || fromSystem === 'hexadecimal') && !useUnifiedAnimator && (
            <PositionValueVisualizer
              positionData={positionValueData}
              fromSystem={fromSystem as 'binary' | 'octal' | 'hexadecimal'}
            />
          )}

          {/* Bit Grouping Visualizer */}
          {showBitGrouping && binaryForGrouping && !useUnifiedAnimator && (
            <BitGroupingVisualizer
              binaryValue={binaryForGrouping}
              targetSystem="hexadecimal"
            />
          )}

          {/* Unified Animator */}
          {useUnifiedAnimator && (
            <>
              {showPositionValues && positionValueData && (fromSystem === 'binary' || fromSystem === 'octal' || fromSystem === 'hexadecimal') && (
                <ConversionAnimator
                  conversionType="position-value"
                  steps={createPositionValueSteps(positionValueData, fromSystem as 'binary' | 'octal' | 'hexadecimal')}
                  initialSpeed={1}
                  showTimeline={true}
                  showSpeedControl={true}
                  enableKeyboardShortcuts={true}
                />
              )}

              {showBitGrouping && binaryForGrouping && (
                <ConversionAnimator
                  conversionType="bit-grouping"
                  steps={createBitGroupingSteps(binaryForGrouping, 'hexadecimal')}
                  initialSpeed={1}
                  showTimeline={true}
                  showSpeedControl={true}
                  enableKeyboardShortcuts={true}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
