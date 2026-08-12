import ExpandableSection from './ExpandableSection'

interface LearningGuideProps {
  open: boolean
  onToggle: () => void
}

export default function LearningGuide({ open, onToggle }: LearningGuideProps) {
  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700">
      <div className="flex items-center justify-between gap-3 p-4">
        <h2 className="text-lg font-semibold text-violet-300">Learning Guide</h2>
        <button
          onClick={onToggle}
          aria-expanded={open}
          aria-label="Toggle Learning Guide"
          className="flex items-center justify-center h-8 w-8 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xl leading-none"
        >
          {open ? '−' : '+'}
        </button>
      </div>

      {open && (
        <div className="space-y-4 text-sm text-slate-300 px-4 pb-4">
          <ExpandableSection title="What are Minterms and Maxterms?" defaultExpanded>
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
  )
}