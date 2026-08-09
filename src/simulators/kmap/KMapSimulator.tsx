import { useState } from 'react'
import { createKMap, withValue, simplify, minterms, maxterms, dontCares, type KMapModel, type CellValue } from '../../core/kmap'
import { validateGroup } from '../../core/kmap/grouping'
import { mintermToString } from '../../core/boolean'
import KMapGrid from './components/KMapGrid'
import ExpandableSection from './components/ExpandableSection'
import ExampleLibrary from './components/ExampleLibrary'
import { type KMapExample } from './examples'

export default function KMapSimulator() {
  const [variableCount, setVariableCount] = useState<2 | 3 | 4>(3)
  const [kmap, setKmap] = useState<KMapModel>(() => createKMap(['A', 'B', 'C']))
  const [selectedCells, setSelectedCells] = useState<Set<number>>(new Set())
  const [currentValue, setCurrentValue] = useState<CellValue>(1)
  const [showSOP, setShowSOP] = useState(true)
  const [showExplanation, setShowExplanation] = useState(false)
  const [hoveredCell, setHoveredCell] = useState<number | null>(null)
  const [showMintermNumbers, setShowMintermNumbers] = useState(false)

  const variables = ['A', 'B', 'C', 'D'].slice(0, variableCount)

  const handleVariableCountChange = (count: 2 | 3 | 4) => {
    setVariableCount(count)
    const newVars = ['A', 'B', 'C', 'D'].slice(0, count)
    setKmap(createKMap(newVars))
    setSelectedCells(new Set())
  }

  const handleCellClick = (minterm: number) => {
    const newValue = currentValue
    setKmap(withValue(kmap, minterm, newValue))
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
    setKmap(createKMap(variables))
    setSelectedCells(new Set())
  }

  const loadExample = (example: KMapExample) => {
    setVariableCount(example.variables.length as 2 | 3 | 4)
    let newKmap = createKMap(example.variables)
    example.values.forEach((value: CellValue, minterm: number) => {
      if (value !== null) {
        newKmap = withValue(newKmap, minterm, value)
      }
    })
    setKmap(newKmap)
    setSelectedCells(new Set())
  }

  const ones = new Set(minterms(kmap))
  const zeros = new Set(maxterms(kmap))
  const dontCareSet = new Set(dontCares(kmap))

  const simplification = simplify(kmap, ones, zeros, dontCareSet)

  const selectedGroup = Array.from(selectedCells).sort((a, b) => a - b)
  const groupValidation = selectedGroup.length > 0 ? validateGroup(kmap, selectedGroup) : null

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-violet-400">Karnaugh Map Simulator</h1>
          <p className="text-slate-400 mt-2">Interactive learning tool for Boolean function simplification</p>
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
            <h2 className="text-xl font-semibold mb-4 text-violet-300">K-Map Grid</h2>
            <p className="text-sm text-slate-400 mb-4">Click cells to set values. Ctrl+click to select groups for validation. Hover over cells for detailed information.</p>
            
            <KMapGrid
              kmap={kmap}
              onCellClick={handleCellClick}
              onCellSelect={handleCellSelect}
              selectedCells={selectedCells}
              hoveredCell={hoveredCell}
              onCellHover={setHoveredCell}
              showMintermNumbers={showMintermNumbers}
            />

            {/* Cell Information Popup */}
            {hoveredCell !== null && (
              <CellInfoPopup
                kmap={kmap}
                minterm={hoveredCell}
                onClose={() => setHoveredCell(null)}
              />
            )}
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Simplified Expression */}
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-violet-300">Simplified Expression</h2>
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
              </div>

              <div className="bg-slate-800 rounded p-4 font-mono text-lg">
                {showSOP ? simplification.sop : simplification.pos}
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
            </div>

            {/* Group Validation */}
            {groupValidation && (
              <div className={`bg-slate-900 rounded-lg p-6 border ${
                groupValidation.valid ? 'border-green-600' : 'border-red-600'
              }`}>
                <h2 className="text-xl font-semibold mb-4 text-violet-300">Group Validation</h2>
                {groupValidation.valid ? (
                  <div className="text-green-400">
                    <p className="font-semibold">Valid Group</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Selected cells form a valid K-map group.
                    </p>
                  </div>
                ) : (
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
            )}

            {/* Educational Content */}
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-violet-300">Learning Guide</h2>
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="text-sm text-violet-400 hover:text-violet-300"
                >
                  {showExplanation ? 'Hide' : 'Show'}
                </button>
              </div>

              {showExplanation && (
                <div className="space-y-4 text-sm text-slate-300">
                  <ExpandableSection
                    title="What are Minterms and Maxterms?"
                    defaultExpanded={true}
                  >
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

                  <ExpandableSection title="Why SOP uses AND-OR structure">
                    <div className="space-y-2 text-slate-400">
                      <p>
                        <strong className="text-white">Sum of Products (SOP)</strong> combines minterms using OR (+).
                      </p>
                      <p>
                        Each minterm is a product (AND) of literals. When ANY minterm is true, the output is true.
                      </p>
                      <p className="text-xs">
                        In K-maps: Group 1s → each group becomes a product term → OR all terms together.
                      </p>
                    </div>
                  </ExpandableSection>

                  <ExpandableSection title="Why POS uses OR-AND structure">
                    <div className="space-y-2 text-slate-400">
                      <p>
                        <strong className="text-white">Product of Sums (POS)</strong> combines maxterms using AND (·).
                      </p>
                      <p>
                        Each maxterm is a sum (OR) of literals. When ALL maxterms are satisfied, the output is true.
                      </p>
                      <p className="text-xs">
                        In K-maps: Group 0s → each group becomes a sum term → AND all terms together.
                      </p>
                    </div>
                  </ExpandableSection>

                  <ExpandableSection title="Variable Complementation Rules">
                    <div className="space-y-2 text-slate-400">
                      <p>
                        Why does 0 become A' in SOP but A in POS?
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong className="text-violet-300">SOP:</strong> 0 means variable is FALSE, so we write A' (NOT A) to make the term true when A=0</li>
                        <li><strong className="text-violet-300">POS:</strong> 0 means variable is FALSE, so we write A (we want the sum to be 0 when A=0)</li>
                      </ul>
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
                    </div>
                  </ExpandableSection>
                </div>
              )}
            </div>

            {/* Example Library */}
            <ExampleLibrary onLoadExample={loadExample} />
          </div>
        </div>
      </div>
    </div>
  )
}

function CellInfoPopup({ kmap, minterm, onClose }: { kmap: KMapModel; minterm: number; onClose: () => void }) {
  const variables = kmap.layout.variables
  const cell = kmap.cells.flat().find(c => c.minterm === minterm)
  if (!cell) return null

  const binaryString = minterm.toString(2).padStart(variables.length, '0')
  const productTerm = mintermToString(variables, minterm)
  const isMinterm = cell.value === 1
  const isMaxterm = cell.value === 0

  // Calculate variable states
  const variableStates = variables.map((variable, index) => {
    const bit = (minterm >> (variables.length - 1 - index)) & 1
    const isComplemented = bit === 0
    return {
      variable,
      bit,
      isComplemented,
      literal: isComplemented ? `${variable}'` : variable
    }
  })

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
        
        {/* Variable State Visualization */}
        <div className="border-t border-slate-700 pt-3">
          <h4 className="text-violet-300 font-semibold mb-2">Variable States</h4>
          <div className="space-y-1">
            {variableStates.map(({ variable, bit, isComplemented: _isComplemented, literal }) => (
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
