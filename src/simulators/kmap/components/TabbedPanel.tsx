import { useState, useRef } from 'react'

type TabType = 'results' | 'learning' | 'examples'

interface TabbedPanelProps {
  resultsTab: React.ReactNode
  learningTab: React.ReactNode
  examplesTab: React.ReactNode
}

export default function TabbedPanel({ resultsTab, learningTab, examplesTab }: TabbedPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('results')
  const tabRefs = useRef<Record<TabType, HTMLButtonElement | null>>({ results: null, learning: null, examples: null })

  const tabs: { id: TabType; label: string; icon: string; description: string }[] = [
    { id: 'results', label: 'Results', icon: '📊', description: 'View simplified expression, verification, and group validation' },
    { id: 'learning', label: 'Learning', icon: '📚', description: 'Access solution walkthroughs, learning guides, and concept explanations' },
    { id: 'examples', label: 'Examples', icon: '💡', description: 'Load pre-built examples to practice different scenarios' },
  ]

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId)
    tabRefs.current[tabId]?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent, tabId: TabType) => {
    const tabOrder: TabType[] = ['results', 'learning', 'examples']
    const currentIndex = tabOrder.indexOf(tabId)

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabOrder.length - 1
        handleTabChange(tabOrder[prevIndex])
        break
      case 'ArrowRight':
        e.preventDefault()
        const nextIndex = currentIndex < tabOrder.length - 1 ? currentIndex + 1 : 0
        handleTabChange(tabOrder[nextIndex])
        break
      case 'Home':
        e.preventDefault()
        handleTabChange(tabOrder[0])
        break
      case 'End':
        e.preventDefault()
        handleTabChange(tabOrder[tabOrder.length - 1])
        break
    }
  }

  return (
    <div
      className="tabbed-panel rounded-lg border elevation-tertiary"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      role="tablist"
      aria-label="K-Map information panels"
    >
      {/* Tab Navigation */}
      <div className="flex items-center gap-control-group p-1 sm:p-1.5 border-b" style={{ borderColor: 'var(--border-color)' }} role="none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[tab.id] = el }}
            onClick={() => handleTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            aria-label={`${tab.label} tab - ${tab.description}`}
            className="flex items-center gap-control-group px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all touch-action-manipulation min-h-[44px]"
            style={{
              backgroundColor: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeTab === tab.id ? 'var(--shadow-accent)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <span className="text-base" aria-hidden>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden text-xs">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-2 sm:p-3 min-h-[200px]">
        <div
          className="transition-all duration-300 ease-in-out"
          style={{
            opacity: 1,
            transform: 'translateY(0)',
          }}
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeTab === 'results' && resultsTab}
          {activeTab === 'learning' && learningTab}
          {activeTab === 'examples' && examplesTab}
        </div>
      </div>
    </div>
  )
}
