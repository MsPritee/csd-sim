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
        <nav className="bg-slate-900 border-b border-slate-700 px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => setCurrentView('home')}
            className="text-violet-400 hover:text-violet-300 font-medium"
          >
            ← Back to Home
          </button>
          <button
            onClick={() => setCurrentView('kmap')}
            className="text-violet-400 hover:text-violet-300 font-medium text-sm"
          >
            ← K-map simulator
          </button>
        </nav>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <KMapPractice />
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="font-mono text-sm uppercase tracking-widest text-violet-400">
          M0 · Repository Foundation
        </p>
        <h1 className="mt-4 text-4xl font-bold">Digital Logic Concept Lab</h1>
        <p className="mt-4 text-slate-300">
          Concept → Visualization → Experimentation → Practice. The K-map module
          is the flagship; the logic and educational engines are seeded across a
          strict four-layer architecture.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Layer title="Logic Engine" note="Pure TS · Boolean / K-map / circuits" />
          <Layer title="Educational Engine" note="Why · hints · mistakes · steps" />
          <Layer title="Application" note="Orchestration · use-cases · no math" />
          <Layer title="Presentation" note="React · SVG · motion · UI" />
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-violet-300 mb-4">Available Simulators</h2>
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
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
      <h2 className="font-semibold text-violet-300">{title}</h2>
      <p className="mt-1 text-sm text-slate-400">{note}</p>
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
      className={`text-left rounded-lg border p-6 transition-colors ${
        disabled
          ? 'border-slate-800 bg-slate-900/50 cursor-not-allowed opacity-50'
          : 'border-slate-700 bg-slate-900 hover:border-violet-500 hover:bg-slate-800 cursor-pointer'
      }`}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-lg text-violet-300">{title}</h3>
        <span
          className={`text-xs px-2 py-1 rounded ${
            status === 'Ready'
              ? 'bg-green-900/50 text-green-400'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          {status}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </button>
  )
}