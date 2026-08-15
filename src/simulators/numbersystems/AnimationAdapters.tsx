/**
 * AnimationAdapters - Integration layer for connecting ConversionAnimator with existing visualizers
 * Provides step data and visualization content for different conversion types
 */

import type { DivisionStep } from '../../core/numbersystems/types'
import type { Bit } from '../../core/numbersystems'
import type { PositionValueResult } from '../../application/numbersystems'
import type { AnimationStep } from './ConversionAnimator'

// Division Method Adapter
export function createDivisionSteps(
  steps: readonly DivisionStep[],
  targetBase: 2 | 8 | 16,
  _decimalValue: number,
  _result: string
): AnimationStep[] {

  const formatRemainder = (remainder: number) => {
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

  return steps.map((step, index) => ({
    id: `division-step-${index}`,
    title: `Step ${index + 1}: Division`,
    description: step.isFinalStep
      ? `Final step: ${step.dividend} ÷ ${step.divisor} = ${step.quotient} with remainder ${formatRemainder(step.remainder)}. This is the most significant digit (MSB).`
      : `${step.dividend} ÷ ${step.divisor} = ${step.quotient} with remainder ${formatRemainder(step.remainder)}. Continue dividing the quotient.`,
    visualization: (
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
            {steps.slice(0, index + 1).map((s, i) => (
              <tr
                key={i}
                style={{
                  backgroundColor: i === index ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: i === index ? 'white' : 'var(--text-primary)',
                }}
              >
                <td className="px-4 py-2 font-mono font-bold">{s.dividend}</td>
                <td className="px-4 py-2 font-mono">{s.divisor}</td>
                <td className="px-4 py-2 font-mono">{s.quotient}</td>
                <td className="px-4 py-2 font-mono font-bold">{formatRemainder(s.remainder)}</td>
                <td className="px-4 py-2 text-sm">{getPositionLabel(i, steps.length)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  }))
}

// Bit Grouping Adapter
export function createBitGroupingSteps(
  binaryValue: string,
  targetSystem: 'hexadecimal' | 'octal'
): AnimationStep[] {
  const groupSize = targetSystem === 'hexadecimal' ? 4 : 3
  const bits: Bit[] = binaryValue.split('').map(b => (b === '1' ? 1 : 0)) as Bit[]
  const paddedLength = Math.ceil(bits.length / groupSize) * groupSize
  const paddedBits = [...Array(paddedLength - bits.length).fill(0), ...bits] as Bit[]
  const needsPadding = bits.length % groupSize !== 0

  // Create groups
  const groups: Array<{
    bits: readonly Bit[]
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
    const convertedValue = targetSystem === 'hexadecimal' 
      ? decimalValue.toString(16).toUpperCase()
      : decimalValue.toString(8)
    
    groups.push({
      bits: groupBits,
      groupIndex: i / groupSize,
      convertedValue,
      decimalValue,
    })
  }

  const steps: AnimationStep[] = [
    {
      id: 'original',
      title: 'Original Binary',
      description: `Original binary: ${binaryValue}`,
      visualization: (
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
      ),
    },
  ]

  if (needsPadding) {
    steps.push({
      id: 'padding',
      title: 'Add Padding',
      description: `Pad with leading zeros to make length a multiple of ${groupSize}: ${paddedBits.join('')}`,
      visualization: (
        <div className="flex gap-1 flex-wrap">
          {paddedBits.map((bit, index) => {
            const isPadding = index < (paddedLength - bits.length)
            return (
              <span
                key={index}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md font-mono font-bold text-lg"
                style={{
                  backgroundColor: isPadding 
                    ? 'var(--warning-bg)' 
                    : bit === 1 ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                  color: isPadding 
                    ? 'var(--warning-text)' 
                    : bit === 1 ? 'var(--success-text)' : 'var(--text-secondary)',
                  border: isPadding ? '1px solid var(--warning-border)' : '1px solid var(--border-color)',
                }}
              >
                {bit}
              </span>
            )
          })}
        </div>
      ),
    })
  }

  steps.push({
    id: 'grouping',
    title: 'Group Bits',
    description: `Group into ${groupSize}-bit sets for ${targetSystem} conversion`,
    visualization: (
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
            <div className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
              Group {groupIndex + 1}
            </div>
          </div>
        ))}
      </div>
    ),
  })

  steps.push({
    id: 'conversion',
    title: 'Convert Groups',
    description: `Convert each ${groupSize}-bit group to ${targetSystem} digit`,
    visualization: (
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
    ),
  })

  steps.push({
    id: 'result',
    title: 'Final Result',
    description: `Final result: ${groups.map(g => g.convertedValue).join('')}`,
    visualization: (
      <div className="flex items-center gap-3">
        <div className="font-mono text-lg" style={{ color: 'var(--text-secondary)' }}>
          Binary {binaryValue} =
        </div>
        <div className="font-mono text-2xl font-bold" style={{ color: 'var(--success-text)' }}>
          {targetSystem.charAt(0).toUpperCase() + targetSystem.slice(1)} {groups.map(g => g.convertedValue).join('')}
        </div>
      </div>
    ),
  })

  return steps
}

// Position Value Adapter
export function createPositionValueSteps(
  positionData: PositionValueResult,
  fromSystem: 'binary' | 'octal' | 'hexadecimal'
): AnimationStep[] {
  if (!positionData.success || !positionData.positions.length) {
    return []
  }

  const positions = positionData.positions
  const base = fromSystem === 'binary' ? 2 : fromSystem === 'octal' ? 8 : 16

  return positions.map((pos, index) => ({
    id: `position-${index}`,
    title: `Position ${index + 1}`,
    description: `Digit ${pos.digit} at position ${pos.position} contributes ${pos.contribution} to the total value`,
    visualization: (
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
            {positions.slice(0, index + 1).map((p, i) => (
              <tr
                key={i}
                style={{
                  backgroundColor: i === index ? 'var(--accent-bg)' : i % 2 === 0 ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md font-mono font-bold text-lg"
                    style={{
                      backgroundColor: p.contribution > 0 ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                      color: p.contribution > 0 ? 'var(--success-text)' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    {p.digit}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-primary)' }}>
                  {p.position}
                </td>
                <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-primary)' }}>
                  {base}^{p.position} = {p.positionValue}
                </td>
                <td className="px-4 py-3 font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
                  {p.calculation}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="font-mono font-bold"
                    style={{
                      color: p.contribution > 0 ? 'var(--success-text)' : 'var(--text-muted)',
                      backgroundColor: p.contribution > 0 ? 'var(--success-bg)' : 'transparent',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {p.contribution}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  }))
}