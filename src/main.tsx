import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './ErrorBoundary.tsx'
import { reportError } from './errorReporter'

window.addEventListener('error', (event) => {
  reportError('window', event.error ?? new Error(event.message ?? 'Unhandled window error'))
})
window.addEventListener('unhandledrejection', (event) => {
  reportError(
    'unhandled-rejection',
    event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
  )
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
