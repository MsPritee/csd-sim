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

  return <main className="division-visualizer">
    <header className="dv-header">
      <div className="dv-brand"><span className="dv-brand-icon">÷</span><div><strong>Decimal → Binary</strong><small>Repeated Division Method</small></div></div>
      <div className="dv-steps">{['Divide', 'Remainder', 'Continue', 'Read Bottom → Top', 'Result'].map((label, i) => <div className={`dv-step ${i + 1 <= stepNumber ? 'is-active' : ''}`} key={label}><span>{i + 1}</span><b>{label}</b></div>)}</div>
      <div className="dv-legend"><span>● 1 = Binary 1</span><span>● 0 = Binary 0</span></div>
    </header>
    <section className="dv-heading"><p>Decimal Number</p><h1>{decimalValue}<sup>10</sup></h1><div className="dv-callout">ⓘ <span>We repeatedly divide the decimal number by 2 and record the remainders.</span></div></section>
    <div className="dv-grid">
      <section className="dv-workspace"><div className="dv-section-title"><span>÷</span><h2>Division Process</h2></div><DivisionTable steps={steps} currentStep={currentStep} selectedStep={selectedStep} onSelectStep={(i) => { setSelectedStep(i); setCurrentStep(i) }} targetBase={2} decimalValue={decimalValue} /><div className="dv-result-strip"><div><b>Remainders (Top to Bottom)</b><div className="dv-bits">{steps.map((s, i) => <span className={s.remainder ? 'one' : 'zero'} key={i}>{s.remainder}</span>)}</div></div><div className="dv-read-cue">→ Read Bottom to Top →</div><div><b>Binary Number</b><div className="dv-bits">{displayedBinary.split('').map((bit, i) => <span key={i}>{bit}</span>)}</div></div></div><div className="dv-completion"><div className="dv-complete-note">Conversion<br /><strong>Complete!</strong></div><div className="dv-equation">{decimalValue}<sup>10</sup> = {finalResult}<sub>2</sub></div><div className="dv-tip">Lightbulb<br /><strong>Read remainders from bottom to top.</strong></div></div></section>
      <aside className="dv-guide"><button className="dv-guide-head" onClick={() => setShowGuide((v) => !v)}><span>▣ &nbsp; Learning Guide</span><b>{showGuide ? '⌃' : '⌄'}</b></button>{showGuide && <div className="dv-guide-body"><h3>How it works?</h3><p><b>÷ Divide:</b> Divide the decimal number by 2.</p><p><b>▣ Remainder:</b> Record the remainder (0 or 1).</p><p><b>→ Continue:</b> Use the quotient as the next number.</p><p><b>↻ Repeat:</b> Continue until the quotient becomes 0.</p><p><b>↑ Read:</b> Read the remainders from bottom to top.</p><div className="dv-key-idea"><b>Key Idea</b><p>Each remainder is a binary digit. Read them in reverse order to get the binary number.</p></div></div>}<div className="dv-guide-row">? &nbsp; Why Read Bottom to Top? <b>›</b></div><div className="dv-guide-row">ϟ &nbsp; Quick Help <b>›</b></div><div className="dv-current"><b>Current Step</b><div className="dv-current-flow"><span>Dividend<br /><strong>{steps[currentStep]?.dividend ?? decimalValue}</strong></span> → <span>÷ 2</span> → <span>Quotient<br /><strong>{steps[currentStep]?.quotient ?? 0}</strong></span> → <span>Remainder<br /><strong>{steps[currentStep]?.remainder ?? 0}</strong></span></div></div></aside>
    </div>
    <ConversionControls isPlaying={isPlaying} onTogglePlay={() => setIsPlaying((v) => !v)} onNext={next} onPrevious={previous} onReset={reset} speed={speed} onSpeedChange={setSpeed} currentStep={currentStep} totalSteps={steps.length} phase={phase} />
  </main>
}
