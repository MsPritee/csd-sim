import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders the product name', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Digital Logic Concept Lab',
    )
  })

  it('renders the three architecture layers', () => {
    render(<App />)
    expect(screen.getByText('Logic Engine')).toBeInTheDocument()
    expect(screen.getByText('Educational Engine')).toBeInTheDocument()
    expect(screen.getByText('Presentation')).toBeInTheDocument()
  })

  it('renders the available simulators section', () => {
    render(<App />)
    expect(screen.getByText('Available Simulators')).toBeInTheDocument()
    expect(screen.getByText('Karnaugh Map Simulator')).toBeInTheDocument()
  })

  it('shows the K-map simulator as ready', () => {
    render(<App />)
    expect(screen.getByText('Ready')).toBeInTheDocument()
  })
})