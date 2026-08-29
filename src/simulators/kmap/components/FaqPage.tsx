import { useState, useCallback } from 'react'

interface AccordionItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  category?: string
}

function AccordionItem({ question, answer, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div
      className="rounded-lg border overflow-hidden transition-all"
      style={{
        borderColor: isOpen ? 'var(--accent-primary)' : 'var(--border-color)',
        backgroundColor: 'var(--bg-card)',
      }}
    >
      <button
        onClick={onToggle}
        className="w-full text-left px-3 py-2.5 flex items-center justify-between gap-2 transition-colors"
        style={{ backgroundColor: isOpen ? 'var(--accent-bg)' : 'transparent' }}
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium" style={{ color: isOpen ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
          {question}
        </span>
        <span
          className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-xs transition-transform"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          ▾
        </span>
      </button>
      {isOpen && (
        <div className="px-3 pb-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <p className="text-xs leading-relaxed mt-2" style={{ color: 'var(--text-secondary)' }}>
            {answer}
          </p>
        </div>
      )}
    </div>
  )
}

interface FaqCategory {
  name: string
  icon: string
  items: { question: string; answer: string }[]
}

const FAQ_DATA: readonly FaqCategory[] = [
  {
    name: 'K-Map Basics',
    icon: '🗺️',
    items: [
      {
        question: 'What is a Karnaugh Map (K-Map)?',
        answer: 'A Karnaugh Map is a visual method for simplifying Boolean algebra expressions. It organizes truth table values in a grid where adjacent cells differ by only one variable, making it easy to identify groups of 1s (for SOP) or 0s (for POS) that can be combined to eliminate variables.',
      },
      {
        question: 'What is the difference between SOP and POS?',
        answer: 'SOP (Sum of Products) groups 1-cells to create product terms (AND) that are summed (OR). POS (Product of Sums) groups 0-cells to create sum terms (OR) that are multiplied (AND). Both produce equivalent logic, but one may be simpler depending on the function.',
      },
      {
        question: 'How do I set cell values?',
        answer: 'Click any cell in the K-Map grid to cycle through values: empty → 1 → 0 → X (don\'t-care) → empty. You can also use the toolbar to select a value first, then click cells to paint them with that value.',
      },
      {
        question: 'What do the Gray code labels mean?',
        answer: 'The row and column labels use Gray code ordering, where adjacent labels differ by exactly one bit. This ensures that physically adjacent cells in the grid differ by only one variable, which is essential for identifying groups that can be simplified.',
      },
      {
        question: 'How many variables can the K-Map handle?',
        answer: 'The simulator supports 2, 3, 4, and 5 variables. For 5 variables, it displays a dual 4×4 grid (E=0 plane and E=1 plane side by side) with cross-plane adjacency lines showing which cells correspond across planes.',
      },
    ],
  },
  {
    name: 'Grouping & Simplification',
    icon: '📦',
    items: [
      {
        question: 'What are the rules for valid groups?',
        answer: 'Groups must contain a power-of-2 number of cells (1, 2, 4, 8, 16...), must be rectangular (including wrap-around), and must only contain cells with value 1 (for SOP) or 0 (for POS). Don\'t-care cells (X) can optionally be included to form larger groups.',
      },
      {
        question: 'What are don\'t-care cells (X)?',
        answer: 'Don\'t-care cells represent input combinations that either never occur or whose output doesn\'t matter. During simplification, the optimizer can treat each X as either 0 or 1 — whichever produces a simpler expression. They\'re like wildcards that help create larger groups.',
      },
      {
        question: 'How does the simplification algorithm work?',
        answer: 'The algorithm: (1) enumerate all valid groups from the cells, (2) find prime implicants (groups not contained in any larger group), (3) identify essential prime implicants (groups needed to cover specific cells), (4) use a minimum cover algorithm to select the fewest groups that cover all required cells.',
      },
      {
        question: 'What is a wrap-around group?',
        answer: 'Groups can "wrap around" the edges of the K-Map. For example, the leftmost column is adjacent to the rightmost column, and the top row is adjacent to the bottom row. This is a key feature that makes K-Maps more powerful than manual Boolean algebra.',
      },
      {
        question: 'How do I validate my own group selection?',
        answer: 'Ctrl+click (or Cmd+click on Mac) to select multiple cells. The Group Validation section will show whether your selection forms a valid group and explain why or why not.',
      },
    ],
  },
  {
    name: 'Circuit & Truth Table',
    icon: '⚡',
    items: [
      {
        question: 'What is the Logic Circuit Diagram?',
        answer: 'The Logic Circuit Diagram is an auto-generated SVG visualization showing how the simplified expression maps to physical logic gates. Each AND gate (for SOP) represents one group, the OR gate combines all terms, and NOT indicators show negated variables.',
      },
      {
        question: 'How does the Truth Table relate to the K-Map?',
        answer: 'The Truth Table shows every possible input combination and its output. Each row corresponds to exactly one K-Map cell. You can click rows to highlight the corresponding K-Map cell, and hover K-Map cells to highlight truth table rows. The Split View mode shows both side-by-side.',
      },
      {
        question: 'What does "Verify" check?',
        answer: 'The Verify panel compares the truth table generated by the simplified expression against the original K-Map truth table. If they match on every row, the simplification is equivalent. Any differences indicate an error in the grouping or simplification.',
      },
    ],
  },
  {
    name: 'Using the Simulator',
    icon: '🔧',
    items: [
      {
        question: 'How do I load an example?',
        answer: 'Click the Examples tab in the right panel to browse pre-built K-Map problems. Each example loads a specific function with pre-filled cells, letting you study the simplification without starting from scratch.',
      },
      {
        question: 'What is the Practice mode?',
        answer: 'Practice mode lets you work through K-Map problems with guided assistance. You can choose guided mode (with hints), independent mode (self-paced), or challenge mode (timed with no hints). Progress and mastery are tracked across sessions.',
      },
      {
        question: 'How do I export my work?',
        answer: 'Click the "Export PDF" button in the Results tab to download a PDF report containing the K-Map grid, simplified expression, group analysis, and truth table. This is useful for homework submissions or study notes.',
      },
      {
        question: 'Can I navigate between expression, circuit, and truth table?',
        answer: 'Yes! The Expression-Circuit-Truth Table Chain in the Results tab shows all three representations. Click any element (expression, group, or truth table row) to highlight its connections across all representations. This helps you understand how changes in one view affect the others.',
      },
      {
        question: 'What is the Split View mode?',
        answer: 'Split View shows the K-Map and Truth Table side-by-side in resizable panels. You can drag the divider to resize, and hovering over a cell in either view highlights the corresponding element in the other view.',
      },
    ],
  },
]

export default function FaqPage({ onBackToHome }: { onBackToHome?: () => void }) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const [activeCategory, setActiveCategory] = useState<number | null>(null)

  const toggleItem = useCallback((key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  const expandAll = useCallback(() => {
    const all = new Set<string>()
    FAQ_DATA.forEach((cat, ci) => {
      cat.items.forEach((_, ii) => {
        all.add(`${ci}-${ii}`)
      })
    })
    setOpenItems(all)
  }, [])

  const collapseAll = useCallback(() => {
    setOpenItems(new Set())
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <button
              onClick={onBackToHome}
              className="text-sm font-medium transition-colors mb-1"
              style={{ color: 'var(--accent-primary)' }}
            >
              ← Back to Home
            </button>
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
              Frequently Asked Questions
            </h1>
            <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Everything you need to know about using DigiWorld
            </p>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={expandAll}
              className="text-xs px-2 py-1 rounded transition-colors"
              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="text-xs px-2 py-1 rounded transition-colors"
              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory(null)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0"
            style={{
              backgroundColor: activeCategory === null ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: activeCategory === null ? '#fff' : 'var(--text-secondary)',
            }}
          >
            All
          </button>
          {FAQ_DATA.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveCategory(activeCategory === i ? null : i)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1"
              style={{
                backgroundColor: activeCategory === i ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: activeCategory === i ? '#fff' : 'var(--text-secondary)',
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {(activeCategory !== null ? [FAQ_DATA[activeCategory]!] : FAQ_DATA).map((cat, catIdx) => {
            const actualIdx = activeCategory !== null ? activeCategory : catIdx
            return (
              <div key={actualIdx}>
                <h2 className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                    {cat.items.length}
                  </span>
                </h2>
                <div className="space-y-1.5">
                  {cat.items.map((item, itemIdx) => {
                    const key = `${actualIdx}-${itemIdx}`
                    return (
                      <AccordionItem
                        key={key}
                        question={item.question}
                        answer={item.answer}
                        isOpen={openItems.has(key)}
                        onToggle={() => toggleItem(key)}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Still have questions? Contact us at{' '}
            <span style={{ color: 'var(--accent-primary)' }}>chalkandduster.com</span>
          </p>
        </div>
      </div>
    </div>
  )
}
