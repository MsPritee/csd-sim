import { useState, useEffect, useCallback, useRef } from 'react'

interface TutorialStep {
  id: string
  title: string
  content: string
  target?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: string
  challenge?: {
    type: 'click-cell' | 'set-value' | 'select-cells' | 'load-example'
    description: string
    validator: () => boolean
  }
}

interface StepByStepTutorialProps {
  onComplete: () => void
  onSkip: () => void
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Step-by-Step Tutorial!',
    content: 'This interactive tutorial will guide you through solving your first K-Map problem. You\'ll learn by doing — each step includes a hands-on challenge to reinforce what you\'ve learned.',
    position: 'center',
  },
  {
    id: 'set-value',
    title: 'Step 1: Setting Cell Values',
    content: 'Click any cell in the K-Map to set its value. Each click cycles through: empty → 1 → 0 → X (don\'t-care) → empty.',
    target: '.kmap-grid-container',
    position: 'bottom',
    action: 'Try clicking a cell to set it to 1',
    challenge: {
      type: 'click-cell',
      description: 'Click any cell in the K-Map to set its value',
      validator: () => {
        const cells = document.querySelectorAll('[data-testid^="kmap-cell-"]')
        return cells.length > 0
      },
    },
  },
  {
    id: 'toolbar-controls',
    title: 'Step 2: Using the Toolbar',
    content: 'The toolbar lets you change the number of variables, select a default cell value, and toggle minterm number visibility. These controls affect how you interact with the grid.',
    target: '.kmap-toolbar',
    position: 'bottom',
    action: 'Explore the variable count selector',
  },
  {
    id: 'groups-intro',
    title: 'Step 3: Understanding Groups',
    content: 'Groups are rectangular clusters of 1-cells (for SOP) or 0-cells (for POS). Valid groups must contain 1, 2, 4, 8, or 16 cells and can wrap around edges. Larger groups eliminate more variables!',
    target: '.kmap-grid-container',
    position: 'bottom',
    action: 'Look at the grid and think about which cells could form a group',
  },
  {
    id: 'results-tab',
    title: 'Step 4: Reading the Results',
    content: 'The Results tab shows the simplified expression, group breakdown, and verification. The expression is automatically computed from optimal groupings. Expand a group to see its variable analysis.',
    target: '.tabbed-panel',
    position: 'left',
    action: 'Click the Results tab and expand a group',
  },
  {
    id: 'truth-table',
    title: 'Step 5: Truth Table Connection',
    content: 'The Truth Table shows every input/output combination. Each row maps to one K-Map cell. Hover over rows to see the connection highlighted in both views.',
    target: '.tabbed-panel',
    position: 'left',
    action: 'Switch to Truth Table view and hover over a row',
  },
  {
    id: 'export',
    title: 'Step 6: Export Your Work',
    content: 'Click "Export PDF" in the Results tab to download a report with your K-Map, expression, truth table, and group analysis. Great for homework submissions!',
    target: '.tabbed-panel',
    position: 'left',
    action: 'Find and click the Export PDF button',
  },
  {
    id: 'complete',
    title: 'Tutorial Complete!',
    content: 'You now know the essentials of K-Map simplification. Try the Practice mode to solve problems with guided assistance, or explore the Examples tab for more complex scenarios.',
    position: 'center',
  },
]

export default function StepByStepTutorial({ onComplete, onSkip }: StepByStepTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)
  const [challengeCompleted, setChallengeCompleted] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const step = tutorialSteps[currentStep]!

  useEffect(() => {
    if (isVisible && step.target) {
      const target = document.querySelector(step.target)
      setHighlightedElement(target as HTMLElement)
    } else {
      setHighlightedElement(null)
    }
    setChallengeCompleted(false)
  }, [currentStep, isVisible, step.target])

  useEffect(() => {
    if (step.challenge?.validator) {
      const checkInterval = setInterval(() => {
        if (step.challenge!.validator()) {
          setChallengeCompleted(true)
        }
      }, 500)
      return () => clearInterval(checkInterval)
    }
  }, [step.challenge])

  const handleComplete = useCallback(() => {
    setIsVisible(false)
    onComplete()
  }, [onComplete])

  const handleNext = useCallback(() => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }, [currentStep, handleComplete])

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const handleSkip = useCallback(() => {
    setIsVisible(false)
    onSkip()
  }, [onSkip])

  if (!isVisible) return null

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === tutorialSteps.length - 1
  const hasChallenge = !!step.challenge

  const tooltipStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-card)',
    borderColor: 'var(--border-color)',
  }

  if (step.position === 'center') {
    tooltipStyle.top = '50%'
    tooltipStyle.left = '50%'
    tooltipStyle.transform = 'translate(-50%, -50%)'
  } else if (highlightedElement) {
    const rect = highlightedElement.getBoundingClientRect()
    switch (step.position) {
      case 'bottom':
        tooltipStyle.top = rect.bottom + 16
        tooltipStyle.left = rect.left
        break
      case 'top':
        tooltipStyle.top = rect.top - 16
        tooltipStyle.left = rect.left
        tooltipStyle.transform = 'translateY(-100%)'
        break
      case 'left':
        tooltipStyle.top = rect.top
        tooltipStyle.left = rect.left - 16
        tooltipStyle.transform = 'translateX(-100%)'
        break
      case 'right':
        tooltipStyle.top = rect.top
        tooltipStyle.left = rect.right + 16
        break
    }
  } else {
    tooltipStyle.top = '50%'
    tooltipStyle.left = '50%'
    tooltipStyle.transform = 'translate(-50%, -50%)'
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={handleSkip}
        style={{ backdropFilter: 'blur(2px)' }}
      />

      {highlightedElement && (
        <div
          className="fixed z-40 pointer-events-none transition-all duration-300"
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

      <div
        ref={tooltipRef}
        className="fixed z-50 max-w-sm rounded-lg border elevation-tertiary p-4 transition-all duration-300"
        style={tooltipStyle}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}>
              {currentStep + 1}/{tutorialSteps.length}
            </span>
            <h3 className="text-base font-semibold" style={{ color: 'var(--accent-primary)' }}>
              {step.title}
            </h3>
          </div>
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

        {hasChallenge && (
          <div
            className="mb-3 p-2 rounded text-xs border"
            style={{
              backgroundColor: challengeCompleted ? 'var(--success-bg)' : 'var(--warning-bg)',
              borderColor: challengeCompleted ? 'var(--success-border)' : 'var(--warning-border)',
              color: challengeCompleted ? 'var(--success-text)' : 'var(--warning-text)',
            }}
          >
            {challengeCompleted ? '✓ Challenge completed!' : `⏳ ${step.challenge!.description}`}
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
                backgroundColor: 'var(--accent-primary)',
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="px-3 py-1.5 rounded text-sm transition-all disabled:opacity-50"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: isFirstStep ? 'var(--text-muted)' : 'var(--text-primary)',
            }}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-1.5 rounded text-sm transition-all"
            style={{
              backgroundColor: hasChallenge && !challengeCompleted ? 'var(--bg-tertiary)' : 'var(--accent-primary)',
              color: hasChallenge && !challengeCompleted ? 'var(--text-muted)' : '#fff',
              boxShadow: hasChallenge && !challengeCompleted ? 'none' : 'var(--shadow-accent)',
            }}
            disabled={hasChallenge && !challengeCompleted}
          >
            {isLastStep ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </>
  )
}
