import { useMemo, useState } from 'react'
import { minterms, maxterms, dontCares, simplify } from '../../core/kmap'
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
import FiveVarGrid from './components/FiveVarGrid'
import TruthTablePanel from './components/TruthTablePanel'
import SimulatorHeader from './components/SimulatorHeader'
import KMapToolbar from './components/KMapToolbar'
import CellInfoPopup from './components/CellInfoPopup'
import AdvancedPanel from './advanced/AdvancedPanel'
import TabbedPanel from './components/TabbedPanel'
import ResultsTabContent from './components/ResultsTabContent'
import LearningTabContent from './components/LearningTabContent'
import ExamplesTabContent from './components/ExamplesTabContent'
import SplitView from './components/SplitView'
import OnboardingSystem from './components/OnboardingSystem'
import PdfExportButton from './components/PdfExportButton'
import ExpressionCircuitChain from './components/ExpressionCircuitChain'
import StepByStepTutorial from './components/StepByStepTutorial'
import { KMAP_GROUP_COLORS } from './components/kmapHighlight'
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

  const [walkthroughHighlight, setWalkthroughHighlight] = useState<{ minterms: readonly number[]; colorIndex: number }[] | null>(null)
  const [showGroups, setShowGroups] = useState(true)
  const [viewMode, setViewMode] = useState<'kmap' | 'truth' | 'both' | 'split'>('both')
  const [cellInfoPinned, setCellInfoPinned] = useState<number | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)

  const variableCount = variables.length as 2 | 3 | 4 | 5
  const is5Var = variables.length === 5

  const handleVariableCountChange = (count: 2 | 3 | 4 | 5) => {
    const vars = count === 5
      ? ['A', 'B', 'C', 'D', 'E']
      : ['A', 'B', 'C', 'D'].slice(0, count)
    setVariables(vars)
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

  // Full simplification with GroupedTerm data for circuit diagram
  const fullSimplification = useMemo(() => {
    const ones = new Set(minterms(kmap))
    const zeros = new Set(maxterms(kmap))
    const dc = new Set(dontCares(kmap))
    return simplify(kmap, ones, zeros, dc)
  }, [kmap])

  const walkthroughSolution = useMemo<KMapSolution | null>(
    () => generateWalkthrough(kmap, showSOP ? 'sop' : 'pos'),
    [kmap, showSOP],
  )

  const handleWalkthroughHighlight = (m: { minterms: readonly number[]; colorIndex: number }[] | null) => {
    setWalkthroughHighlight(m)
  }

  // Auto-compute overlays from ALL simplification groups so they always show on the grid
  const simplificationOverlays = useMemo(() => {
    const groups = showSOP ? simplification.sopGroups : simplification.posGroups
    return groups.map((g, i) => ({
      minterms: g.cells,
      colorIndex: i % KMAP_GROUP_COLORS.length,
    }))
  }, [simplification, showSOP])

  // Effective overlays: walkthrough overrides when active, otherwise show all simplification groups
  const effectiveOverlays = useMemo(() => {
    if (walkthroughHighlight && walkthroughHighlight.length > 0) return walkthroughHighlight
    if (showGroups && simplificationOverlays.length > 0) return simplificationOverlays
    return undefined
  }, [walkthroughHighlight, showGroups, simplificationOverlays])

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

  const bg = {
    page: { backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' },
    card: { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' },
    tertiary: { backgroundColor: 'var(--bg-tertiary)' },
    accent: { backgroundColor: 'var(--accent-primary)', color: '#fff' },
    muted: { color: 'var(--text-secondary)' },
    heading: { color: 'var(--accent-primary)' },
  }

  return (
    <div className="min-h-screen p-1.5 sm:p-2 md:p-3" style={bg.page}>
      <div className="max-w-6xl mx-auto">
        <SimulatorHeader
          onBackToHome={onBackToHome}
          onOpenPractice={onOpenPractice}
          onShowOnboarding={() => setShowOnboarding(true)}
          onShowTutorial={() => setShowTutorial(true)}
        />

        <KMapToolbar
          variableCount={variableCount}
          currentValue={currentValue}
          showMintermNumbers={showMintermNumbers}
          onVariableCountChange={handleVariableCountChange}
          onCurrentValueChange={setCurrentValue}
          onToggleMintermNumbers={() => setShowMintermNumbers(!showMintermNumbers)}
          onClear={clearKMap}
        />

        <div className="grid items-start md:grid-cols-2 gap-section">
          {/* K-Map Grid */}
          <div className="kmap-grid-container rounded-lg px-1 py-1 md:py-2 md:px-2.5 pb-1.5 sm:px-2" style={bg.card}>
            <div className="flex items-center justify-between" style={{ minHeight: '44px' }}>
              <h2 className="text-lg sm:text-xl font-semibold heading-dense" style={bg.heading}>K-Map Grid</h2>
              <div className="flex items-center gap-control-group">
                <button
                  onClick={() => setShowGroups((g) => !g)}
                  aria-pressed={showGroups}
                  className="px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all touch-action-manipulation min-h-[44px]"
                  style={{
                    backgroundColor: showGroups ? 'var(--accent-primary)' : 'transparent',
                    color: showGroups ? '#fff' : 'var(--text-secondary)',
                    boxShadow: showGroups ? 'var(--shadow-accent)' : 'none',
                  }}
                  onMouseEnter={(e) => { if (!showGroups) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)' }}
                  onMouseLeave={(e) => { if (!showGroups) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  {showGroups ? 'Groups On' : 'Groups Off'}
                </button>
                <div className="flex items-center gap-control-group" role="group" aria-label="View mode">
                  {(['kmap', 'both', 'truth', 'split'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      aria-pressed={viewMode === mode}
                      className="px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all touch-action-manipulation min-h-[44px]"
                      style={{
                        backgroundColor: viewMode === mode ? 'var(--accent-primary)' : 'transparent',
                        color: viewMode === mode ? '#fff' : 'var(--text-secondary)',
                        boxShadow: viewMode === mode ? 'var(--shadow-accent)' : 'none',
                      }}
                      onMouseEnter={(e) => { if (viewMode !== mode) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)' }}
                      onMouseLeave={(e) => { if (viewMode !== mode) e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      {mode === 'truth' ? 'Truth-Table' : mode === 'kmap' ? 'K-Map' : mode === 'split' ? 'Split' : 'Both'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs sm:text-sm mb-1 sm:mb-1.5" style={bg.muted}>
              Click cells to set values. Ctrl+click to select groups for validation. Right-click a cell
              to pin its detailed information; hover any cell to preview it live.
            </p>

            {viewMode === 'split' && !is5Var ? (
              <SplitView
                kmap={kmap}
                onCellClick={handleCellClick}
                onCellSelect={handleCellSelect}
                onCellInfo={(minterm) => setCellInfoPinned(minterm)}
                selectedCells={selectedCells}
                hoveredCell={hoveredCell}
                onCellHover={setHoveredCell}
                showMintermNumbers={showMintermNumbers}
                showSOP={showSOP}
                groupOverlays={effectiveOverlays}
                showAdjacency
                cellInfoPinned={cellInfoPinned}
                setCellInfoPinned={setCellInfoPinned}
              />
            ) : (
              <>
                {viewMode !== 'truth' && (
                  is5Var ? (
                    <FiveVarGrid
                      kmap={kmap}
                      onCellClick={handleCellClick}
                      onCellSelect={handleCellSelect}
                      onCellInfo={(minterm) => setCellInfoPinned(minterm)}
                      selectedCells={selectedCells}
                      hoveredCell={hoveredCell}
                      onCellHover={setHoveredCell}
                      showMintermNumbers={showMintermNumbers}
                      showSOP={showSOP}
                      groupOverlays={effectiveOverlays}
                      showAdjacency
                    />
                  ) : (
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
                      groupOverlays={effectiveOverlays}
                      showAdjacency
                    />
                  )
                )}

                {viewMode !== 'truth' && (cellInfoPinned !== null || hoveredCell !== null) && (
                  <CellInfoPopup
                    kmap={kmap}
                    minterm={hoveredCell ?? cellInfoPinned!}
                    showSOP={showSOP}
                    onClose={() => setCellInfoPinned(null)}
                  />
                )}

                {viewMode !== 'kmap' && (
                  <div className="mt-2 sm:mt-3">
                    <TruthTablePanel
                      kmap={kmap}
                      showSOP={showSOP}
                      highlightedCell={hoveredCell ?? cellInfoPinned}
                      onSelectCell={(minterm) => setHoveredCell(minterm)}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Results Panel - Tabbed Interface */}
          <TabbedPanel
              resultsTab={
                <ResultsTabContent
                  showSOP={showSOP}
                  setShowSOP={setShowSOP}
                  simplifiedExpression={simplifiedExpression}
                  originalExpression={originalExpression}
                  sopGroups={simplification.sopGroups.map(g => ({ cells: Array.from(g.cells), productText: g.productText, sumText: g.sumText }))}
                  posGroups={simplification.posGroups.map(g => ({ cells: Array.from(g.cells), productText: g.productText, sumText: g.sumText }))}
                  sopTerms={sopTerms}
                  posTerms={posTerms}
                  kmap={kmap}
                  selectedGroup={selectedGroup}
                  groupValidation={groupValidation ? { valid: groupValidation.valid, issues: groupValidation.issues?.map(i => ({ message: i.message })) } : null}
                  groupedSummary={groupedSummary ? { reasons: groupedSummary.reasons.map(r => ({ text: r.text })) } : null}
                  sopGroupsData={fullSimplification.sopGroups}
                  posGroupsData={fullSimplification.posGroups}
                  pdfExportButton={
                    <PdfExportButton
                      kmap={kmap}
                      simplifiedExpression={simplifiedExpression}
                      originalExpression={originalExpression}
                      showSOP={showSOP}
                      sopTerms={sopTerms}
                      posTerms={posTerms}
                      groupCount={(showSOP ? simplification.sopGroups : simplification.posGroups).length}
                    />
                  }
                    expressionChain={
                      <ExpressionCircuitChain
                        simplifiedExpression={simplifiedExpression}
                        groups={fullSimplification.sopGroups}
                        mode={showSOP ? 'sop' : 'pos'}
                        kmap={kmap}
                      />
                    }
                />
              }
              learningTab={
                <LearningTabContent
                  showSOP={showSOP}
                  walkthroughSolution={walkthroughSolution}
                  onWalkthroughHighlight={handleWalkthroughHighlight}
                />
              }
              examplesTab={
                <ExamplesTabContent
                  onLoadExample={handleLoadExample}
                />
              }
          />
        </div>

        {/* Connect Representations: Define & Analyze — full width below both panels */}
        <div className="mt-2 sm:mt-3">
          <AdvancedPanel />
        </div>
      </div>

      {/* Onboarding System */}
      {showOnboarding && (
        <OnboardingSystem
          onComplete={() => setShowOnboarding(false)}
          onSkip={() => setShowOnboarding(false)}
          autoStart={true}
        />
      )}

      {/* Step-by-Step Interactive Tutorial */}
      {showTutorial && (
        <StepByStepTutorial
          onComplete={() => setShowTutorial(false)}
          onSkip={() => setShowTutorial(false)}
        />
      )}
    </div>
  )
}
