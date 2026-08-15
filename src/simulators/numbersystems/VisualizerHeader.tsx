/**
 * VisualizerHeader - Compact header with title, stepper, binary display, and legend
 */

import { DISPLAY_STEPS, getDisplayStep, isDisplayStepActive, isDisplayStepComplete } from './visualizerUtils'

interface VisualizerHeaderProps {
  readonly binaryValue: string
  readonly currentPhase: string
}

export function VisualizerHeader({ binaryValue, currentPhase }: VisualizerHeaderProps) {
  const activeStep = getDisplayStep(currentPhase)

  return (
    <div className="visualizer-header space-y-3 mb-4">
      {/* Top row: title + stepper */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-3">
        {/* Title card */}
        <div
          className="visualizer-title-card shrink-0 px-4 py-3 rounded-xl"
          style={{ backgroundColor: '#1e3a5f', color: 'white' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">🔢</span>
            <div>
              <div className="font-bold text-sm">Binary → Decimal</div>
              <div className="text-xs opacity-80">Place Value Method</div>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex-1 flex flex-wrap items-center justify-center gap-1 px-2">
          {DISPLAY_STEPS.map((step, index) => {
            const isActive = isDisplayStepActive(step.id, currentPhase)
            const isComplete = isDisplayStepComplete(step.id, currentPhase)
            const isLast = index === DISPLAY_STEPS.length - 1

            return (
              <div key={step.id} className="flex items-center gap-1">
                <div
                  className={`visualizer-step-pill px-2.5 py-1 rounded-full text-xs font-medium transition-all-smooth ${
                    isActive ? 'visualizer-step-active' : ''
                  }`}
                  style={{
                    backgroundColor: isActive
                      ? '#8b5cf6'
                      : isComplete
                        ? '#ecfdf5'
                        : 'var(--bg-secondary)',
                    color: isActive
                      ? 'white'
                      : isComplete
                        ? '#059669'
                        : 'var(--text-secondary)',
                    border: isActive ? '2px solid #7c3aed' : '1px solid var(--border-color)',
                  }}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {step.id}. {step.label}
                </div>
                {!isLast && (
                  <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-secondary)' }}>
                    →
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div
          className="shrink-0 flex items-center gap-3 px-3 py-2 rounded-lg text-xs"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
        >
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
            1 = Included
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" aria-hidden="true" />
            0 = Not Included
          </span>
        </div>
      </div>

      {/* Binary number display */}
      <div className="text-center">
        <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
          Binary Number
        </div>
        <div
          className="text-3xl sm:text-4xl font-mono font-bold tracking-wider"
          style={{ color: '#3b82f6' }}
        >
          {binaryValue}₂
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          We will convert this binary number to its decimal equivalent
        </div>
      </div>

      {/* Screen reader step announcement */}
      <div className="sr-only" aria-live="polite">
        Step {activeStep} of {DISPLAY_STEPS.length}: {DISPLAY_STEPS[activeStep - 1]?.label}
      </div>
    </div>
  )
}
