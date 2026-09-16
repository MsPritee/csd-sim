import { useState, useEffect, lazy, Suspense, useCallback, memo } from 'react'
import { ResponsiveGrid } from './components/ui/ResponsiveGrid'
import { LoadingSpinner } from './components/ui/LoadingSpinner'

const KMapSimulator = lazy(() => import('./simulators/kmap/KMapSimulator'))
const KMapPractice = lazy(() => import('./simulators/kmap/practice/KMapPractice'))
const GateSimulator = lazy(() => import('./simulators/gates/GateSimulator'))
const CircuitDesigner = lazy(() => import('./simulators/circuit/CircuitDesigner'))
const NumberSystemsSimulator = lazy(() => import('./simulators/numbersystems').then(module => ({ default: module.NumberSystemsSimulator })))
const FaqPage = lazy(() => import('./simulators/kmap/components/FaqPage'))

type View = 'home' | 'kmap' | 'practice' | 'gates' | 'circuit' | 'numbersystems' | 'faq'

interface AppProps {
  currentView?: View
  setCurrentView?: React.Dispatch<React.SetStateAction<View>>
}

export default function App({ currentView: externalCurrentView, setCurrentView: externalSetCurrentView }: AppProps) {
  // Use internal state if props are not provided (for testing)
  const [internalCurrentView, internalSetCurrentView] = useState<View>('home')
  const currentView = externalCurrentView ?? internalCurrentView
  const baseSetCurrentView = externalSetCurrentView ?? internalSetCurrentView
  
  // View transition state
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Handle view transitions with animation
  const handleViewChange = useCallback((newView: View) => {
    setIsTransitioning(true)
    baseSetCurrentView(newView)
    
    // Reset transition after animation
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
  }, [baseSetCurrentView])

  // Enhanced setCurrentView with transition support
  const wrappedSetCurrentView = useCallback((newView: View | ((prev: View) => View)) => {
    const actualNewView = typeof newView === 'function' ? newView(currentView) : newView
    if (actualNewView !== currentView) {
      handleViewChange(actualNewView)
    }
  }, [currentView, handleViewChange])

  // Use wrapped version for internal navigation
  const finalSetCurrentView = wrappedSetCurrentView

  // For external navigation, pass the wrapped version to maintain state
  useEffect(() => {
    if (externalSetCurrentView) {
      // External navigation controls the view, but we need to sync our transition state
      setIsTransitioning(false)
    }
  }, [externalSetCurrentView, currentView])

  if (currentView === 'gates') {
    return (
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100'}`}>
        <Suspense fallback={<LoadingSpinner centered />}>
          <GateSimulator onBackToHome={() => finalSetCurrentView('home')} />
        </Suspense>
      </div>
    )
  }

  if (currentView === 'circuit') {
    return (
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100'}`}>
        <Suspense fallback={<LoadingSpinner centered />}>
          <CircuitDesigner onBackToHome={() => finalSetCurrentView('home')} />
        </Suspense>
      </div>
    )
  }

  if (currentView === 'numbersystems') {
    return (
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100'}`}>
        <Suspense fallback={<LoadingSpinner centered />}>
          <NumberSystemsSimulator onBackToHome={() => finalSetCurrentView('home')} key="numbersystems" />
        </Suspense>
      </div>
    )
  }

  if (currentView === 'faq') {
    return (
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100'}`}>
        <Suspense fallback={<LoadingSpinner centered />}>
          <FaqPage onBackToHome={() => finalSetCurrentView('home')} />
        </Suspense>
      </div>
    )
  }

  if (currentView === 'kmap' || currentView === 'practice') {
    if (currentView === 'kmap') {
      return (
        <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100'}`}>
          <Suspense fallback={<LoadingSpinner centered />}>
            <KMapSimulator
              onBackToHome={() => finalSetCurrentView('home')}
              onOpenPractice={() => finalSetCurrentView('practice')}
            />
          </Suspense>
        </div>
      )
    }
    return (
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100'}`}>
        <nav className="px-3 sm:px-4 py-1.5 flex items-center gap-2 sm:gap-4 border-b flex-wrap" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => finalSetCurrentView('home')}
            className="font-medium transition-colors text-sm sm:text-base"
            style={{ color: 'var(--accent-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
          >
            Back to Home
          </button>
          <button
            onClick={() => finalSetCurrentView('kmap')}
            className="font-medium text-xs sm:text-sm transition-colors"
            style={{ color: 'var(--accent-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
          >
            ← K-map simulator
          </button>
        </nav>
        <div className="flex-1" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
          <Suspense fallback={<LoadingSpinner centered />}>
            <KMapPractice />
          </Suspense>
        </div>
      </div>
    )
  }

  return (
    <main className="flex-1" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className={`mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 transition-all duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>

        <div>
          <h2 className="text-xl font-semibold mb-2 sm:mb-3" style={{ color: 'var(--accent-primary)' }}>Simulators</h2>
          <ResponsiveGrid cols={{ xs: 1, sm: 2, lg: 3 }} gap="3">
            <SimulatorCard
              title="Karnaugh Map Simulator"
              description="Interactive K-map learning tool with simplification, grouping validation, and educational content."
              status="Ready"
              onClick={() => finalSetCurrentView('kmap')}
            />
            <SimulatorCard
              title="Logic Gates"
              description="Interactive logic gate simulator with togglable inputs, truth tables, and step-by-step explanations."
              status="Ready"
              onClick={() => finalSetCurrentView('gates')}
            />
            <SimulatorCard
              title="Circuit Designer"
              description="Logisim-style visual canvas: drag gates and pins, draw wires, toggle inputs, and simulate combinational circuits live."
              status="Ready"
              onClick={() => finalSetCurrentView('circuit')}
            />
            <SimulatorCard
              title="Number Systems"
              description="Interactive number systems converter supporting decimal, binary, hexadecimal, and octal with educational content and advanced visualizations."
              status="Ready"
              onClick={() => finalSetCurrentView('numbersystems')}
            />
            <SimulatorCard
              title="FAQ & Help"
              description="Frequently asked questions and helpful guides for using all DigiWorld simulators."
              status="Ready"
              onClick={() => finalSetCurrentView('faq')}
            />
            <SimulatorCard
              title="Combinational Circuits"
              description="Coming soon - Adders, multiplexers, and more"
              status="Coming Soon"
              disabled
            />
            <SimulatorCard
              title="Sequential Circuits"
              description="Coming soon - Flip-flops, counters, and FSM"
              status="Coming Soon"
              disabled
            />
          </ResponsiveGrid>
        </div>
      </div>
    </main>
  )
}

const SimulatorCard = memo(function SimulatorCard({
  title,
  description,
  status,
  onClick,
  disabled,
}: {
  title: string
  description: string
  status: string
  onClick?: () => void
  disabled?: boolean
}) {
  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.borderColor = 'var(--accent-primary)';
      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
    }
  }, [disabled])

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.borderColor = 'var(--border-color)';
      e.currentTarget.style.backgroundColor = 'var(--bg-card)';
    }
  }, [disabled])

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-left rounded-lg border p-2 sm:p-2.5 lg:p-3 transition-colors ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      style={{
        backgroundColor: disabled ? 'var(--bg-tertiary)' : 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        minHeight: '100px'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-sm sm:text-base" style={{ color: 'var(--accent-primary)' }}>{title}</h3>
        <span
          className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded shrink-0 ${status === 'Ready' ? '' : ''}`}
          style={{
            backgroundColor: status === 'Ready' ? 'var(--success-bg)' : 'var(--bg-tertiary)',
            color: status === 'Ready' ? 'var(--success-text)' : 'var(--text-muted)'
          }}
        >
          {status}
        </span>
      </div>
      <p className="mt-1.5 text-[11px] sm:text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>{description}</p>
    </button>
  )
})