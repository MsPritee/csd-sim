import { Component, type ErrorInfo, type ReactNode } from 'react'
import { reportError } from './errorReporter'

/**
 * Global error boundary. Any uncaught render/lifecycle error is caught here,
 * logged, and swapped for a recoverable fallback instead of blanking the app.
 */
interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
  info: ErrorInfo | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, info: null }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.setState({ info })
    reportError('react-boundary', error, info)
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <main className="grid min-h-screen place-items-center bg-slate-950 text-slate-100">
          <div className="mx-auto max-w-md rounded-lg border border-slate-700 bg-slate-900 p-8 text-center">
            <p className="font-mono text-sm uppercase tracking-widest text-red-400">
              Something went wrong
            </p>
            <h1 className="mt-3 text-2xl font-bold">The app hit an unexpected error.</h1>
            <p className="mt-3 text-sm text-slate-400">
              {this.state.error.message || 'An unknown error occurred.'}
            </p>
            <button
              onClick={this.handleReload}
              className="mt-6 rounded bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-500"
            >
              Reload the app
            </button>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}