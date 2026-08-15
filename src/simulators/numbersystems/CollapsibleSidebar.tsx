/**
 * CollapsibleSidebar - Accordion-style sidebar with educational content
 * Consolidates multiple panels into space-saving collapsible structure
 */

import { useState } from 'react'
import { Card } from '../../components/ui/Card'

interface CollapsibleSidebarProps {
  readonly binaryValue: string
  readonly finalResult: number
}

type PanelState = 'learning-guide' | 'quick-help' | 'why-powers' | null

export function CollapsibleSidebar({ binaryValue, finalResult }: CollapsibleSidebarProps) {
  const [expandedPanel, setExpandedPanel] = useState<PanelState>('learning-guide')

  const togglePanel = (panel: PanelState) => {
    setExpandedPanel(expandedPanel === panel ? null : panel)
  }

  const isExpanded = (panel: PanelState) => expandedPanel === panel

  return (
    <div className="space-y-3">
      {/* Learning Guide Panel */}
      <Card>
        <button
          onClick={() => togglePanel('learning-guide')}
          className="w-full flex items-center justify-between p-3 text-left transition-colors-smooth hover:bg-opacity-80"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
          aria-expanded={isExpanded('learning-guide')}
        >
          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
            📚 Learning Guide
          </span>
          <span className="text-lg transition-transform-smooth" style={{ 
            transform: isExpanded('learning-guide') ? 'rotate(180deg)' : 'rotate(0deg)',
            color: 'var(--text-secondary)'
          }}>
            ▼
          </span>
        </button>
        <div 
          className={`accordion-content ${isExpanded('learning-guide') ? 'expanded' : 'collapsed'}`}
        >
          <div className="p-3 space-y-3">
            {/* How it works */}
            <div className="space-y-2">
              <div className="text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>
                How it works?
              </div>
              <div className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-start gap-2">
                  <span className="text-base">💡</span>
                  <span><strong>Step 1:</strong> Identify each binary digit</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-base">📊</span>
                  <span><strong>Step 2:</strong> Assign powers of 2 to each position</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-base">🔢</span>
                  <span><strong>Step 3:</strong> Calculate decimal weights</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-base">✖️</span>
                  <span><strong>Step 4:</strong> Multiply bits by their weights</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-base">➕</span>
                  <span><strong>Step 5:</strong> Add all contributions</span>
                </div>
              </div>
            </div>

            {/* Quick Summary */}
            <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <div className="text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>
                Quick Summary
              </div>
              <div className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex gap-2">
                  <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>1.</span>
                  <span>Binary digits are 0s and 1s</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>2.</span>
                  <span>Each position has a power of 2</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>3.</span>
                  <span>Multiply bit by its weight</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>4.</span>
                  <span>Add all contributions</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>5.</span>
                  <span>Result is decimal value</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Help Panel */}
      <Card>
        <button
          onClick={() => togglePanel('quick-help')}
          className="w-full flex items-center justify-between p-3 text-left transition-colors-smooth hover:bg-opacity-80"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
          aria-expanded={isExpanded('quick-help')}
        >
          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
            ⚡ Quick Help
          </span>
          <span className="text-lg transition-transform-smooth" style={{ 
            transform: isExpanded('quick-help') ? 'rotate(180deg)' : 'rotate(0deg)',
            color: 'var(--text-secondary)'
          }}>
            ▼
          </span>
        </button>
        <div 
          className={`accordion-content ${isExpanded('quick-help') ? 'expanded' : 'collapsed'}`}
        >
          <div className="p-3 space-y-3">
            {/* Tips */}
            <div className="space-y-2">
              <div className="text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>
                Tips
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-2 rounded transition-colors-smooth" style={{ backgroundColor: 'var(--success-bg)' }}>
                  <span className="text-green-600">✓</span>
                  <div className="text-sm" style={{ color: 'var(--success-text)' }}>
                    Positions with <strong>1</strong> contribute their weight
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 rounded transition-colors-smooth" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <span className="text-red-600">✗</span>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Positions with <strong>0</strong> contribute nothing
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 rounded transition-colors-smooth" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <span className="text-blue-600">ℹ️</span>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Read from right to left (LSB to MSB)
                  </div>
                </div>
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <div className="text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>
                Keyboard Shortcuts
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Space</kbd>
                  <span style={{ color: 'var(--text-secondary)' }}>Next</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>→</kbd>
                  <span style={{ color: 'var(--text-secondary)' }}>Next</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>←</kbd>
                  <span style={{ color: 'var(--text-secondary)' }}>Prev</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Enter</kbd>
                  <span style={{ color: 'var(--text-secondary)' }}>Play</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Esc</kbd>
                  <span style={{ color: 'var(--text-secondary)' }}>Reset</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Why Powers of 2 Panel */}
      <Card>
        <button
          onClick={() => togglePanel('why-powers')}
          className="w-full flex items-center justify-between p-3 text-left transition-colors-smooth hover:bg-opacity-80"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
          aria-expanded={isExpanded('why-powers')}
        >
          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
            🤔 Why Powers of 2?
          </span>
          <span className="text-lg transition-transform-smooth" style={{ 
            transform: isExpanded('why-powers') ? 'rotate(180deg)' : 'rotate(0deg)',
            color: 'var(--text-secondary)'
          }}>
            ▼
          </span>
        </button>
        <div 
          className={`accordion-content ${isExpanded('why-powers') ? 'expanded' : 'collapsed'}`}
        >
          <div className="p-3 space-y-3">
            <div className="p-3 rounded-lg transition-colors-smooth" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                <strong>Binary has only two digits: 0 and 1.</strong>
              </p>
              <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--text-secondary)' }}>
                Each position represents a power of 2. From right to left: 1, 2, 4, 8, 16, 32, 64, 128...
              </p>
            </div>
            <div className="p-3 rounded-lg transition-colors-smooth" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Example: {binaryValue}₂
              </div>
              <div className="text-sm font-mono" style={{ color: 'var(--accent-primary)' }}>
                {binaryValue.split('').map((bit, i) => {
                  const position = binaryValue.length - 1 - i
                  const weight = Math.pow(2, position)
                  return bit === '1' ? weight : 0
                }).filter(v => v > 0).join(' + ')} = {finalResult}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
