import { useState } from 'react'
import KMapSimulator from './simulators/kmap/KMapSimulator'
import KMapPractice from './simulators/kmap/practice/KMapPractice'

type View = 'home' | 'kmap' | 'practice'

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home')

  if (currentView === 'kmap' || currentView === 'practice') {
    if (currentView === 'kmap') {
      return (
        <KMapSimulator
          onBackToHome={() => setCurrentView('home')}
          onOpenPractice={() => setCurrentView('practice')}
        />
      )
    }
    return (
      <div>
        <nav className="px-4 py-1.5 flex items-center gap-4 border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => setCurrentView('home')}
            className="font-medium transition-colors"
            style={{ color: 'var(--accent-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
          >
            Back to Home
          </button>
          <button
            onClick={() => setCurrentView('kmap')}
            className="font-medium text-sm transition-colors"
            style={{ color: 'var(--accent-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
          >
            ← K-map simulator
          </button>
        </nav>
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
          <KMapPractice />
        </div>
      </div>
    )
  }

  return (
    <main style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="mx-auto max-w-4xl px-4 py-2">
        {/* <h1 className="mt-4 text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>DigiWorld</h1> */}
        {/* <p className="mt-4 text-slate-300">
          Concept → Visualization → Experimentation → Practice. The K-map module
          is the flagship; the logic and educational engines are seeded across a
          strict four-layer architecture.
        </p> */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Layer title="Logic Engine" note="Pure TS · Boolean / K-map / circuits" />
          <Layer title="Educational Engine" note="Why · hints · mistakes · steps" />
          <Layer title="Application" note="Orchestration · use-cases · no math" />
          <Layer title="Presentation" note="React · SVG · motion · UI" />
        </div>

        <div className="mt-8 mb-2">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--accent-primary)' }}>Available Simulators</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <SimulatorCard
              title="Karnaugh Map Simulator"
              description="Interactive K-map learning tool with simplification, grouping validation, and educational content."
              status="Ready"
              onClick={() => setCurrentView('kmap')}
            />
            <SimulatorCard
              title="Logic Gates"
              description="Coming soon - Interactive logic gate simulator"
              status="Coming Soon"
              disabled
            />
            <SimulatorCard
              title="Combinational Circuits"
              description="Coming soon - Adders, multiplexers, and more"
              status="Coming Soon"
              disabled
            />
            <SimulatorCard
              title="Sequential Circuits"
              description="Coming soon - Flip-flops, counters, and FSM"
              status="Coming Soon"
              disabled
            />
          </div>
        </div>
      </div>
    </main>
  )
}

function Layer({ title, note }: { title: string; note: string }) {
  return (
    <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      <h2 className="font-semibold" style={{ color: 'var(--accent-primary)' }}>{title}</h2>
      <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{note}</p>
    </div>
  )
}

function SimulatorCard({
  title,
  description,
  status,
  onClick,
  disabled,
}: {
  title: string
  description: string
  status: string
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-left rounded-lg border p-6 transition-colors ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      style={{
        backgroundColor: disabled ? 'var(--bg-tertiary)' : 'var(--bg-card)',
        borderColor: 'var(--border-color)'
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = 'var(--accent-primary)';
          e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.backgroundColor = 'var(--bg-card)';
        }
      }}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-lg" style={{ color: 'var(--accent-primary)' }}>{title}</h3>
        <span
          className={`text-xs px-2 py-1 rounded ${status === 'Ready' ? '' : ''}`}
          style={{
            backgroundColor: status === 'Ready' ? 'var(--success-bg)' : 'var(--bg-tertiary)',
            color: status === 'Ready' ? 'var(--success-text)' : 'var(--text-muted)'
          }}
        >
          {status}
        </span>
      </div>
      <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{description}</p>
    </button>
  )
}