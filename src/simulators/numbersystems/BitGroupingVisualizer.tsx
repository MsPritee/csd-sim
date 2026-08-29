/**
 * BitGroupingVisualizer - Animated visual component showing bit grouping process
 * Demonstrates binary ↔ hexadecimal/octal grouping with step-by-step animation
 */

import { useState, useEffect, useCallback } from 'react'
import { Card } from '../../components/ui'
import { type Bit } from '../../core/numbersystems'

type GroupingMode = 'hexadecimal' | 'octal'
type AnimationStep = 'original' | 'padding' | 'grouping' | 'conversion' | 'result'

interface BitGroupingVisualizerProps {
  readonly binaryValue: string
  readonly targetSystem?: GroupingMode
}

interface BitGroup {
  readonly bits: readonly Bit[]
  readonly groupIndex: number
  readonly convertedValue: string
  readonly decimalValue: number
}

export function BitGroupingVisualizer({ 
  binaryValue, 
  targetSystem: initialTargetSystem = 'hexadecimal' 
}: BitGroupingVisualizerProps) {
  const [groupingMode, setGroupingMode] = useState<GroupingMode>(initialTargetSystem)
  const [animationStep, setAnimationStep] = useState<AnimationStep>('original')
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
  const [hoveredGroup, setHoveredGroup] = useState<number | null>(null)
  const [showAnimation, setShowAnimation] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
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

  // Validate binary input
  const isValidBinary = /^[01]+$/.test(binaryValue)
  
  // Convert binary string to bits array
  const bits: Bit[] = binaryValue.split('').map(b => (b === '1' ? 1 : 0)) as Bit[]

  // Calculate grouping based on mode
  const groupSize = groupingMode === 'hexadecimal' ? 4 : 3
  const paddedLength = Math.ceil(bits.length / groupSize) * groupSize
  const paddedBits = [...Array(paddedLength - bits.length).fill(0), ...bits] as Bit[]
  const needsPadding = bits.length % groupSize !== 0

  // Create groups
  const createGroups = useCallback((): BitGroup[] => {
    const groups: BitGroup[] = []
    for (let i = 0; i < paddedBits.length; i += groupSize) {
      const groupBits = paddedBits.slice(i, i + groupSize)
      let decimalValue = 0
      for (let j = 0; j < groupBits.length; j++) {
        decimalValue = decimalValue * 2 + groupBits[j]!
      }
      const convertedValue = groupingMode === 'hexadecimal' 
        ? decimalValue.toString(16).toUpperCase()
        : decimalValue.toString(8)
      
      groups.push({
        bits: groupBits,
        groupIndex: i / groupSize,
        convertedValue,
        decimalValue,
      })
    }
    return groups
  }, [paddedBits, groupSize, groupingMode])

  const groups = createGroups()

  // Animation sequence
  const animationSteps: AnimationStep[] = ['original', 'padding', 'grouping', 'conversion', 'result']
  
  // Reset animation when binary value or mode changes
  useEffect(() => {
    setAnimationStep('original')
    setCurrentStepIndex(0)
    setSelectedGroup(null)
    setHoveredGroup(null)
  }, [binaryValue, groupingMode])

  // Auto-play animation
  useEffect(() => {
    if (!showAnimation) return

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= animationSteps.length - 1) {
          setShowAnimation(false)
          return animationSteps.length - 1
        }
        return prev + 1
      })
    }, 1500) // 1.5 seconds per step

    return () => clearInterval(interval)
  }, [showAnimation])

  // Update animation step based on index
  useEffect(() => {
    setAnimationStep(animationSteps[currentStepIndex])
  }, [currentStepIndex])

  const startAnimation = useCallback(() => {
    setCurrentStepIndex(0)
    setShowAnimation(true)
  }, [])

  const getStepDescription = (): string => {
    switch (animationStep) {
      case 'original':
        return `Original binary: ${binaryValue}`
      case 'padding':
        return needsPadding 
          ? `Pad with leading zeros to make length a multiple of ${groupSize}: ${paddedBits.join('')}`
          : `No padding needed (length is already a multiple of ${groupSize})`
      case 'grouping':
        return `Group into ${groupSize}-bit sets for ${groupingMode} conversion`
      case 'conversion':
        return `Convert each ${groupSize}-bit group to ${groupingMode} digit`
      case 'result':
        return `Final result: ${groups.map(g => g.convertedValue).join('')}`
    }
  }

  const getGroupColor = (index: number) => {
    if (selectedGroup === index) {
      return {
        bg: 'var(--accent-bg)',
        border: 'var(--accent-primary)',
        text: 'var(--accent-text)',
      }
    }
    if (hoveredGroup === index) {
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

  const getStepVisibility = (step: AnimationStep): boolean => {
    const stepIndex = animationSteps.indexOf(step)
    return currentStepIndex >= stepIndex
  }

  if (!isValidBinary) {
    return (
      <Card title="Bit Grouping Visualizer">
        <div className="p-4 rounded-md border" style={{ backgroundColor: 'var(--error-bg)', borderColor: 'var(--error-border)' }}>
          <div style={{ color: 'var(--error-text)' }}>
            Invalid binary format: must contain only 0s and 1s
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card title={`Bit Grouping Visualizer (Binary → ${groupingMode.charAt(0).toUpperCase() + groupingMode.slice(1)})`}>
      <div className="space-y-4">
        {/* Mode Toggle */}
        <div className="flex items-center gap-4 p-3 rounded-md" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Grouping Mode:
          </span>
          <button
            onClick={() => setGroupingMode('hexadecimal')}
            className="px-3 py-1 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: groupingMode === 'hexadecimal' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              color: groupingMode === 'hexadecimal' ? 'white' : 'var(--text-primary)',
            }}
          >
            4-bit (Hexadecimal)
          </button>
          <button
            onClick={() => setGroupingMode('octal')}
            className="px-3 py-1 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: groupingMode === 'octal' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              color: groupingMode === 'octal' ? 'white' : 'var(--text-primary)',
            }}
          >
            3-bit (Octal)
          </button>
          <button
            onClick={startAnimation}
            className="px-3 py-1 rounded text-sm font-medium transition-colors ml-auto"
            style={{
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success-text)',
              border: '1px solid var(--success-border)',
            }}
          >
            ▶ Animate
          </button>
        </div>

        {/* Current Step Description */}
        <div
          className="p-4 rounded-md border"
          style={{ backgroundColor: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}
        >
          <div className="text-sm font-medium mb-1" style={{ color: 'var(--accent-primary)' }}>
            Step {currentStepIndex + 1} of {animationSteps.length}: {animationStep.charAt(0).toUpperCase() + animationStep.slice(1)}
          </div>
          <div className="text-base" style={{ color: 'var(--accent-text)' }}>
            {getStepDescription()}
          </div>
        </div>

        {/* Step 1: Original Binary */}
        {getStepVisibility('original') && (
          <div
            className={`p-4 rounded-md border ${isMobile ? 'p-3' : 'p-4'}`}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              opacity: animationStep === 'original' ? 1 : 0.6,
            }}
          >
            <div className={`font-medium mb-2 ${isMobile ? 'text-sm' : 'text-sm'}`} style={{ color: 'var(--text-primary)' }}>
              Original Binary:
            </div>
            <div className="flex gap-1 flex-wrap">
              {bits.map((bit, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center justify-center rounded-md font-mono font-bold ${isMobile ? 'w-10 h-10 text-xl' : 'w-8 h-8 text-lg'}`}
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
            <div className={`mt-2 ${isMobile ? 'text-xs' : 'text-xs'}`} style={{ color: 'var(--text-secondary)' }}>
              {bits.length} bits
            </div>
          </div>
        )}

        {/* Step 2: Padding */}
        {getStepVisibility('padding') && (
          <div
            className="p-4 rounded-md border"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              opacity: animationStep === 'padding' ? 1 : 0.6,
            }}
          >
            <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              {needsPadding ? `Pad with leading zeros (multiple of ${groupSize}):` : 'No padding needed:'}
            </div>
            <div className="flex gap-1 flex-wrap">
              {paddedBits.map((bit, index) => {
                const isPadding = index < (paddedLength - bits.length)
                return (
                  <span
                    key={index}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md font-mono font-bold text-lg transition-all"
                    style={{
                      backgroundColor: isPadding 
                        ? 'var(--warning-bg)' 
                        : bit === 1 ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                      color: isPadding 
                        ? 'var(--warning-text)' 
                        : bit === 1 ? 'var(--success-text)' : 'var(--text-secondary)',
                      border: isPadding ? '1px solid var(--warning-border)' : '1px solid var(--border-color)',
                      opacity: isPadding && animationStep === 'padding' ? 0.5 : 1,
                    }}
                  >
                    {bit}
                  </span>
                )
              })}
            </div>
            {needsPadding && (
              <div className="text-xs mt-2" style={{ color: 'var(--warning-text)' }}>
                Added {paddedLength - bits.length} leading zero(s) for proper grouping
              </div>
            )}
          </div>
        )}

        {/* Step 3: Grouping */}
        {getStepVisibility('grouping') && (
          <div
            className={`p-4 rounded-md border ${isMobile ? 'p-3' : 'p-4'}`}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              opacity: animationStep === 'grouping' ? 1 : 0.6,
            }}
          >
            <div className={`font-medium mb-3 ${isMobile ? 'text-sm' : 'text-sm'}`} style={{ color: 'var(--text-primary)' }}>
              Grouped into {groupSize}-bit sets:
            </div>
            <div className={`flex gap-2 flex-wrap ${isMobile ? 'gap-3' : 'gap-2'}`}>
              {groups.map((group, groupIndex) => {
                const colors = getGroupColor(groupIndex)
                return (
                  <div
                    key={groupIndex}
                    onMouseEnter={() => setHoveredGroup(groupIndex)}
                    onMouseLeave={() => setHoveredGroup(null)}
                    onClick={() => setSelectedGroup(selectedGroup === groupIndex ? null : groupIndex)}
                    className={`cursor-pointer transition-all rounded-md border ${isMobile ? 'p-3' : 'p-2'}`}
                    style={{
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                      transform: selectedGroup === groupIndex ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    <div className={`flex gap-1 mb-1 ${isMobile ? 'gap-2' : 'gap-1'}`}>
                      {group.bits.map((bit, bitIndex) => (
                        <span
                          key={bitIndex}
                          className={`inline-flex items-center justify-center rounded font-mono font-bold ${isMobile ? 'w-8 h-8 text-lg' : 'w-6 h-6 text-sm'}`}
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
                    <div className="text-xs text-center" style={{ color: colors.text }}>
                      Group {groupIndex + 1}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
              Click on groups to see individual conversion details
            </div>
          </div>
        )}

        {/* Step 4: Conversion */}
        {getStepVisibility('conversion') && (
          <div
            className="p-4 rounded-md border"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              opacity: animationStep === 'conversion' ? 1 : 0.6,
            }}
          >
            <div className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              Convert each {groupSize}-bit group to {groupingMode}:
            </div>
            <div className="flex gap-2 flex-wrap">
              {groups.map((group, groupIndex) => {
                const colors = getGroupColor(groupIndex)
                return (
                  <div
                    key={groupIndex}
                    onMouseEnter={() => setHoveredGroup(groupIndex)}
                    onMouseLeave={() => setHoveredGroup(null)}
                    onClick={() => setSelectedGroup(selectedGroup === groupIndex ? null : groupIndex)}
                    className="cursor-pointer transition-all p-2 rounded-md border"
                    style={{
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                      transform: selectedGroup === groupIndex ? 'scale(1.05)' : 'scale(1)',
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
                    <div className="text-xs text-center mt-1" style={{ color: colors.text }}>
                      = {group.decimalValue}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 5: Final Result */}
        {getStepVisibility('result') && (
          <div
            className="p-4 rounded-md border"
            style={{
              backgroundColor: 'var(--success-bg)',
              borderColor: 'var(--success-border)',
              opacity: animationStep === 'result' ? 1 : 0.6,
            }}
          >
            <div className="text-sm font-medium mb-2" style={{ color: 'var(--success-primary)' }}>
              Final Result:
            </div>
            <div className="flex items-center gap-3">
              <div className="font-mono text-lg" style={{ color: 'var(--text-secondary)' }}>
                Binary {binaryValue} =
              </div>
              <div className="font-mono text-2xl font-bold" style={{ color: 'var(--success-text)' }}>
                {groupingMode.charAt(0).toUpperCase() + groupingMode.slice(1)} {groups.map(g => g.convertedValue).join('')}
              </div>
            </div>
            <div className="text-sm mt-2" style={{ color: 'var(--success-primary)' }}>
              Each {groupSize}-bit group converts to one {groupingMode} digit
            </div>
          </div>
        )}

        {/* Selected Group Details */}
        {selectedGroup !== null && (
          <div
            className="p-4 rounded-md border"
            style={{
              backgroundColor: 'var(--accent-bg)',
              borderColor: 'var(--accent-primary)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
                Group {selectedGroup + 1} Details
              </h4>
              <button
                onClick={() => setSelectedGroup(null)}
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
              const group = groups[selectedGroup]!
              return (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Bits:</span>
                    <span className="font-mono" style={{ color: 'var(--accent-text)' }}>
                      {group.bits.join('')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Decimal value:</span>
                    <span className="font-mono" style={{ color: 'var(--accent-text)' }}>
                      {group.decimalValue}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {groupingMode.charAt(0).toUpperCase() + groupingMode.slice(1)} digit:
                    </span>
                    <span className="font-mono font-bold" style={{ color: 'var(--accent-text)' }}>
                      {group.convertedValue}
                    </span>
                  </div>
                  <div className="pt-2 border-t" style={{ borderColor: 'var(--accent-border)' }}>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Calculation: {group.bits.map((b, i) => `${b}×2^${groupSize - 1 - i}`).join(' + ')} = {group.decimalValue}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Interactive Hint */}
        <div className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
          Toggle between 3-bit and 4-bit grouping modes • Click groups for details • Use Animate for step-by-step process
        </div>
      </div>
    </Card>
  )
}
