import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GateSimulator } from '../../../simulators/gates'

describe('GateSimulator', () => {
  it('renders with AND selected and a truth table', () => {
    render(<GateSimulator />)
    expect(screen.getByTestId('truth-table')).toBeInTheDocument()
    // AND(0,0) = 0 by default
    expect(screen.getByTestId('output-badge')).toHaveTextContent('0')
  })

  it('toggling both inputs sets the AND output to 1', () => {
    render(<GateSimulator />)
    fireEvent.click(screen.getByTestId('input-toggle-0'))
    fireEvent.click(screen.getByTestId('input-toggle-1'))
    expect(screen.getByTestId('output-badge')).toHaveTextContent('1')
    expect(screen.getByTestId('explanation-what')).toHaveTextContent('1 · 1 = 1')
  })

  it('switches gates and updates the expression', () => {
    render(<GateSimulator />)
    fireEvent.click(screen.getByTestId('gate-btn-or'))
    expect(screen.getByText('OR', { selector: 'button' })).toBeInTheDocument()
    expect(screen.getByTestId('expression')).toHaveTextContent('Y = A + B')
  })

  it('shows an explanation for the current gate', () => {
    render(<GateSimulator />)
    expect(screen.getByTestId('explanation-why')).toHaveTextContent(/0|1/)
    expect(screen.getByText('Laws that hold')).toBeInTheDocument()
  })
})