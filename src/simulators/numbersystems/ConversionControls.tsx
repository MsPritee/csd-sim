/**
 * ConversionControls - Interactive controls for conversion animations
 * Provides play, pause, navigation, and speed controls
 */

interface ConversionControlsProps {
  readonly isPlaying: boolean
  readonly onTogglePlay: () => void
  readonly onNext: () => void
  readonly onPrevious: () => void
  readonly onReset: () => void
  readonly speed: 'slow' | 'normal' | 'fast'
  readonly onSpeedChange: (speed: 'slow' | 'normal' | 'fast') => void
  readonly currentStep: number
  readonly totalSteps: number
  readonly phase: string
  readonly disabled?: boolean
  readonly isPreviousDisabled?: boolean
}

export function ConversionControls({
  isPlaying,
  onTogglePlay,
  onNext,
  onPrevious,
  onReset,
  speed,
  onSpeedChange,
  currentStep,
  totalSteps,
  phase,
  disabled = false,
  isPreviousDisabled: isPreviousDisabledOverride,
}: ConversionControlsProps) {
  const getStepDisplay = () => {
    if (phase === 'complete') return 'Complete'
    if (phase === 'reading') return 'Reading remainders...'
    if (currentStep < 0) return `Step 1 / ${totalSteps}`
    return `Step ${currentStep + 1} / ${totalSteps}`
  }

  const isNextDisabled = disabled || phase === 'complete'
  const isPreviousDisabled =
    isPreviousDisabledOverride ?? (disabled || (currentStep === 0 && phase === 'division'))

  return (
    <div className="flex flex-wrap items-center gap-3 p-3">
      <button
        onClick={onTogglePlay}
        disabled={disabled}
        className="px-3 py-1.5 rounded-md font-medium text-sm transition-all-smooth disabled:opacity-50 active:scale-95"
        style={{
          backgroundColor: isPlaying ? 'var(--accent-secondary)' : 'var(--accent-primary)',
          color: 'white',
        }}
        aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
      >
        {isPlaying ? '⏸ Pause' : '▶ Start'}
      </button>

      <button
        onClick={onPrevious}
        disabled={isPreviousDisabled}
        className="px-3 py-1.5 rounded-md font-medium text-sm transition-all-smooth disabled:opacity-50 active:scale-95"
        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        aria-label="Previous step"
      >
        ← Previous
      </button>

      <button
        onClick={onNext}
        disabled={isNextDisabled}
        className="px-3 py-1.5 rounded-md font-medium text-sm transition-all-smooth disabled:opacity-50 active:scale-95"
        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        aria-label="Next step"
      >
        Next →
      </button>

      <button
        onClick={onReset}
        disabled={disabled}
        className="px-3 py-1.5 rounded-md font-medium text-sm transition-all-smooth disabled:opacity-50 active:scale-95"
        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        aria-label="Restart animation"
      >
        ↻ Restart
      </button>

      <div className="flex items-center gap-2 ml-auto">
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Speed:
        </span>
        <select
          value={speed}
          onChange={(e) => onSpeedChange(e.target.value as 'slow' | 'normal' | 'fast')}
          disabled={disabled}
          className="px-2 py-1.5 rounded-md text-xs transition-all-smooth"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          aria-label="Animation speed"
        >
          <option value="slow">Slow</option>
          <option value="normal">Normal</option>
          <option value="fast">Fast</option>
        </select>
      </div>

      <div className="text-xs font-medium px-2 py-1.5 rounded-md" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
        {getStepDisplay()}
      </div>
    </div>
  )
}
