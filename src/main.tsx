import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './ErrorBoundary.tsx'
import { reportError } from './errorReporter'
import BrandHeader from './components/BrandHeader'
import BrandFooter from './components/BrandFooter'
import { ThemeProvider } from './contexts/ThemeContext'
import { MobileBottomNav } from './components/ui/MobileBottomNav'

type View = 'home' | 'kmap' | 'practice' | 'gates' | 'circuit' | 'numbersystems' | 'faq'

window.addEventListener('error', (event) => {
  reportError('window', event.error ?? new Error(event.message ?? 'Unhandled window error'))
})
window.addEventListener('unhandledrejection', (event) => {
  reportError(
    'unhandled-rejection',
    event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
  )
})

// Icon components for bottom navigation
function HomeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function KMapIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M3 15h18" />
      <path d="M9 3v18" />
      <path d="M15 3v18" />
    </svg>
  )
}

function GatesIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12h8" />
      <path d="M12 12h8" />
      <path d="M20 7v10" />
      <path d="M12 7v10" />
      <path d="M4 7v10" />
    </svg>
  )
}

function CircuitIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <path d="M6 12h4" />
      <path d="M14 12h4" />
      <path d="M10 8v8" />
      <circle cx="10" cy="12" r="2" />
    </svg>
  )
}

function NumberSystemsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12h8" />
      <path d="M12 12h8" />
      <path d="M12 8v8" />
      <circle cx="8" cy="12" r="2" />
      <circle cx="16" cy="12" r="2" />
    </svg>
  )
}

function MainApp() {
  const [currentView, setCurrentView] = useState<View>('home')

  const bottomNavItems = [
    {
      id: 'home',
      label: 'Home',
      icon: <HomeIcon />,
      onClick: () => setCurrentView('home'),
      active: currentView === 'home',
    },
    {
      id: 'kmap',
      label: 'K-Map',
      icon: <KMapIcon />,
      onClick: () => setCurrentView('kmap'),
      active: currentView === 'kmap',
    },
    {
      id: 'gates',
      label: 'Gates',
      icon: <GatesIcon />,
      onClick: () => setCurrentView('gates'),
      active: currentView === 'gates',
    },
    {
      id: 'circuit',
      label: 'Circuit',
      icon: <CircuitIcon />,
      onClick: () => setCurrentView('circuit'),
      active: currentView === 'circuit',
    },
    {
      id: 'numbersystems',
      label: 'Numbers',
      icon: <NumberSystemsIcon />,
      onClick: () => setCurrentView('numbersystems'),
      active: currentView === 'numbersystems',
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      onClick: () => setCurrentView('faq'),
      active: currentView === 'faq',
    },
  ]

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <BrandHeader currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex-1 pb-16 md:pb-0 overflow-auto">
        <App currentView={currentView} setCurrentView={setCurrentView} />
      </div>
      <BrandFooter className="md:block" />
      <MobileBottomNav items={bottomNavItems} breakpoint="md" />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ErrorBoundary>
        <MainApp />
      </ErrorBoundary>
    </ThemeProvider>
  </StrictMode>,
)
