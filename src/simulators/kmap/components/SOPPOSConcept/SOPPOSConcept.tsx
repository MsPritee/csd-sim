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
} from '../../concepts/sop-pos'
import TruthTableMini from './TruthTableMini'
import ComparisonTable from './ComparisonTable'
import GoalStep from './steps/GoalStep'
import TransformationStep from './steps/TransformationStep'
import TermDefinitionStep from './steps/TermDefinitionStep'
import ToCellStep from './steps/ToCellStep'
import GroupStep from './steps/GroupStep'

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
          <TruthTableMini spec={{ variables: ['A', 'B'], outputs: [0, 1, 0, 0], highlightMinterm: null }} />
          <p className="text-sm text-slate-400">
            A truth table is a list of all input combinations. Each row is one{' '}
            <span className="text-white">input combination</span> paired with its{' '}
            <span className="font-mono text-violet-300">output</span>.
          </p>
        </div>
      )

    case 'sop-goal':
      return (
        <GoalStep
          mode="sop"
          spec={SOP_TRUTH_TABLE}
          input={SOP_INPUT}
          revealAnswer={revealAnswer}
          setRevealAnswer={setRevealAnswer}
        />
      )

    case 'sop-transformation':
      return <TransformationStep mode="sop" input={SOP_INPUT} />

    case 'sop-minterm':
      return <TermDefinitionStep mode="sop" spec={SOP_TRUTH_TABLE} input={SOP_INPUT} />

    case 'sop-to-cell':
      return <ToCellStep mode="sop" spec={SOP_TRUTH_TABLE} focusMinterms={[1]} labelMinterm={1} />

    case 'sop-group-ones':
      return (
        <GroupStep
          mode="sop"
          spec={SOP_GROUP_TRUTH_TABLE}
          focusMinterms={[1, 3]}
          reasonLabels={['SOP', 'built from minterms', 'minterms represent F = 1', 'so group the 1s']}
          tone="green"
        />
      )

    case 'pos-goal':
      return (
        <GoalStep
          mode="pos"
          spec={POS_TRUTH_TABLE}
          input={POS_INPUT}
          revealAnswer={revealAnswer}
          setRevealAnswer={setRevealAnswer}
        />
      )

    case 'pos-transformation':
      return <TransformationStep mode="pos" input={POS_INPUT} />

    case 'pos-maxterm':
      return <TermDefinitionStep mode="pos" spec={POS_TRUTH_TABLE} input={POS_INPUT} />

    case 'pos-to-cell':
      return <ToCellStep mode="pos" spec={POS_TRUTH_TABLE} focusMinterms={[1]} labelMinterm={1} />

    case 'pos-group-zeros':
      return (
        <GroupStep
          mode="pos"
          spec={POS_GROUP_TRUTH_TABLE}
          focusMinterms={[0, 2]}
          reasonLabels={['POS', 'built from maxterms', 'maxterms represent F = 0', 'so group the 0s']}
          tone="red"
        />
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