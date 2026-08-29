import { useMemo, useState } from 'react'
import { GATE_DEFINITIONS, getGate } from '../../core/gates/catalog'
import { evaluateGate, generateTruthTable } from '../../core/gates/evaluate'
import type { Bit, GateType } from '../../core/gates/types'
import { lawsForGate } from '../../core/gates/laws'
import { getGateConcept } from '../../education/gates/concepts'
import { explainGate } from '../../education/gates/why'
import GateSymbol from './GateSymbol'
import TruthTable from './TruthTable'
import GatePractice from './GatePractice'
import GateChallenge from './GateChallenge'

interface GateSimulatorProps {
  onBackToHome?: () => void
}

type Mode = 'explore' | 'practice' | 'challenge'

const INPUT_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const

function defaultInputs(gate: GateType): Bit[] {
  return gate === 'BUFFER' || gate === 'NOT' ? [0] : [0, 0]
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-xl border p-3 sm:p-4 md:p-5"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      {title && (
        <h2 className="mb-2 sm:mb-3 text-xs sm:text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
          {title}
        </h2>
      )}
      {children}
    </section>
  )
}

export default function GateSimulator({ onBackToHome }: GateSimulatorProps = {}) {
  const [selected, setSelected] = useState<GateType>('AND')
  const [inputs, setInputs] = useState<Bit[]>([0, 0])
  const [mode, setMode] = useState<Mode>('explore')

  const handleSelect = (gate: GateType) => {
    setSelected(gate)
    setInputs(defaultInputs(gate))
  }

  const toggleInput = (i: number) => {
    setInputs((prev) => prev.map((b, idx) => (idx === i ? (b === 1 ? 0 : 1) : b)))
  }

  const def = getGate(selected)
  const isUnary = selected === 'BUFFER' || selected === 'NOT'
  const inputCount = isUnary ? 1 : 2

  const output = evaluateGate(selected, inputs)
  const explanation = explainGate(selected, inputs)
  const concept = getGateConcept(selected)
  const laws = lawsForGate(selected)
  const table = useMemo(() => generateTruthTable(selected, inputCount), [selected, inputCount])

  return (
    <main className="flex-1" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <button
          onClick={onBackToHome}
          className="transition-colors text-lg px-2 py-1"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          aria-label="Back to Home"
        >
          ⌂ <span className="hidden sm:inline text-sm">Home</span>
        </button>
        <h1 className="font-bold text-lg sm:text-2xl" style={{ color: 'var(--accent-primary)' }}>
          Logic Gates Simulator
        </h1>
        <div className="w-16" />
      </header>

      <div className="mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
        {/* mode toggle */}
        <div className="flex flex-wrap gap-2" data-testid="simulator-mode">
          {(['explore', 'practice', 'challenge'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex-1 min-w-[100px] px-3 sm:px-4 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-colors touch-action-manipulation"
              style={{
                backgroundColor: mode === m ? 'var(--accent-bg)' : 'var(--bg-card)',
                borderColor: mode === m ? 'var(--accent-primary)' : 'var(--border-color)',
                color: mode === m ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
              data-testid={`mode-${m}`}
            >
              {m === 'explore' ? 'Explore' : m === 'practice' ? 'Practice' : 'Challenge'}
            </button>
          ))}
        </div>

        {mode === 'practice' && <GatePractice seed="lg7-demo" />}
        {mode === 'challenge' && <GateChallenge seed="lg8-demo" />}

        {mode === 'explore' && (
          <>
        {/* gate selector */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2" data-testid="gate-selector">
          {GATE_DEFINITIONS.map((g) => (
            <button
              key={g.id}
              onClick={() => handleSelect(g.id)}
              className="px-2 sm:px-3 py-1.5 rounded-lg border text-xs sm:text-sm transition-colors touch-action-manipulation"
              style={{
                backgroundColor: selected === g.id ? 'var(--accent-bg)' : 'var(--bg-card)',
                borderColor: selected === g.id ? 'var(--accent-primary)' : 'var(--border-color)',
                color: selected === g.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
              data-testid={`gate-btn-${g.id.toLowerCase()}`}
            >
              {g.name}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          {/* symbol + inputs */}
          <Card title="Symbol &amp; signals">
            <GateSymbol gate={selected} inputs={inputs} output={output} />
            <div className="mt-3 sm:mt-4 flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Inputs
              </span>
              {inputs.map((b, i) => (
                <button
                  key={i}
                  onClick={() => toggleInput(i)}
                  className="flex items-center justify-between rounded-lg border px-3 sm:px-4 py-3 sm:py-2 transition-colors touch-action-manipulation"
                  style={{
                    borderColor: b === 1 ? 'var(--accent-primary)' : 'var(--border-color)',
                    backgroundColor: b === 1 ? 'var(--accent-bg)' : 'var(--bg-card)',
                    minHeight: '44px',
                  }}
                  data-testid={`input-toggle-${i}`}
                >
                  <span className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>{`${INPUT_LABELS[i]}`}</span>
                  <span className="font-mono text-base sm:text-lg tabular-nums" style={{ color: b === 1 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                    {b}
                  </span>
                </button>
              ))}
              <div
                className="flex items-center justify-between rounded-lg border px-3 sm:px-4 py-3 sm:py-2 mt-1"
                style={{ borderColor: output === 1 ? 'var(--success-bg)' : 'var(--border-color)', backgroundColor: 'var(--bg-tertiary)', minHeight: '44px' }}
                data-testid="output-badge"
              >
                <span className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>Y</span>
                <span className="font-mono text-lg sm:text-xl tabular-nums" style={{ color: output === 1 ? 'var(--success-text)' : 'var(--text-muted)' }}>
                  {output}
                </span>
              </div>
            </div>
          </Card>

          {/* why it works */}
          <Card title="Why this output?">
            <div className="space-y-2 sm:space-y-3">
              <div>
                <div className="font-mono text-lg sm:text-xl" data-testid="explanation-what" style={{ color: 'var(--accent-primary)' }}>
                  {explanation.what}
                </div>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed" data-testid="explanation-why" style={{ color: 'var(--text-secondary)' }}>
                  {explanation.why}
                </p>
              </div>
              <div
                className="rounded-lg px-3 py-2 text-xs"
                style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent-primary)' }}
              >
                {explanation.rule}
              </div>
              <ul className="list-disc pl-5 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                {explanation.notice.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Expression: </span>
                <span className="font-mono text-xs sm:text-sm" data-testid="expression">{def.booleanExpression}</span>
              </p>
            </div>
          </Card>
        </div>

        <Card title="Truth table">
          <TruthTable headerLabels={INPUT_LABELS.slice(0, inputCount)} table={table} currentInputs={inputs} />
        </Card>

        <Card title="Laws that hold">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {laws.length === 0 && (
              <span className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>None of the cataloged laws apply.</span>
            )}
            {laws.map((law) => (
              <span
                key={law.id}
                className="px-2 sm:px-2.5 py-1 rounded-full border text-xs"
                style={{ borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}
                title={law.statement}
              >
                {law.name}
              </span>
            ))}
          </div>
        </Card>

        <Card title="Learn the concept">
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Objective: </span>
            {concept.objective}
          </p>
          <div className="mt-2 sm:mt-3 space-y-2 text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {concept.explanation.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {concept.hints.length > 0 && (
            <div className="mt-2 sm:mt-3">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>Hints</span>
              <ul className="mt-1 list-disc pl-5 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                {concept.hints.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
          </>
        )}
      </div>
    </main>
  )
}