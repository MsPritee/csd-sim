import { useMemo, useState } from 'react'
import { minterms, maxterms } from '../../core/kmap'
import {
  performSimplification,
  loadExample,
  validateCellGroup,
  generateWalkthrough,
  type KMapSolution,
} from '../../application/kmap'
import { explainGroup } from '../../education/adjacency'
import { useKMapStore } from '../../stores/kmapStore'
import KMapGrid from './components/KMapGrid'
import SectionCard from './components/SectionCard'
import ExampleLibrary from './components/ExampleLibrary'
import VerifyPanel from './components/VerifyPanel'
import TruthTablePanel from './components/TruthTablePanel'
import SolutionWalkthrough from './components/SolutionWalkthrough'
import GroupingSolution from './components/GroupingSolution'
import SOPPOSConcept from './components/SOPPOSConcept/SOPPOSConcept'
import SimulatorHeader from './components/SimulatorHeader'
import KMapToolbar from './components/KMapToolbar'
import CellInfoPopup from './components/CellInfoPopup'
import LearningGuide from './components/LearningGuide'
import AdvancedPanel from './advanced/AdvancedPanel'
import { type KMapExample } from './examples'

interface KMapSimulatorProps {
  onBackToHome?: () => void
  onOpenPractice?: () => void
}

export default function KMapSimulator({ onBackToHome, onOpenPractice }: KMapSimulatorProps = {}) {
  const {
    variables,
    model: kmap,
    selectedCells,
    currentValue,
    showSOP,
    showMintermNumbers,
    hoveredCell,
    setVariables,
    setModel,
    setCell,
    setSelectedCells,
    setCurrentValue,
    setShowSOP,
    setShowMintermNumbers,
    setHoveredCell,
  } = useKMapStore()

  const [showLearningGuide, setShowLearningGuide] = useState(false)
  const [showSopPos, setShowSopPos] = useState(true)
  const [walkthroughOpen, setWalkthroughOpen] = useState(false)
  const [walkthroughHighlight, setWalkthroughHighlight] = useState<Map<number, number> | null>(null)
  const [viewMode, setViewMode] = useState<'kmap' | 'truth' | 'both'>('both')
  const [cellInfoPinned, setCellInfoPinned] = useState<number | null>(null)

  const variableCount = variables.length as 2 | 3 | 4

  const handleVariableCountChange = (count: 2 | 3 | 4) => {
    setVariables(['A', 'B', 'C', 'D'].slice(0, count))
  }

  const handleCellClick = (minterm: number) => {
    setCell(minterm, currentValue)
  }

  const handleCellSelect = (minterm: number) => {
    const newSelected = new Set(selectedCells)
    if (newSelected.has(minterm)) {
      newSelected.delete(minterm)
    } else {
      newSelected.add(minterm)
    }
    setSelectedCells(newSelected)
  }

  const clearKMap = () => {
    useKMapStore.getState().clear()
  }

  const handleLoadExample = (example: KMapExample) => {
    setVariables(example.variables)
    const next = loadExample(example)
    setModel(next)
    setSelectedCells(new Set())
    setWalkthroughHighlight(null)
  }

  const ones = new Set(minterms(kmap))
  const zeros = new Set(maxterms(kmap))

  const simplification = performSimplification(kmap)

  const walkthroughSolution = useMemo<KMapSolution | null>(
    () => (walkthroughOpen ? generateWalkthrough(kmap, showSOP ? 'sop' : 'pos') : null),
    [walkthroughOpen, kmap, showSOP],
  )

  const selectedGroup = useMemo(
    () => Array.from(selectedCells).sort((a, b) => a - b),
    [selectedCells],
  )
  const groupValidation = selectedGroup.length > 0 ? validateCellGroup(kmap, selectedGroup) : null

  const groupedSummary = useMemo(
    () => explainGroup(kmap, selectedGroup, showSOP ? 'sop' : 'pos'),
    [kmap, selectedGroup, showSOP],
  )

  const sopTerms = simplification.sopGroups.map((g) => g.productText)
  const posTerms = simplification.posGroups.map((g) => g.sumText)
  const simplifiedExpression = showSOP ? simplification.sop : simplification.pos
  const originalExpression =
    showSOP
      ? `Σm(${Array.from(ones).sort((a, b) => a - b).join(', ')})`
      : `ΠM(${Array.from(zeros).sort((a, b) => a - b).join(', ')})`

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <SimulatorHeader onBackToHome={onBackToHome} onOpenPractice={onOpenPractice} />

        <KMapToolbar
          variableCount={variableCount}
          currentValue={currentValue}
          showMintermNumbers={showMintermNumbers}
          onVariableCountChange={handleVariableCountChange}
          onCurrentValueChange={setCurrentValue}
          onToggleMintermNumbers={() => setShowMintermNumbers(!showMintermNumbers)}
          onClear={clearKMap}
        />

        <div className="grid items-start md:grid-cols-2 gap-6">
          {/* K-Map Grid */}
          <div className="bg-slate-900 rounded-lg p-4 sm:p-6 border border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h2 className="text-lg sm:text-xl font-semibold text-violet-300">K-Map Grid</h2>
              <div className="inline-flex rounded bg-slate-800 p-0.5" role="group" aria-label="View mode">
                {(['kmap', 'both', 'truth'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    aria-pressed={viewMode === mode}
                    className={`px-2.5 py-1 rounded text-sm capitalize ${
                      viewMode === mode ? 'bg-violet-600 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {mode === 'truth' ? 'Truth-Table' : mode === 'kmap' ? 'K-Map' : 'Both'}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Click cells to set values. Ctrl+click to select groups for validation. Right-click a cell
              to pin its detailed information; hover any cell to preview it live.
            </p>

            {viewMode !== 'truth' && (
              <KMapGrid
                kmap={kmap}
                onCellClick={handleCellClick}
                onCellSelect={handleCellSelect}
                onCellInfo={(minterm) => setCellInfoPinned(minterm)}
                selectedCells={selectedCells}
                hoveredCell={hoveredCell}
                onCellHover={setHoveredCell}
                showMintermNumbers={showMintermNumbers}
                showSOP={showSOP}
                highlightMap={walkthroughHighlight ?? undefined}
                showAdjacency
              />
            )}

            {viewMode !== 'truth' && (cellInfoPinned !== null || hoveredCell !== null) && (
              <CellInfoPopup
                kmap={kmap}
                minterm={hoveredCell ?? cellInfoPinned!}
                onClose={() => setCellInfoPinned(null)}
              />
            )}

            {viewMode !== 'kmap' && (
              <div className="mt-6">
                <TruthTablePanel
                  kmap={kmap}
                  showSOP={showSOP}
                  highlightedCell={hoveredCell ?? cellInfoPinned}
                  onSelectCell={(minterm) => setHoveredCell(minterm)}
                />
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Simplified Expression */}
            <SectionCard
              title="Simplified Expression"
              headerRight={
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSOP(true)}
                    className={`px-3 py-1 rounded text-sm ${
                      showSOP ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    SOP
                  </button>
                  <button
                    onClick={() => setShowSOP(false)}
                    className={`px-3 py-1 rounded text-sm ${
                      !showSOP ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    POS
                  </button>
                </div>
              }
            >

              <div className="bg-slate-800 rounded p-4 font-mono text-lg break-words">
                {simplifiedExpression}
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Groups</h3>
                <div className="space-y-2">
                  {(showSOP ? simplification.sopGroups : simplification.posGroups).map((group, idx) => (
                    <div key={idx} className="text-sm bg-slate-800 rounded p-2">
                      <span className="text-violet-400">Group {idx + 1}:</span>{' '}
                      <span className="text-slate-300">
                        Cells: [{group.cells.join(', ')}] → {showSOP ? group.productText : group.sumText}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            {/* Solution Walkthrough */}
            <div className="bg-slate-900 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between p-4">
                <div>
                  <h2 className="text-lg font-semibold text-violet-300">Solution Walkthrough</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Step-by-step {showSOP ? 'SOP' : 'POS'} derivation of the simplified expression.
                  </p>
                </div>
                <button
                  onClick={() => setWalkthroughOpen(!walkthroughOpen)}
                  aria-expanded={walkthroughOpen}
                  aria-label="Toggle Solution Walkthrough"
                  className="flex items-center justify-center h-8 w-8 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xl leading-none"
                >
                  {walkthroughOpen ? '−' : '+'}
                </button>
              </div>
              {walkthroughOpen && walkthroughSolution && (
                <div className="px-4 pb-4">
                  <SolutionWalkthrough
                    solution={walkthroughSolution}
                    onHighlightChange={(m) => setWalkthroughHighlight(m)}
                  />
                  <GroupingSolution
                    solution={walkthroughSolution}
                    onHighlightChange={(m) => setWalkthroughHighlight(m)}
                  />
                </div>
              )}
            </div>

            {/* Verify */}
            <VerifyPanel
              kmap={kmap}
              showSOP={showSOP}
              sopTerms={sopTerms}
              posTerms={posTerms}
              simplifiedExpression={simplifiedExpression}
              originalExpression={originalExpression}
              selectedGroup={selectedGroup}
            />

            {/* Learning Guide */}
            <LearningGuide open={showLearningGuide} onToggle={() => setShowLearningGuide(!showLearningGuide)} />

            {/* Why SOP Uses 1s and POS Uses 0s? */}
            <div className="bg-slate-900 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between gap-3 p-4">
                <h2 className="text-lg font-semibold text-violet-300">
                  Why SOP Uses 1s and POS Uses 0s?
                </h2>
                <button
                  onClick={() => setShowSopPos(!showSopPos)}
                  className="flex items-center justify-center h-8 w-8 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xl leading-none"
                  aria-expanded={showSopPos}
                  aria-label="Toggle Why SOP Uses 1s and POS Uses 0s"
                >
                  {showSopPos ? '−' : '+'}
                </button>
              </div>

              {showSopPos && (
                <div className="px-4 pb-4">
                  <SOPPOSConcept onLearnGrouping={() => setShowLearningGuide(true)} />
                </div>
              )}
            </div>

            {/* Example Library */}
            <ExampleLibrary onLoadExample={handleLoadExample} />

            {/* Group Validation */}
            {groupValidation && (
              <SectionCard
                title="Group Validation"
                defaultOpen
              >
                <div className="flex items-center justify-between">
                  {groupValidation.valid ? (<div className="text-green-400">
                    <p className="font-semibold">Valid Group</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Selected cells form a valid K-map group.
                    </p>
                    <ul className="text-sm text-slate-400 mt-2 space-y-1 list-disc list-inside">
                      {groupedSummary.reasons.map((r, idx) => (
                        <li key={idx}>{r.text}</li>
                      ))}
                    </ul>
                  </div>) : (
                    <div className="text-red-400">
                      <p className="font-semibold">Invalid Group</p>
                      <ul className="text-sm text-slate-400 mt-1 list-disc list-inside">
                        {groupValidation.issues.map((issue, idx) => (
                          <li key={idx}>{issue.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </SectionCard>
            )}
          </div>
        </div>

        {/* Connect Representations: Define & Analyze — full width below both panels */}
        <AdvancedPanel />
      </div>
    </div>
  )
}