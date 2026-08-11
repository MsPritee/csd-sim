import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LESSON_STEPS,
  lessonStepIndex,
  POS_GROUP_TRUTH_TABLE,
  POS_INPUT,
  POS_TRUTH_TABLE,
  SOP_GROUP_TRUTH_TABLE,
  SOP_INPUT,
  SOP_TRUTH_TABLE,
  maxtermFor,
  mintermFor,
} from '../../concepts/sop-pos'
import TruthTableMini from './TruthTableMini'
import VariableTransformation from './VariableTransformation'
import GateExplanation from './GateExplanation'
import KMapConnection from './KMapConnection'
import ComparisonTable from './ComparisonTable'

interface SOPPOSConceptProps {
  /** Jump straight to a step (used by the cell popup and SOP/POS links). */
  startStepId?: string
  /** Called when the student asks to learn K-map grouping next. */
  onLearnGrouping?: () => void
}

/**
 * "Why SOP uses 1s and POS uses 0s?"  — a separate, guided, visual lesson that
 * walks the chain  truth table → output goal → AND/OR behaviour → minterm /
 * maxterm → K-map cell → grouping, so students understand WHY (not just that)
 * SOP works with 1s and POS works with 0s.
 */
export default function SOPPOSConcept({ startStepId, onLearnGrouping }: SOPPOSConceptProps) {
  const [currentIndex, setCurrentIndex] = useState(() =>
    startStepId ? lessonStepIndex(startStepId) : 0,
  )
  const [revealAnswer, setRevealAnswer] = useState<boolean>(false)
  const [replayKey, setReplayKey] = useState<number>(0)

  const step = LESSON_STEPS[currentIndex]!
  const isLast = currentIndex === LESSON_STEPS.length - 1
  const isFirst = currentIndex === 0

  const goTo = (index: number) => {
    setCurrentIndex(Math.min(Math.max(index, 0), LESSON_STEPS.length - 1))
    setRevealAnswer(false)
  }

  const replay = () => {
    setCurrentIndex(0)
    setRevealAnswer(false)
    setReplayKey((key) => key + 1)
  }

  return (
    <div className="space-y-4" data-testid="soppos-concept">
      {/* progress */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500">
          Step {currentIndex + 1} of {LESSON_STEPS.length}
        </span>
        <div className="flex gap-1">
          {LESSON_STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              aria-label={`Go to ${s.title}`}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === currentIndex ? 'bg-violet-400' : i < currentIndex ? 'bg-violet-700' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${step.id}-${replayKey}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="rounded-lg border border-slate-700 bg-slate-900 p-4"
        >
          <h3 className="text-lg font-semibold text-violet-300">{step.title}</h3>
          <p className="mb-4 text-sm text-slate-400">{step.subtitle}</p>

          <StepBody
            stepId={step.id}
            revealAnswer={revealAnswer}
            setRevealAnswer={setRevealAnswer}
            onLearnGrouping={onLearnGrouping}
          />
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-2">
        <button
          onClick={() => goTo(currentIndex - 1)}
          disabled={isFirst}
          className="rounded bg-slate-800 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-40"
        >
          ← Back
        </button>
        <button
          onClick={() => goTo(currentIndex + 1)}
          disabled={isLast}
          className="rounded bg-violet-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-violet-500 disabled:opacity-40"
        >
          Next →
        </button>
        <button
          onClick={replay}
          className="ml-auto rounded bg-slate-800 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-700"
        >
          ↻ Replay
        </button>
      </div>
    </div>
  )
}

interface StepBodyProps {
  stepId: string
  revealAnswer: boolean
  setRevealAnswer: (value: boolean) => void
  onLearnGrouping?: () => void
}

function StepBody({ stepId, revealAnswer, setRevealAnswer, onLearnGrouping }: StepBodyProps) {
  switch (stepId) {
    case 'goal':
      return (
        <div className="space-y-3">
          <TruthTableMini
            spec={{ variables: ['A', 'B'], outputs: [0, 1, 0, 0], highlightMinterm: null }}
          />
          <p className="text-sm text-slate-400">
            A truth table is a list of all input combinations. Each row is one{' '}
            <span className="text-white">input combination</span> paired with its{' '}
            <span className="font-mono text-violet-300">output</span>.
          </p>
        </div>
      )

    case 'sop-goal': {
      const answer = mintermFor(SOP_INPUT)
      return (
        <div className="space-y-3">
          <TruthTableMini spec={SOP_TRUTH_TABLE} tone="green" />
          <p className="text-sm text-slate-400">
            We want <span className="font-mono text-green-400">F = 1</span> for the highlighted row:{' '}
            <span className="font-mono text-white">A = 0, B = 1</span>.
          </p>
          <p className="text-sm text-slate-400">
            What product term will produce <span className="font-mono text-green-400">1</span> for{' '}
            <em>exactly</em> this input? Think for a moment…
          </p>
          {!revealAnswer ? (
            <button
              onClick={() => setRevealAnswer(true)}
              className="rounded bg-slate-800 px-3 py-1.5 text-sm text-violet-300 transition-colors hover:bg-slate-700"
            >
              Reveal the minterm →
            </button>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-green-700/40 bg-green-900/10 p-3 text-sm">
                <span className="text-slate-400">Answer: </span>
                <span className="font-mono font-bold text-green-400">{answer}</span>
                <span className="ml-2 text-slate-500">(because A = 0 → A', B = 1 → B)</span>
              </div>
              <GateExplanation mode="sop" input={SOP_INPUT} />
            </div>
          )}
        </div>
      )
    }

    case 'sop-transformation':
      return (
        <div className="space-y-4">
          <VariableTransformation mode="sop" input={SOP_INPUT} />
          <GateExplanation mode="sop" input={SOP_INPUT} />
        </div>
      )

    case 'sop-minterm':
      return (
        <div className="space-y-3">
          <TruthTableMini spec={SOP_TRUTH_TABLE} tone="green" />
          <div className="rounded-lg border border-violet-700/40 bg-violet-900/10 p-3 text-sm">
            <p className="font-semibold text-violet-300">MINTERM</p>
            <p>A product term that identifies a specific input combination where the output is 1.</p>
            <p className="mt-1 text-slate-400">
              <span className="font-mono text-green-400">{mintermFor(SOP_INPUT)}</span> = 1{' '}
              <em>only</em> for A = 0, B = 1.
            </p>
          </div>
          <details className="text-xs text-slate-500">
            <summary className="cursor-pointer text-slate-400">See the deeper explanation</summary>
            <p className="mt-2">
              A minterm is the product of all variables (or their complements) such that the product
              is 1 for exactly one row of the truth table. Because AND is 1 only when every input is
              1, each minterm "selects" a single input combination.
            </p>
          </details>
        </div>
      )

    case 'sop-to-cell':
      return (
        <KMapConnection
          mode="sop"
          spec={SOP_TRUTH_TABLE}
          focusMinterms={[1]}
          labelMinterm={1}
        />
      )

    case 'sop-group-ones':
      return (
        <div className="space-y-3">
          <KMapConnection mode="sop" spec={SOP_GROUP_TRUTH_TABLE} focusMinterms={[1, 3]} />
          <ReasonChain labels={['SOP', 'built from minterms', 'minterms represent F = 1', 'so group the 1s']} tone="green" />
        </div>
      )

    case 'pos-goal': {
      const answer = maxtermFor(POS_INPUT)
      return (
        <div className="space-y-3">
          <TruthTableMini spec={POS_TRUTH_TABLE} tone="red" />
          <p className="text-sm text-slate-400">
            Now the goal is the opposite: we want <span className="font-mono text-red-400">F = 0</span>{' '}
            for the highlighted row: <span className="font-mono text-white">A = 0, B = 1</span>.
          </p>
          <p className="text-sm text-slate-400">
            What sum term will produce <span className="font-mono text-red-400">0</span> for exactly
            this input?
          </p>
          {!revealAnswer ? (
            <button
              onClick={() => setRevealAnswer(true)}
              className="rounded bg-slate-800 px-3 py-1.5 text-sm text-red-300 transition-colors hover:bg-slate-700"
            >
              Reveal the maxterm →
            </button>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-red-700/40 bg-red-900/10 p-3 text-sm">
                <span className="text-slate-400">Answer: </span>
                <span className="font-mono font-bold text-red-400">{answer}</span>
                <span className="ml-2 text-slate-500">(because A = 0 stays A, B = 1 → B')</span>
              </div>
              <GateExplanation mode="pos" input={POS_INPUT} />
            </div>
          )}
        </div>
      )
    }

    case 'pos-transformation':
      return (
        <div className="space-y-4">
          <VariableTransformation mode="pos" input={POS_INPUT} />
          <GateExplanation mode="pos" input={POS_INPUT} />
        </div>
      )

    case 'pos-maxterm':
      return (
        <div className="space-y-3">
          <TruthTableMini spec={POS_TRUTH_TABLE} tone="red" />
          <div className="rounded-lg border border-red-800/60 bg-red-900/10 p-3 text-sm">
            <p className="font-semibold text-red-300">MAXTERM</p>
            <p>A sum term that identifies a specific input combination where the output is 0.</p>
            <p className="mt-1 text-slate-400">
              <span className="font-mono text-red-400">{maxtermFor(POS_INPUT)}</span> = 0{' '}
              <em>only</em> for A = 0, B = 1.
            </p>
          </div>
        </div>
      )

    case 'pos-to-cell':
      return (
        <KMapConnection mode="pos" spec={POS_TRUTH_TABLE} focusMinterms={[1]} labelMinterm={1} />
      )

    case 'pos-group-zeros':
      return (
        <div className="space-y-3">
          <KMapConnection mode="pos" spec={POS_GROUP_TRUTH_TABLE} focusMinterms={[0, 2]} />
          <ReasonChain labels={['POS', 'built from maxterms', 'maxterms represent F = 0', 'so group the 0s']} tone="red" />
        </div>
      )

    case 'comparison':
      return <ComparisonTable input={SOP_INPUT} />

    case 'bridge':
      return (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">
            Now you know <span className="text-white">why</span> we work with 1s for SOP and 0s for
            POS. Next question: <span className="text-white">how</span> do we simplify them?
          </p>
          <button
            onClick={onLearnGrouping}
            className="rounded bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            Learn K-map Grouping →
          </button>
        </div>
      )

    default:
      return null
  }
}

function ReasonChain({ labels, tone }: { labels: readonly string[]; tone: 'green' | 'red' }) {
  const toneColor = tone === 'green' ? 'border-green-700/40 bg-green-900/10 text-green-300' : 'border-red-800/60 bg-red-900/10 text-red-300'
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {labels.map((label, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className={`rounded border px-2 py-1 font-medium ${toneColor}`}>{label}</span>
          {i < labels.length - 1 && <span className="text-slate-500">↓</span>}
        </span>
      ))}
    </div>
  )
}