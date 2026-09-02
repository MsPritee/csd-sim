import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './ErrorBoundary.tsx'
import { reportError } from './errorReporter'
import BrandHeader from './components/BrandHeader'
import BrandFooter from './components/BrandFooter'
import { ThemeProvider } from './contexts/ThemeContext'

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

function MainApp() {
  const [currentView, setCurrentView] = useState<View>('home')

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <BrandHeader currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex-1 overflow-auto">
        <App currentView={currentView} setCurrentView={setCurrentView} />
      </div>
      <BrandFooter />
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
