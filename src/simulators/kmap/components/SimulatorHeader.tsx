interface SimulatorHeaderProps {
  onBackToHome?: () => void
  onOpenPractice?: () => void
}

export default function SimulatorHeader({ onBackToHome, onOpenPractice }: SimulatorHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBackToHome}
          title="Back to Home"
          aria-label="Back to Home"
          className="text-slate-300 hover:text-violet-300 transition-colors px-3 py-2 text-lg"
        >
          <span aria-hidden>⌂</span>
          <span className="hidden sm:inline ml-2 text-sm">Home</span>
        </button>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-violet-400">Karnaugh Map Simulator</h1>
          <p className="text-slate-400 mt-2">
            Interactive learning tool for Boolean function simplification
          </p>
        </div>
        <button
          onClick={onOpenPractice}
          title="Practice & Mastery"
          aria-label="Practice & Mastery"
          className="text-slate-300 hover:text-violet-300 transition-colors px-3 py-2 text-lg"
        >
          <span aria-hidden>★</span>
          <span className="hidden sm:inline ml-2 text-sm">Practice & Mastery</span>
        </button>
      </div>
    </header>
  )
}