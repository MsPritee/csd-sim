import { useState, useEffect, useCallback, useRef } from 'react'
import { generateDivisionSteps } from '../../core/numbersystems/binary'
import { DivisionTable } from './DivisionTable'
import { ConversionControls } from './ConversionControls'

interface DecimalToBinaryVisualizerProps {
  readonly decimalValue: number
  readonly onBack?: () => void
}

type AnimationSpeed = 'slow' | 'normal' | 'fast'
type AnimationPhase = 'division' | 'reading' | 'complete'
const SPEED_MAP: Record<AnimationSpeed, number> = { slow: 2000, normal: 1000, fast: 500 }

export function DecimalToBinaryVisualizer({ decimalValue }: DecimalToBinaryVisualizerProps) {
  const result = generateDivisionSteps(decimalValue, 2)
  const steps = result.success ? result.steps : []
  const finalResult = result.success ? result.result : ''
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<AnimationSpeed>('normal')
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  const [phase, setPhase] = useState<AnimationPhase>('division')
  const [assembledBinary, setAssembledBinary] = useState('')
  const [showGuide, setShowGuide] = useState(true)
  const timer = useRef<number | null>(null)
  const readingTimer = useRef<number | null>(null)

  const reset = useCallback(() => {
    setCurrentStep(0); setIsPlaying(false); setSelectedStep(null); setPhase('division'); setAssembledBinary('')
    if (timer.current) window.clearTimeout(timer.current)
    if (readingTimer.current) window.clearInterval(readingTimer.current)
    timer.current = null; readingTimer.current = null
  }, [])
  useEffect(() => { reset() }, [decimalValue, reset])

  useEffect(() => {
    if (!isPlaying) return
    if (phase === 'division') {
      if (currentStep < steps.length - 1) timer.current = window.setTimeout(() => setCurrentStep((s) => s + 1), SPEED_MAP[speed])
      else { setPhase('reading'); setIsPlaying(false) }
    } else if (phase === 'reading' && !readingTimer.current) {
      const remainders = steps.map((s) => s.remainder).reverse(); let index = 0
      readingTimer.current = window.setInterval(() => {
        if (index < remainders.length) setAssembledBinary((value) => value + remainders[index++])
        else { window.clearInterval(readingTimer.current!); readingTimer.current = null; setPhase('complete'); setIsPlaying(false) }
      }, SPEED_MAP[speed] / 2)
    }
    return () => { if (timer.current) window.clearTimeout(timer.current) }
  }, [isPlaying, phase, currentStep, speed, steps])

  const next = useCallback(() => {
    if (phase === 'division') currentStep < steps.length - 1 ? setCurrentStep((s) => s + 1) : setPhase('reading')
    else if (phase === 'reading') {
      const remainders = steps.map((s) => s.remainder).reverse()
      assembledBinary.length < remainders.length ? setAssembledBinary((v) => v + remainders[assembledBinary.length]) : setPhase('complete')
    }
  }, [phase, currentStep, steps, assembledBinary.length])
  const previous = useCallback(() => {
    if (phase === 'complete') { setPhase('reading'); setAssembledBinary(steps.map((s) => s.remainder).reverse().join('')) }
    else if (phase === 'reading' && assembledBinary) setAssembledBinary((v) => v.slice(0, -1))
    else if (phase === 'reading') setPhase('division')
    else setCurrentStep((s) => Math.max(0, s - 1))
  }, [phase, assembledBinary, steps])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next() } else if (e.key === 'ArrowLeft') previous(); else if (e.key === 'Enter') setIsPlaying((v) => !v); else if (e.key === 'Escape') reset() }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [next, previous, reset])

  if (!result.success) return <div className="dv-error">{result.error || 'Failed to generate division steps'}</div>
  const displayedBinary = phase === 'complete' ? finalResult : assembledBinary || '_'.repeat(finalResult.length)
  const stepNumber = phase === 'complete' ? 5 : phase === 'reading' ? 4 : currentStep === 0 ? 1 : 2

  if (!divisionResult.success) {
    return (
      <Card title="Error">
        <div className="p-4 text-center" style={{ color: 'var(--error-text)' }}>
          {divisionResult.error || 'Failed to generate division steps'}
        </div>
      </Card>
    )
  }

  return (
    <div className="division-visualizer space-y-6">
      {/* Header with Decimal and Binary displays */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Decimal Input Display */}
        <Card title="DECIMAL">
          <div className="text-center">
            <div className="text-4xl font-mono font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>
              ({decimalValue})₁₀
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Input value
            </div>
          </div>
        </Card>

        {/* Conversion Arrow */}
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">↓</div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Repeated Division by 2
            </div>
          </div>
        </div>

        {/* Binary Result Display */}
        <Card title="BINARY">
          <div className="text-center">
            <div className="text-4xl font-mono font-bold mb-2" style={{ color: 'var(--success-text)' }}>
              ({formatBinaryDisplay()})₂
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {phase === 'complete' ? 'Final result' : 'Building...'}
            </div>
          </div>
        </Card>
      </div>

      {/* Animation Controls */}
      <Card title="Controls">
        <ConversionControls
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onNext={nextStep}
          onPrevious={previousStep}
          onReset={resetAnimation}
          speed={speed}
          onSpeedChange={setSpeed}
          currentStep={currentStep}
          totalSteps={steps.length}
          phase={phase}
        />
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            aria-label={showExplanation ? 'Hide explanation' : 'Show explanation'}
          >
            {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
          </button>
        </div>
      </Card>

      {/* Main Division Table */}
      <DivisionTable
        steps={steps}
        currentStep={currentStep}
        selectedStep={selectedStep}
        onSelectStep={handleStepSelect}
        targetBase={2}
        decimalValue={decimalValue}
      />

      {/* Step Explanation Panel */}
      {showExplanation && (
        <Card title="Explanation">
          <div className="p-4">
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {getCurrentExplanation()}
            </p>
          </div>
        </Card>
      )}

      {/* Remainder Reading Animation */}
      {showReadingAnimation && phase !== 'division' && (
        <Card title="Reading Remainders Bottom to Top">
          <div className="space-y-4">
            {/* Remainder Column */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                REMAINDERS (read from bottom)
              </div>
              <div className="flex flex-col-reverse gap-2">
                {getRemaindersForDisplay().map((remainder, index) => (
                  <RemainderIndicator
                    key={index}
                    remainder={remainder}
                    targetBase={2}
                    isCurrent={false}
                    isCompleted={true}
                    animate={false}
                  />
                ))}
              </div>
            </div>

            {/* Animated Arrow */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="text-4xl animate-bounce">⬆️</div>
                <div className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
                  Read this direction
                </div>
              </div>
            </div>

            {/* Assembled Binary */}
            {assembledBinary && (
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--success-bg)' }}>
                <div className="text-sm mb-2" style={{ color: 'var(--success-text)' }}>
                  Building binary number:
                </div>
                <div className="text-3xl font-mono font-bold" style={{ color: 'var(--success-text)' }}>
                  {assembledBinary}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Educational Callout */}
      {phase === 'complete' && (
        <Card title="Why Read from Bottom to Top?">
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-primary)' }}>
                <strong>Each division produces the next binary digit starting from the least significant bit (LSB).</strong>
              </p>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                The first remainder we get is the least significant bit (rightmost digit). Each subsequent division
                produces the next more significant bit. Therefore, to get the correct binary number, we must read
                the remainders in reverse order - from bottom to top.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  First remainder (top of table)
                </div>
                <div className="text-2xl font-mono font-bold" style={{ color: 'var(--accent-primary)' }}>
                  LSB → Rightmost digit
                </div>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Last remainder (bottom of table)
                </div>
                <div className="text-2xl font-mono font-bold" style={{ color: 'var(--accent-primary)' }}>
                  MSB → Leftmost digit
                </div>
              </div>
            </div>

            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--success-bg)' }}>
              <div className="text-lg font-bold mb-2" style={{ color: 'var(--success-text)' }}>
                Final Result
              </div>
              <div className="text-3xl font-mono font-bold" style={{ color: 'var(--success-text)' }}>
                ({decimalValue})₁₀ = ({finalResult})₂
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Keyboard Shortcuts Help */}
      <Card title="Keyboard Shortcuts">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 text-sm">
          <div>
            <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>Space</kbd>
            <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>Next step</span>
          </div>
          <div>
            <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>→</kbd>
            <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>Next step</span>
          </div>
          <div>
            <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>←</kbd>
            <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>Previous step</span>
          </div>
          <div>
            <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>Enter</kbd>
            <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>Play/Pause</span>
          </div>
          <div>
            <kbd className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>Escape</kbd>
            <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>Restart</span>
          </div>
        </div>
      </Card>
    </div>
    <ConversionControls isPlaying={isPlaying} onTogglePlay={() => setIsPlaying((v) => !v)} onNext={next} onPrevious={previous} onReset={reset} speed={speed} onSpeedChange={setSpeed} currentStep={currentStep} totalSteps={steps.length} phase={phase} />
  </main>
}
