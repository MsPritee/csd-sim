interface SimulatorHeaderProps {
  onBackToHome?: () => void
  onOpenPractice?: () => void
}

export default function SimulatorHeader({ onBackToHome, onOpenPractice }: SimulatorHeaderProps) {
  return (
    <header className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <button
          onClick={onBackToHome}
          title="Back to Home"
          aria-label="Back to Home"
          className="shrink-0 transition-colors px-2 sm:px-3 py-2 text-lg"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <span aria-hidden>⌂</span>
          <span className="hidden sm:inline ml-2 text-sm">Home</span>
        </button>
        <div className="min-w-0 text-center">
          <h1 className="text-xl sm:text-3xl font-bold leading-tight" style={{ color: 'var(--accent-primary)' }}>Karnaugh Map Simulator</h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            Interactive learning tool for Boolean function simplification
          </p>
        </div>
        <button
          onClick={onOpenPractice}
          title="Practice & Mastery"
          aria-label="Practice & Mastery"
          className="shrink-0 transition-colors px-2 sm:px-3 py-2 text-lg"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <span aria-hidden>★</span>
          <span className="hidden sm:inline ml-2 text-sm">Practice & Mastery</span>
        </button>
      </div>
    </header>
  )
}