/**
 * ExplorationMode - Interactive playground for number system exploration
 * Provides free exploration with real-time visualizations and method comparison
 */

import { useState, useEffect } from 'react'
import type { NumberSystem } from '../../core/numbersystems/types'
import { Card } from '../../components/ui'
import { Button, Input } from '../../components/ui'
import { NumberSystemSelector } from './NumberSystemSelector'
import {
  orchestrateConversion,
  calculatePositionValues,
  compareAcrossAllSystems,
  createComparisonTable,
} from '../../application/numbersystems'
import { generateDivisionSteps } from '../../core/numbersystems/binary'
import type { DivisionStep } from '../../core/numbersystems/types'

interface ExplorationModeProps {
  onBackToHome: () => void
}

type ComparisonMethod = 'division' | 'position-value' | 'bit-grouping' | 'all'

export function ExplorationMode({ onBackToHome }: ExplorationModeProps) {
  const [fromSystem, setFromSystem] = useState<NumberSystem>('decimal')
  const [toSystem, setToSystem] = useState<NumberSystem>('binary')
  const [inputValue, setInputValue] = useState<string>('42')
  const [debouncedValue, setDebouncedValue] = useState<string>('42')
  const [comparisonMethod, setComparisonMethod] = useState<ComparisonMethod>('all')
  const [showTooltips, setShowTooltips] = useState(true)

  // Live conversion results
  const [conversionResult, setConversionResult] = useState<any>(null)
  const [divisionSteps, setDivisionSteps] = useState<readonly DivisionStep[]>([])
  const [positionValueData, setPositionValueData] = useState<any>(null)
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [binaryForGrouping, setBinaryForGrouping] = useState<string>('')

  // Debounce input for performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue)
    }, 300) // 300ms debounce
    return () => clearTimeout(timer)
  }, [inputValue])

  // Perform live conversions when debounced value changes
  useEffect(() => {
    if (!debouncedValue) {
      setConversionResult(null)
      setDivisionSteps([])
      setPositionValueData(null)
      setComparisonData(null)
      setBinaryForGrouping('')
      return
    }

    // Perform main conversion
    const result = orchestrateConversion({
      value: debouncedValue,
      fromSystem,
      toSystem,
      showSteps: true,
      useShortcuts: true,
    })
    setConversionResult(result)

    // Generate division steps for decimal conversions
    if (fromSystem === 'decimal' && (toSystem === 'binary' || toSystem === 'octal' || toSystem === 'hexadecimal')) {
      const decimalValue = parseInt(debouncedValue, 10)
      const targetBase = toSystem === 'binary' ? 2 : toSystem === 'octal' ? 8 : 16
      const steps = generateDivisionSteps(decimalValue, targetBase)
      if (steps.success) {
        setDivisionSteps(steps.steps)
      }
    } else {
      setDivisionSteps([])
    }

    // Calculate position values for non-decimal inputs
    if (fromSystem !== 'decimal') {
      const positionValues = calculatePositionValues(debouncedValue, fromSystem)
      setPositionValueData(positionValues)
    } else {
      setPositionValueData(null)
    }

    // Get comparison data
    const comparison = compareAcrossAllSystems({
      value: debouncedValue,
      baseSystem: fromSystem,
    })
    if (comparison.success) {
      const table = createComparisonTable(debouncedValue, fromSystem)
      if (table.success && table.data) {
        setComparisonData(table.data)
      }
    }

    // Prepare binary for bit grouping
    let groupingBinary = ''
    if (fromSystem === 'binary') {
      groupingBinary = debouncedValue
    } else {
      const toBinary = orchestrateConversion({
        value: debouncedValue,
        fromSystem,
        toSystem: 'binary',
        showSteps: false,
      })
      if (toBinary.success && toBinary.result) {
        groupingBinary = toBinary.result
      }
    }
    setBinaryForGrouping(groupingBinary)
  }, [debouncedValue, fromSystem, toSystem])

  const formatRemainder = (remainder: number, targetBase: number) => {
    if (targetBase === 16 && remainder >= 10) {
      return remainder.toString(16).toUpperCase()
    }
    return remainder.toString()
  }

  const getPositionLabel = (index: number, totalSteps: number) => {
    const fromBottom = totalSteps - 1 - index
    if (fromBottom === 0) return 'MSB (Most Significant Bit)'
    if (fromBottom === totalSteps - 1) return 'LSB (Least Significant Bit)'
    return `Position ${fromBottom + 1} from right`
  }

  const renderDivisionTable = () => {
    if (divisionSteps.length === 0) return null

    const targetBase = toSystem === 'binary' ? 2 : toSystem === 'octal' ? 8 : 16

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                Number
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                ÷ {targetBase}
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                Quotient
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                Remainder
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}>
                Position
              </th>
            </tr>
          </thead>
          <tbody>
            {divisionSteps.map((step, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <td className="px-4 py-2 font-mono font-bold">{step.dividend}</td>
                <td className="px-4 py-2 font-mono">{step.divisor}</td>
                <td className="px-4 py-2 font-mono">{step.quotient}</td>
                <td className="px-4 py-2 font-mono font-bold">{formatRemainder(step.remainder, targetBase)}</td>
                <td className="px-4 py-2 text-sm">{getPositionLabel(index, divisionSteps.length)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderPositionValues = () => {
    if (!positionValueData?.success) return null

    const base = fromSystem === 'binary' ? 2 : fromSystem === 'octal' ? 8 : 16

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th className="px-4 py-2 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Digit
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Position
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Value ({base}^n)
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Calculation
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Contribution
              </th>
            </tr>
          </thead>
          <tbody>
            {positionValueData.positions.map((pos: any, index: number) => (
              <tr
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md font-mono font-bold text-lg"
                    style={{
                      backgroundColor: pos.contribution > 0 ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                      color: pos.contribution > 0 ? 'var(--success-text)' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    {pos.digit}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-primary)' }}>
                  {pos.position}
                </td>
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-primary)' }}>
                  {base}^{pos.position} = {pos.positionValue}
                </td>
                <td className="px-4 py-3 font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
                  {pos.calculation}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="font-mono font-bold"
                    style={{
                      color: pos.contribution > 0 ? 'var(--success-text)' : 'var(--text-muted)',
                      backgroundColor: pos.contribution > 0 ? 'var(--success-bg)' : 'transparent',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {pos.contribution}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div
          className="mt-4 p-4 rounded-md border"
          style={{
            backgroundColor: 'var(--success-bg)',
            borderColor: 'var(--success-border)',
          }}
        >
          <div className="font-mono text-lg font-bold" style={{ color: 'var(--success-text)' }}>
            {positionValueData.calculation}
          </div>
        </div>
      </div>
    )
  }

  const renderBitGrouping = () => {
    if (!binaryForGrouping) return null

    const bits = binaryForGrouping.split('').map(b => (b === '1' ? 1 : 0))
    const groupSize = 4 // Hexadecimal grouping
    const paddedLength = Math.ceil(bits.length / groupSize) * groupSize
    const paddedBits = [...Array(paddedLength - bits.length).fill(0), ...bits]
    const needsPadding = bits.length % groupSize !== 0

    const groups: Array<{
      bits: number[]
      groupIndex: number
      convertedValue: string
      decimalValue: number
    }> = []

    for (let i = 0; i < paddedBits.length; i += groupSize) {
      const groupBits = paddedBits.slice(i, i + groupSize)
      let decimalValue = 0
      for (let j = 0; j < groupBits.length; j++) {
        decimalValue = decimalValue * 2 + groupBits[j]!
      }
      const convertedValue = decimalValue.toString(16).toUpperCase()

      groups.push({
        bits: groupBits,
        groupIndex: i / groupSize,
        convertedValue,
        decimalValue,
      })
    }

    return (
      <div className="space-y-4">
        {/* Original Binary */}
        <div className="p-4 rounded-md border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Binary: {binaryForGrouping}
          </div>
          <div className="flex gap-1 flex-wrap">
            {bits.map((bit, index) => (
              <span
                key={index}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md font-mono font-bold text-lg"
                style={{
                  backgroundColor: bit === 1 ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                  color: bit === 1 ? 'var(--success-text)' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {bit}
              </span>
            ))}
          </div>
        </div>

        {/* Padded (if needed) */}
        {needsPadding && (
          <div className="p-4 rounded-md border" style={{ backgroundColor: 'var(--warning-bg)', borderColor: 'var(--warning-border)' }}>
            <div className="text-sm font-medium mb-2" style={{ color: 'var(--warning-text)' }}>
              Padded with leading zeros:
            </div>
            <div className="flex gap-1 flex-wrap">
              {paddedBits.map((bit, index) => {
                const isPadding = index < (paddedLength - bits.length)
                return (
                  <span
                    key={index}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md font-mono font-bold text-lg"
                    style={{
                      backgroundColor: isPadding ? 'var(--warning-bg)' : bit === 1 ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                      color: isPadding ? 'var(--warning-text)' : bit === 1 ? 'var(--success-text)' : 'var(--text-secondary)',
                      border: isPadding ? '1px solid var(--warning-border)' : '1px solid var(--border-color)',
                    }}
                  >
                    {bit}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Grouped */}
        <div className="p-4 rounded-md border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            Grouped into 4-bit sets:
          </div>
          <div className="flex gap-2 flex-wrap">
            {groups.map((group, groupIndex) => (
              <div
                key={groupIndex}
                className="p-2 rounded-md border"
                style={{
                  backgroundColor: groupIndex % 2 === 0 ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="flex gap-1 mb-1">
                  {group.bits.map((bit, bitIndex) => (
                    <span
                      key={bitIndex}
                      className="inline-flex items-center justify-center w-6 h-6 rounded font-mono font-bold text-sm"
                      style={{
                        backgroundColor: bit === 1 ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                        color: bit === 1 ? 'var(--success-text)' : 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      {bit}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-center my-1">
                  <span style={{ color: 'var(--text-secondary)' }}>↓</span>
                </div>
                <div className="text-center">
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md font-mono font-bold text-lg"
                    style={{
                      backgroundColor: 'var(--accent-bg)',
                      color: 'var(--accent-text)',
                      border: '1px solid var(--accent-border)',
                    }}
                  >
                    {group.convertedValue}
                  </span>
                </div>
                <div className="text-xs text-center mt-1" style={{ color: 'var(--text-secondary)' }}>
                  = {group.decimalValue}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Result */}
        <div
          className="p-4 rounded-md border"
          style={{
            backgroundColor: 'var(--success-bg)',
            borderColor: 'var(--success-border)',
          }}
        >
          <div className="text-sm font-medium mb-2" style={{ color: 'var(--success-primary)' }}>
            Hexadecimal Result:
          </div>
          <div className="font-mono text-2xl font-bold" style={{ color: 'var(--success-text)' }}>
            {groups.map(g => g.convertedValue).join('')}
          </div>
        </div>
      </div>
    )
  }

  const renderTooltip = (content: string, title: string) => {
    if (!showTooltips) return null
    return (
      <div
        className="p-3 rounded-md border mb-4"
        style={{
          backgroundColor: 'var(--accent-bg)',
          borderColor: 'var(--accent-border)',
        }}
      >
        <div className="font-semibold mb-1" style={{ color: 'var(--accent-primary)' }}>
          {title}
        </div>
        <div className="text-sm" style={{ color: 'var(--accent-text)' }}>
          {content}
        </div>
      </div>
    )
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
        <div className="max-w-7xl mx-auto space-y-6">
          <Card
            title="Interactive Exploration Mode"
            subtitle="Experiment with number systems in real-time. Type a value and watch the conversions update instantly."
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
                placeholder={`Enter ${fromSystem} value`}
                label="Enter Value (live conversion)"
              />
              <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Conversions update automatically as you type
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                onClick={() => setComparisonMethod('all')}
                variant={comparisonMethod === 'all' ? 'primary' : 'secondary'}
              >
                All Methods
              </Button>
              <Button
                onClick={() => setComparisonMethod('division')}
                variant={comparisonMethod === 'division' ? 'primary' : 'secondary'}
              >
                Division Method
              </Button>
              <Button
                onClick={() => setComparisonMethod('position-value')}
                variant={comparisonMethod === 'position-value' ? 'primary' : 'secondary'}
              >
                Position Values
              </Button>
              <Button
                onClick={() => setComparisonMethod('bit-grouping')}
                variant={comparisonMethod === 'bit-grouping' ? 'primary' : 'secondary'}
              >
                Bit Grouping
              </Button>
              <Button
                onClick={() => setShowTooltips(!showTooltips)}
                variant="secondary"
              >
                {showTooltips ? 'Hide Tooltips' : 'Show Tooltips'}
              </Button>
            </div>
          </Card>

          {/* Live Conversion Result */}
          {conversionResult?.success && (
            <Card title="Live Conversion Result">
              <div className="flex items-center gap-4">
                <div className="font-mono text-xl" style={{ color: 'var(--text-secondary)' }}>
                  {fromSystem.charAt(0).toUpperCase() + fromSystem.slice(1)} {debouncedValue}
                </div>
                <div style={{ color: 'var(--accent-primary)' }}>→</div>
                <div className="font-mono text-2xl font-bold" style={{ color: 'var(--success-text)' }}>
                  {toSystem.charAt(0).toUpperCase() + toSystem.slice(1)} {conversionResult.result}
                </div>
              </div>
            </Card>
          )}

          {/* Comparison Across All Systems */}
          {comparisonData && comparisonMethod === 'all' && (
            <Card title="Comparison Across All Systems">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                      <th className="px-4 py-2 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        System
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Value
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Bit Length
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                      <td className="px-4 py-3 font-medium">Decimal</td>
                      <td className="px-4 py-3 font-mono">{comparisonData.decimal}</td>
                      <td className="px-4 py-3 font-mono">{comparisonData.bitLength}</td>
                    </tr>
                    <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                      <td className="px-4 py-3 font-medium">Binary</td>
                      <td className="px-4 py-3 font-mono">{comparisonData.binary}</td>
                      <td className="px-4 py-3 font-mono">{comparisonData.bitLength}</td>
                    </tr>
                    <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                      <td className="px-4 py-3 font-medium">Hexadecimal</td>
                      <td className="px-4 py-3 font-mono">{comparisonData.hexadecimal}</td>
                      <td className="px-4 py-3 font-mono">{comparisonData.bitLength}</td>
                    </tr>
                    <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <td className="px-4 py-3 font-medium">Octal</td>
                      <td className="px-4 py-3 font-mono">{comparisonData.octal}</td>
                      <td className="px-4 py-3 font-mono">{Math.ceil(comparisonData.bitLength / 3)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Division Method */}
          {(comparisonMethod === 'division' || comparisonMethod === 'all') && divisionSteps.length > 0 && (
            <Card title="Division Method (Decimal → Target Base)">
              {renderTooltip(
                'The division method converts decimal to other bases by repeatedly dividing by the target base. The remainders, read from bottom to top, form the result.',
                'How Division Method Works'
              )}
              {renderDivisionTable()}
            </Card>
          )}

          {/* Position Value Method */}
          {(comparisonMethod === 'position-value' || comparisonMethod === 'all') && positionValueData?.success && (
            <Card title={`Position Value Method (${fromSystem.charAt(0).toUpperCase() + fromSystem.slice(1)} → Decimal)`}>
              {renderTooltip(
                'Position value method converts by multiplying each digit by its positional value (base^position) and summing the results. This shows how each digit contributes to the final value.',
                'How Position Values Work'
              )}
              {renderPositionValues()}
            </Card>
          )}

          {/* Bit Grouping Method */}
          {(comparisonMethod === 'bit-grouping' || comparisonMethod === 'all') && binaryForGrouping && (
            <Card title="Bit Grouping Method (Binary → Hexadecimal)">
              {renderTooltip(
                'Bit grouping converts binary to hexadecimal by grouping bits into sets of 4. Each group converts to a single hex digit. This is a quick conversion method that leverages the relationship between binary and hexadecimal.',
                'How Bit Grouping Works'
              )}
              {renderBitGrouping()}
            </Card>
          )}

          {/* Educational Tips */}
          {showTooltips && (
            <Card title="Exploration Tips">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <div className="font-medium mb-1">Try Different Numbers</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Experiment with powers of 2 (1, 2, 4, 8, 16) to see patterns in binary
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <div className="font-medium mb-1">Compare Methods</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Switch between division, position values, and bit grouping to understand different approaches
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <div className="font-medium mb-1">Watch Patterns</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Observe how leading zeros affect position values and bit grouping
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
