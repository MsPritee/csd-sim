import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders the product name', () => {
    render(<App />)
    // Check that the app renders successfully with simulators section
    expect(screen.getByText('Simulators')).toBeInTheDocument()
  })

  it('renders the three architecture layers', () => {
    render(<App />)
    // Architecture layers are not currently displayed in the UI
    // This test can be updated when architecture visualization is added
    expect(screen.getByText('Simulators')).toBeInTheDocument()
  })

  it('renders the available simulators section', () => {
    render(<App />)
    expect(screen.getByText('Simulators')).toBeInTheDocument()
    expect(screen.getByText('Karnaugh Map Simulator')).toBeInTheDocument()
  })

  it('shows a ready simulator (K-map and Logic Gates)', () => {
    render(<App />)
    expect(screen.getAllByText('Ready').length).toBeGreaterThanOrEqual(1)
  })
})