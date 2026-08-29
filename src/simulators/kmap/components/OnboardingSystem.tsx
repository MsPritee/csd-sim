import { useState, useEffect } from 'react'

interface OnboardingStep {
  id: string
  title: string
  content: string
  target?: string // CSS selector for the element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: string // Optional action hint
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to K-Map Simulator!',
    content: 'This interactive tool will help you master Boolean function simplification using Karnaugh Maps. Let me show you around the interface.',
    position: 'center',
  },
  {
    id: 'kmap-grid',
    title: 'K-Map Grid',
    content: 'This is your main workspace. Click cells to set values (0, 1, or X for don\'t-care). Use Ctrl+click to select multiple cells for group validation.',
    target: '.kmap-grid-container',
    position: 'bottom',
    action: 'Try clicking a cell to set its value',
  },
  {
    id: 'toolbar',
    title: 'Control Toolbar',
    content: 'Use these controls to change the number of variables, set cell values, and toggle display options like minterm numbers.',
    target: '.kmap-toolbar',
    position: 'bottom',
    action: 'Try changing the cell value to 1',
  },
  {
    id: 'view-mode',
    title: 'View Modes',
    content: 'Switch between K-Map only, Truth Table only, Both views side-by-side, or the new Split View with resizable panels.',
    target: '[role="group"][aria-label="View mode"]',
    position: 'bottom',
    action: 'Try the Split View mode',
  },
  {
    id: 'results-tab',
    title: 'Results Tab',
    content: 'See your simplified expression, verify correctness, and validate cell groups. The system automatically calculates optimal groupings.',
    target: '.tabbed-panel',
    position: 'left',
    action: 'Click the Learning tab to explore more',
  },
  {
    id: 'learning-tab',
    title: 'Learning Tab',
    content: 'Access step-by-step solution walkthroughs, learning guides, and explanations of SOP vs POS concepts.',
    target: '.tabbed-panel',
    position: 'left',
    action: 'Explore the learning resources',
  },
  {
    id: 'examples-tab',
    title: 'Examples Tab',
    content: 'Load pre-built examples to practice different simplification scenarios and understand various grouping patterns.',
    target: '.tabbed-panel',
    position: 'left',
    action: 'Try loading an example',
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    content: 'You now know the basics. Start experimenting with different functions, or load examples to practice. Use the Tutorial button anytime to revisit this tour.',
    position: 'center',
  },
]

interface OnboardingSystemProps {
  onComplete: () => void
  onSkip: () => void
  autoStart?: boolean
}

export default function OnboardingSystem({ onComplete, onSkip, autoStart = false }: OnboardingSystemProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(autoStart)
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    // Highlight target element
    if (isVisible && onboardingSteps[currentStep].target) {
      const target = document.querySelector(onboardingSteps[currentStep].target)
      setHighlightedElement(target as HTMLElement)
    } else {
      setHighlightedElement(null)
    }
  }, [currentStep, isVisible])

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setIsVisible(false)
    onComplete()
  }

  const handleSkip = () => {
    setIsVisible(false)
    onSkip()
  }

  if (!isVisible) return null

  const step = onboardingSteps[currentStep]
  const isLastStep = currentStep === onboardingSteps.length - 1
  const isFirstStep = currentStep === 0

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={handleSkip}
        style={{ backdropFilter: 'blur(2px)' }}
      />

      {/* Highlight overlay */}
      {highlightedElement && (
        <div
          className="fixed z-40 pointer-events-none transition-all"
          style={{
            top: highlightedElement.getBoundingClientRect().top - 4,
            left: highlightedElement.getBoundingClientRect().left - 4,
            width: highlightedElement.getBoundingClientRect().width + 8,
            height: highlightedElement.getBoundingClientRect().height + 8,
            border: '3px solid var(--accent-primary)',
            borderRadius: '8px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-50 max-w-sm rounded-lg border elevation-tertiary p-4 transition-all"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          top: step.position === 'center' ? '50%' : highlightedElement ? highlightedElement.getBoundingClientRect().bottom + 16 : '50%',
          left: step.position === 'center' ? '50%' : highlightedElement ? highlightedElement.getBoundingClientRect().left : '50%',
          transform: step.position === 'center' ? 'translate(-50%, -50%)' : 'translateY(0)',
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold" style={{ color: 'var(--accent-primary)' }}>
            {step.title}
          </h3>
          <button
            onClick={handleSkip}
            className="text-lg leading-none transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            ×
          </button>
        </div>

        <p className="text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
          {step.content}
        </p>

        {step.action && (
          <div className="mb-3 p-2 rounded text-xs" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
            💡 {step.action}
          </div>
        )}

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${((currentStep + 1) / onboardingSteps.length) * 100}%`,
                backgroundColor: 'var(--accent-primary)',
              }}
            />
          </div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {currentStep + 1}/{onboardingSteps.length}
          </span>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="px-3 py-1.5 rounded text-sm transition-all disabled:opacity-50"
            style={{
              backgroundColor: isFirstStep ? 'var(--bg-tertiary)' : 'var(--bg-tertiary)',
              color: isFirstStep ? 'var(--text-muted)' : 'var(--text-primary)',
            }}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-1.5 rounded text-sm transition-all"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: '#fff',
              boxShadow: 'var(--shadow-accent)',
            }}
          >
            {isLastStep ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </>
  )
}
