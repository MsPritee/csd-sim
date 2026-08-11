import { useMemo, useState } from 'react'
import type { KMapModel, CellValue } from '../../core/kmap'
import { minterms, maxterms, adjacentMinterms } from '../../core/kmap'
import { mintermToString } from '../../core/boolean'
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
import ExpandableSection from './components/ExpandableSection'
import SectionCard from './components/SectionCard'
import ExampleLibrary from './components/ExampleLibrary'
import VerifyPanel from './components/VerifyPanel'
import TruthTablePanel from './components/TruthTablePanel'
import SolutionWalkthrough from './components/SolutionWalkthrough'
import GroupingSolution from './components/GroupingSolution'
import SOPPOSConcept from './components/SOPPOSConcept/SOPPOSConcept'
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
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
              <p className="text-slate-400 mt-2">Interactive learning tool for Boolean function simplification</p>
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

        {/* Controls */}
        <div className="bg-slate-900 rounded-lg p-6 mb-6 border border-slate-700">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Variables</label>
              <select
                value={variableCount}
                onChange={(e) => handleVariableCountChange(Number(e.target.value) as 2 | 3 | 4)}
                className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
              >
                <option value={2}>2 Variables (A, B)</option>
                <option value={3}>3 Variables (A, B, C)</option>
                <option value={4}>4 Variables (A, B, C, D)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Cell Value</label>
              <div className="flex gap-2">
                {[0, 1, 'X'].map((val) => (
                  <button
                    key={val}
                    onClick={() => setCurrentValue(val as CellValue)}
                    className={`px-3 py-2 rounded ${
                      currentValue === val
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {val === 'X' ? 'X' : val}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Display</label>
              <button
                onClick={() => setShowMintermNumbers(!showMintermNumbers)}
                className={`px-3 py-2 rounded ${
                  showMintermNumbers
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {showMintermNumbers ? 'Hide Numbers' : 'Show Numbers'}
              </button>
            </div>

            <button
              onClick={clearKMap}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white ml-auto"
            >
              Clear K-Map
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* K-Map Grid */}
          <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-violet-300">K-Map Grid</h2>
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

              <div className="bg-slate-800 rounded p-4 font-mono text-lg">
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
            <div className="bg-slate-900 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between gap-3 p-4">
                <h2 className="text-lg font-semibold text-violet-300">Learning Guide</h2>
                <button
                  onClick={() => setShowLearningGuide(!showLearningGuide)}
                  aria-expanded={showLearningGuide}
                  aria-label="Toggle Learning Guide"
                  className="flex items-center justify-center h-8 w-8 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xl leading-none"
                >
                  {showLearningGuide ? '−' : '+'}
                </button>
              </div>

              {showLearningGuide && (
                <div className="space-y-4 text-sm text-slate-300 px-4 pb-4">
                  <ExpandableSection title="What are Minterms and Maxterms?" defaultExpanded={true}>
                    <div className="space-y-2 text-slate-400">
                      <p>
                        <strong className="text-white">Minterms (m₀, m₁, m₂...)</strong> represent input combinations where the output is 1.
                        Each minterm corresponds to a unique cell in the K-map.
                      </p>
                      <p>
                        <strong className="text-white">Maxterms (M₀, M₁, M₂...)</strong> represent input combinations where the output is 0.
                        These are used in Product of Sums (POS) simplification.
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        💡 Hover over any cell to see its minterm/maxterm notation and binary representation.
                      </p>
                    </div>
                  </ExpandableSection>

                  <ExpandableSection title="Understanding Binary to Product Terms">
                    <div className="space-y-2 text-slate-400">
                      <p>
                        Each cell's binary representation tells us which variables are complemented (') or uncomplemented.
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong className="text-green-400">Bit = 1:</strong> Variable is TRUE → uncomplemented (e.g., A)</li>
                        <li><strong className="text-red-400">Bit = 0:</strong> Variable is FALSE → complemented (e.g., A')</li>
                      </ul>
                      <p className="text-xs">
                        Example: Binary 101 → A'B'C (A'=0, B=1, C=1)
                      </p>
                    </div>
                  </ExpandableSection>

                  <ExpandableSection title="K-Map Fundamentals">
                    <div className="space-y-2 text-slate-400">
                      <p>
                        <strong className="text-white">Why K-Maps?</strong> They provide a visual method for simplifying Boolean expressions by identifying groups of adjacent cells.
                      </p>
                      <p>
                        <strong className="text-white">Gray Code Ordering:</strong> K-maps use Gray code (00, 01, 11, 10) so adjacent cells always differ by exactly one variable - essential for correct grouping.
                      </p>
                      <p>
                        <strong className="text-white">Grouping Rules:</strong>
                      </p>
                      <ul className="list-disc list-inside">
                        <li>Groups must contain 1, 2, 4, 8, or 16 cells (powers of 2)</li>
                        <li>Groups must be rectangular</li>
                        <li>Groups can wrap around edges</li>
                        <li>Larger groups eliminate more variables</li>
                      </ul>
                      <p className="text-xs text-slate-500">
                        The K-map grid marks valid adjacent cells of the hovered cell with a dashed outline — try hovering different cells to explore adjacency.
                      </p>
                    </div>
                  </ExpandableSection>
                </div>
              )}
            </div>

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

function CellInfoPopup({ kmap, minterm, onClose }: { kmap: KMapModel; minterm: number; onClose: () => void }) {
  const variables = kmap.layout.variables
  const cell = kmap.cells.flat().find((c) => c.minterm === minterm)
  if (!cell) return null

  const binaryString = minterm.toString(2).padStart(variables.length, '0')
  const productTerm = mintermToString(variables, minterm)
  const isMinterm = cell.value === 1
  const isMaxterm = cell.value === 0

  const variableStates = variables.map((variable, index) => {
    const bit = (minterm >> (variables.length - 1 - index)) & 1
    const isComplemented = bit === 0
    return {
      variable,
      bit,
      isComplemented,
      literal: isComplemented ? `${variable}'` : variable,
    }
  })

  const adjacent = adjacencyLines(kmap, minterm)

  return (
    <div className="mt-4 bg-slate-800 rounded-lg p-4 border border-violet-500/30">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-violet-300">Cell Information</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xl leading-none"
        >
          ×
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Minterm:</span>
            <span className="text-white font-mono">m{minterm}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Maxterm:</span>
            <span className="text-white font-mono">M{minterm}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Binary:</span>
            <span className="text-white font-mono">{binaryString}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Product Term:</span>
            <span className="text-white font-mono">{productTerm}</span>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-3">
          <h4 className="text-violet-300 font-semibold mb-2">Variable States</h4>
          <div className="space-y-1">
            {variableStates.map(({ variable, bit, literal }) => (
              <div key={variable} className="flex items-center justify-between">
                <span className="text-slate-400">{variable}:</span>
                <div className="flex items-center gap-2">
                  <span className={`font-mono px-2 py-0.5 rounded ${
                    bit === 1
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-red-900/50 text-red-400'
                  }`}>
                    {bit}
                  </span>
                  <span className="text-white font-mono">→</span>
                  <span className="text-white font-mono">{literal}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-700 pt-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Current Value:</span>
            <span className={`font-mono ${
              cell.value === 1 ? 'text-green-400' :
              cell.value === 0 ? 'text-red-400' :
              cell.value === 'X' ? 'text-yellow-400' : 'text-slate-500'
            }`}>
              {cell.value === null ? 'Empty' : cell.value}
            </span>
          </div>
          {isMinterm && (
            <p className="text-green-400 text-xs mt-1">This cell is a minterm (output = 1)</p>
          )}
          {isMaxterm && (
            <p className="text-red-400 text-xs mt-1">This cell is a maxterm (output = 0)</p>
          )}
        </div>

        {adjacent.length > 0 && (
          <div className="border-t border-slate-700 pt-3">
            <h4 className="text-violet-300 font-semibold mb-2">Adjacent Cells</h4>
            <ul className="space-y-1 text-xs text-slate-400">
              {adjacent.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="border-t border-slate-700 pt-3">
          <h4 className="text-violet-300 font-semibold mb-2">Complementation Rules</h4>
          <div className="space-y-1 text-xs text-slate-400">
            <p><span className="text-green-400">Bit = 1:</span> Variable is TRUE → uncomplemented (e.g., A)</p>
            <p><span className="text-red-400">Bit = 0:</span> Variable is FALSE → complemented (e.g., A')</p>
            <p className="mt-2 text-slate-500">
              In SOP: 0 becomes A' because we need the term to be true when A=0
            </p>
            <p className="text-slate-500">
              In POS: 0 becomes A because we want the sum to be 0 when A=0
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function adjacencyLines(kmap: KMapModel, minterm: number): string[] {
  const neighbors = adjacentMinterms(kmap, minterm)
  if (neighbors.length === 0) return []
  return [
    `Adjacent cells differ by exactly one variable: ${neighbors.map((m) => `m${m}`).join(', ')}.`,
    'They can be merged into a larger group to eliminate that differing variable.',
  ]
}