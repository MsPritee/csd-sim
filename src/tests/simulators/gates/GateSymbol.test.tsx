import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GateSymbol } from '../../../simulators/gates'

describe('GateSymbol', () => {
  const renderSymbol = (gate: 'AND' | 'NOT' | 'XOR') =>
    render(<GateSymbol gate={gate} inputs={gate === 'NOT' ? [0] : [0, 1]} output={1} />)

  it('renders an svg symbol labelled by the gate', () => {
    renderSymbol('AND')
    expect(screen.getByRole('img', { name: 'AND gate symbol' })).toBeInTheDocument()
  })

  it('renders the output pin', () => {
    renderSymbol('NOT')
    expect(screen.getByTestId('output-pin')).toBeInTheDocument()
  })

  it('renders distinct test hooks per gate', () => {
    renderSymbol('XOR')
    expect(screen.getByTestId('gate-symbol-xor')).toBeInTheDocument()
  })
})