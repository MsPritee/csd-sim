/**
 * PositionValueVisualizer - Interactive position breakdown for number system conversions
 * Shows positional notation calculations for binary/octal/hexadecimal → decimal
 */

import { useState, useEffect } from 'react'
import type { PositionValueResult } from '../../application/numbersystems'
import { Card } from '../../components/ui'
import { Alert } from '../../components/ui'

interface PositionValueVisualizerProps {
  readonly positionData: PositionValueResult
  readonly fromSystem: 'binary' | 'octal' | 'hexadecimal'
}

export function PositionValueVisualizer({
  positionData,
  fromSystem,
}: PositionValueVisualizerProps) {
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [animationStep, setAnimationStep] = useState(0)
  const [showAnimation, setShowAnimation] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Responsive detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Reset animation when data changes
  useEffect(() => {
    setAnimationStep(0)
    setSelectedPosition(null)
    setHoveredPosition(null)
  }, [positionData])

  // Start animation when component mounts or data changes
  useEffect(() => {
    if (positionData.success && positionData.positions.length > 0) {
      setShowAnimation(true)
      const interval = setInterval(() => {
        setAnimationStep((prev) => {
          if (prev >= positionData.positions.length) {
            setShowAnimation(false)
            clearInterval(interval)
            return positionData.positions.length
          }
          return prev + 1
        })
      }, 500) // 500ms per step
      return () => clearInterval(interval)
    }
  }, [positionData])

  if (!positionData.success) {
    return (
      <Card title="Position Value Breakdown">
        <Alert variant="error">
          {positionData.error || 'Unable to calculate position values'}
        </Alert>
      </Card>
    )
  }

  const positions = positionData.positions
  const base = fromSystem === 'binary' ? 2 : fromSystem === 'octal' ? 8 : 16

  // Color scheme for positions
  const getPositionColor = (index: number, isHovered: boolean, isSelected: boolean) => {
    if (isSelected) {
      return {
        bg: 'var(--accent-bg)',
        border: 'var(--accent-primary)',
        text: 'var(--accent-text)',
      }
    }
    if (isHovered) {
      return {
        bg: 'var(--bg-tertiary)',
        border: 'var(--accent-primary)',
        text: 'var(--text-primary)',
      }
    }
    // Alternate colors for visual distinction
    const isEven = index % 2 === 0
    return {
      bg: isEven ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
      border: 'var(--border-color)',
      text: 'var(--text-primary)',
    }
  }

  // Calculate running sum for animation
  const getRunningSum = (upToIndex: number) => {
    return positions
      .slice(0, upToIndex + 1)
      .reduce((sum, pos) => sum + pos.contribution, 0)
  }

  return (
    <Card title={`Position Value Breakdown (${fromSystem.charAt(0).toUpperCase() + fromSystem.slice(1)} → Decimal)`}>
      <div className="space-y-4">
        {/* Position Table */}
        <div className="overflow-x-auto">
          {isMobile ? (
            // Mobile card-based layout
            <div className="space-y-3">
              {positions.map((pos, index) => {
                const isHovered = hoveredPosition === index
                const isSelected = selectedPosition === index
                const isAnimated = showAnimation && index < animationStep
                const colors = getPositionColor(index, isHovered, isSelected)

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedPosition(isSelected ? null : index)}
                    className="p-4 rounded-lg border cursor-pointer transition-all"
                    style={{
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                      opacity: isAnimated ? 1 : 0.3,
                      transform: isAnimated ? 'translateX(0)' : 'translateX(-10px)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="inline-flex items-center justify-center w-12 h-12 rounded-lg font-mono font-bold text-xl"
                        style={{
                          backgroundColor: pos.contribution > 0 ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                          color: pos.contribution > 0 ? 'var(--success-text)' : 'var(--text-secondary)',
                          border: `2px solid ${colors.border}`,
                        }}
                      >
                        {pos.digit}
                      </span>
                      <span className="font-mono font-bold text-lg" style={{ color: colors.text }}>
                        {pos.contribution}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Position:</span>
                        <span className="font-mono" style={{ color: colors.text }}>{pos.position}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Value:</span>
                        <span className="font-mono" style={{ color: colors.text }}>{base}^{pos.position} = {pos.positionValue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Calc:</span>
                        <span className="font-mono" style={{ color: colors.text }}>{pos.calculation}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            // Desktop table layout
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
                {positions.map((pos, index) => {
                  const isHovered = hoveredPosition === index
                  const isSelected = selectedPosition === index
                  const isAnimated = showAnimation && index < animationStep
                  const colors = getPositionColor(index, isHovered, isSelected)

                  return (
                    <tr
                      key={index}
                      onMouseEnter={() => setHoveredPosition(index)}
                      onMouseLeave={() => setHoveredPosition(null)}
                      onClick={() => setSelectedPosition(isSelected ? null : index)}
                      className="cursor-pointer transition-colors"
                      style={{
                        backgroundColor: colors.bg,
                        borderBottom: '1px solid var(--border-color)',
                        opacity: isAnimated ? 1 : 0.3,
                        transform: isAnimated ? 'translateX(0)' : 'translateX(-10px)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center justify-center w-8 h-8 rounded-md font-mono font-bold text-lg"
                          style={{
                            backgroundColor: pos.contribution > 0 ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                            color: pos.contribution > 0 ? 'var(--success-text)' : 'var(--text-secondary)',
                            border: `1px solid ${colors.border}`,
                          }}
                        >
                          {pos.digit}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono" style={{ color: colors.text }}>
                        {pos.position}
                      </td>
                      <td className="px-4 py-3 font-mono" style={{ color: colors.text }}>
                        {base}^{pos.position} = {pos.positionValue}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm" style={{ color: colors.text }}>
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
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Running Sum Animation */}
        {showAnimation && animationStep > 0 && (
          <div
            className="p-4 rounded-md border"
            style={{
              backgroundColor: 'var(--accent-bg)',
              borderColor: 'var(--accent-border)',
            }}
          >
            <div className="text-sm font-medium mb-2" style={{ color: 'var(--accent-primary)' }}>
              Running Sum:
            </div>
            <div className="font-mono text-lg" style={{ color: 'var(--accent-text)' }}>
              {positions
                .slice(0, animationStep)
                .map((pos) => pos.contribution)
                .filter((val) => val > 0)
                .join(' + ')}{' '}
              = {getRunningSum(animationStep - 1)}
            </div>
          </div>
        )}

        {/* Final Sum */}
        <div
          className="p-4 rounded-md border"
          style={{
            backgroundColor: 'var(--success-bg)',
            borderColor: 'var(--success-border)',
          }}
        >
          <div className="text-sm font-medium mb-2" style={{ color: 'var(--success-primary)' }}>
            Final Result:
          </div>
          <div className="font-mono text-xl font-bold" style={{ color: 'var(--success-text)' }}>
            {positionData.calculation}
          </div>
          <div className="mt-2 text-sm" style={{ color: 'var(--success-primary)' }}>
            {fromSystem.charAt(0).toUpperCase() + fromSystem.slice(1)} {positionData.inputValue} = Decimal {positionData.decimalResult}
          </div>
        </div>

        {/* Interactive Hint */}
        <div className={`text-center ${isMobile ? 'text-xs' : 'text-xs'}`} style={{ color: 'var(--text-secondary)' }}>
          {isMobile 
            ? 'Tap cards to isolate position • Animation shows step-by-step summation'
            : 'Hover over rows to highlight • Click to isolate position • Animation shows step-by-step summation'
          }
        </div>

        {/* Isolated Position View */}
        {selectedPosition !== null && (
          <div
            className="p-4 rounded-md border"
            style={{
              backgroundColor: 'var(--accent-bg)',
              borderColor: 'var(--accent-primary)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
                Isolated Position Analysis
              </h4>
              <button
                onClick={() => setSelectedPosition(null)}
                className="text-sm px-2 py-1 rounded"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                }}
              >
                Close
              </button>
            </div>
            {(() => {
              const pos = positions[selectedPosition]
              return (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Digit:</span>
                    <span className="font-mono font-bold" style={{ color: 'var(--accent-text)' }}>
                      {pos.digit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Position:</span>
                    <span className="font-mono" style={{ color: 'var(--accent-text)' }}>
                      {pos.position}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Base:</span>
                    <span className="font-mono" style={{ color: 'var(--accent-text)' }}>
                      {base}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Position Value:</span>
                    <span className="font-mono" style={{ color: 'var(--accent-text)' }}>
                      {base}^{pos.position} = {pos.positionValue}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Calculation:</span>
                    <span className="font-mono" style={{ color: 'var(--accent-text)' }}>
                      {pos.calculation}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Contribution:</span>
                    <span
                      className="font-mono font-bold"
                      style={{
                        color: pos.contribution > 0 ? 'var(--success-text)' : 'var(--text-muted)',
                      }}
                    >
                      {pos.contribution}
                    </span>
                  </div>
                  <div className="pt-2 border-t" style={{ borderColor: 'var(--accent-border)' }}>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      This position contributes {pos.contribution > 0 ? 'actively' : 'nothing'} to the final value.
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Replay Animation Button */}
        <button
          onClick={() => {
            setAnimationStep(0)
            setShowAnimation(true)
          }}
          className="w-full py-2 px-4 rounded-md font-medium transition-colors"
          style={{
            backgroundColor: 'var(--accent-bg)',
            color: 'var(--accent-primary)',
            border: '1px solid var(--accent-border)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-primary)'
            e.currentTarget.style.color = 'var(--accent-text)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-bg)'
            e.currentTarget.style.color = 'var(--accent-primary)'
          }}
        >
          Replay Animation
        </button>
      </div>
    </Card>
  )
}