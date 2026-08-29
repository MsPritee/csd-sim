import { useState } from 'react'
import SectionCard from './SectionCard'
import SolutionWalkthrough from './SolutionWalkthrough'
import GroupingSolution from './GroupingSolution'
import LearningGuide from './LearningGuide'
import SOPPOSConcept from './SOPPOSConcept/SOPPOSConcept'
import DontCareVisualization from './DontCareVisualization'
import type { KMapSolution } from '../../../application/kmap'

interface LearningTabContentProps {
  showSOP: boolean
  walkthroughSolution: KMapSolution | null
  onWalkthroughHighlight: (groups: { minterms: readonly number[]; colorIndex: number }[] | null) => void
}

export default function LearningTabContent({
  showSOP,
  walkthroughSolution,
  onWalkthroughHighlight,
}: LearningTabContentProps) {
  const [showLearningGuide, setShowLearningGuide] = useState(true)
  const [showSopPos, setShowSopPos] = useState(true)

  const bg = {
    card: { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' },
    tertiary: { backgroundColor: 'var(--bg-tertiary)' },
    heading: { color: 'var(--accent-primary)' },
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Solution Walkthrough */}
      <SectionCard
        title="Solution Walkthrough"
        subtitle={`Step-by-step ${showSOP ? 'SOP' : 'POS'} derivation of the simplified expression.`}
        defaultOpen={true}
        className="section-card-secondary"
      >
        {walkthroughSolution && (
          <>
            <SolutionWalkthrough
              solution={walkthroughSolution}
              onHighlightChange={onWalkthroughHighlight}
            />
            <GroupingSolution
              solution={walkthroughSolution}
              onHighlightChange={onWalkthroughHighlight}
            />
          </>
        )}
      </SectionCard>

      {/* Learning Guide */}
      <LearningGuide open={showLearningGuide} onToggle={() => setShowLearningGuide(!showLearningGuide)} />

      {/* Why SOP Uses 1s and POS Uses 0s? */}
      <div className="rounded-lg elevation-tertiary" style={bg.card}>
        <div className="flex items-center justify-between gap-control-group p-2 sm:p-3">
          <h2 className="text-base sm:text-lg font-semibold heading-dense" style={bg.heading}>
            Why SOP Uses 1s and POS Uses 0s?
          </h2>
          <button
            onClick={() => setShowSopPos(!showSopPos)}
            className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded text-lg sm:text-xl leading-none transition-all control-secondary"
            style={{ ...bg.tertiary, color: 'var(--text-primary)' }}
            aria-expanded={showSopPos}
            aria-label="Toggle Why SOP Uses 1s and POS Uses 0s"
          >
            {showSopPos ? '−' : '+'}
          </button>
        </div>

        {showSopPos && (
          <div className="px-2 sm:px-3 pb-2 sm:pb-3">
            <SOPPOSConcept onLearnGrouping={() => setShowLearningGuide(true)} />
          </div>
        )}
      </div>

      {/* Don't-Care Visualization */}
      <DontCareVisualization />
    </div>
  )
}
