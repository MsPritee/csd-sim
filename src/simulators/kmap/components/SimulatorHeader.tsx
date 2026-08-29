interface SimulatorHeaderProps {
  onBackToHome?: () => void
  onOpenPractice?: () => void
  onShowOnboarding?: () => void
  onShowTutorial?: () => void
}

export default function SimulatorHeader({ onBackToHome, onOpenPractice, onShowOnboarding, onShowTutorial }: SimulatorHeaderProps) {
  return (
    <header className="mb-1.5 sm:mb-2 md:mb-3">
      <div className="flex items-center justify-between gap-1.5 sm:gap-3">
        <button
          onClick={onBackToHome}
          title="Back to Home"
          aria-label="Back to Home"
          className="shrink-0 transition-colors px-1.5 sm:px-2.5 py-1 text-lg min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <span aria-hidden>⌂</span>
          <span className="hidden sm:inline ml-2 text-sm">Home</span>
        </button>
        <div className="min-w-0 text-center flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold heading-dense" style={{ color: 'var(--accent-primary)' }}>Karnaugh Map Simulator</h1>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            Interactive learning tool for Boolean function simplification
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {onShowTutorial && (
            <button
              onClick={onShowTutorial}
              title="Step-by-Step Interactive Tutorial"
              aria-label="Step-by-Step Interactive Tutorial"
              className="shrink-0 transition-colors px-1.5 sm:px-2.5 py-1 text-lg min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <span aria-hidden>▶</span>
              <span className="hidden sm:inline ml-2 text-sm">Learn</span>
            </button>
          )}
          {onShowOnboarding && (
            <button
              onClick={onShowOnboarding}
              title="Show Tour"
              aria-label="Show Tour"
              className="shrink-0 transition-colors px-1.5 sm:px-2.5 py-1 text-lg min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <span aria-hidden>?</span>
              <span className="hidden sm:inline ml-2 text-sm">Tour</span>
            </button>
          )}
          <button
            onClick={onOpenPractice}
            title="Practice & Mastery"
            aria-label="Practice & Mastery"
            className="shrink-0 transition-colors px-1.5 sm:px-2.5 py-1 text-lg min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <span aria-hidden>★</span>
            <span className="hidden sm:inline ml-2 text-sm">Practice & Mastery</span>
          </button>
        </div>
      </div>
    </header>
  )
}
