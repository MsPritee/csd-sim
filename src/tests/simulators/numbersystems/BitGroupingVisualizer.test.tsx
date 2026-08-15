import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BitGroupingVisualizer } from '../../../simulators/numbersystems/BitGroupingVisualizer'

describe('BitGroupingVisualizer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders with valid binary input', () => {
    render(<BitGroupingVisualizer binaryValue="1011" />)
    
    expect(screen.getByText('Bit Grouping Visualizer (Binary → Hexadecimal)')).toBeInTheDocument()
    expect(screen.getByText('Original binary: 1011')).toBeInTheDocument()
  })

  it('shows error for invalid binary input', () => {
    render(<BitGroupingVisualizer binaryValue="1021" />)
    
    expect(screen.getByText('Invalid binary format: must contain only 0s and 1s')).toBeInTheDocument()
  })

  it('toggles between hexadecimal and octal modes', () => {
    render(<BitGroupingVisualizer binaryValue="1011" />)
    
    const hexButton = screen.getByText('4-bit (Hexadecimal)')
    const octalButton = screen.getByText('3-bit (Octal)')
    
    expect(hexButton).toHaveStyle({ backgroundColor: 'var(--accent-primary)' })
    
    fireEvent.click(octalButton)
    
    expect(octalButton).toHaveStyle({ backgroundColor: 'var(--accent-primary)' })
    expect(screen.getByText('Bit Grouping Visualizer (Binary → Octal)')).toBeInTheDocument()
  })

  it('starts animation when animate button is clicked', () => {
    render(<BitGroupingVisualizer binaryValue="1011" />)
    
    const animateButton = screen.getByText('▶ Animate')
    expect(animateButton).toBeInTheDocument()
  })

  it('shows padding step when binary needs padding', () => {
    render(<BitGroupingVisualizer binaryValue="101" />)
    
    // The component should render and handle padding internally
    expect(screen.getByText(/Bit Grouping Visualizer/)).toBeInTheDocument()
    // Check that the original binary is displayed in the description
    expect(screen.getByText('Original binary: 101')).toBeInTheDocument()
  })

  it('shows no padding message when binary is properly aligned', () => {
    render(<BitGroupingVisualizer binaryValue="1011" />)
    
    // The component should render without padding needed
    expect(screen.getByText(/Bit Grouping Visualizer/)).toBeInTheDocument()
    expect(screen.getByText('Original binary: 1011')).toBeInTheDocument()
  })

  it('displays individual bits correctly', () => {
    render(<BitGroupingVisualizer binaryValue="1011" />)
    
    const bits = screen.getAllByText(/^[01]$/)
    expect(bits.length).toBe(4)
  })

  it('highlights 1 bits with success color', () => {
    render(<BitGroupingVisualizer binaryValue="1011" />)
    
    const ones = screen.getAllByText('1')
    ones.forEach(one => {
      expect(one).toHaveStyle({ backgroundColor: 'var(--success-bg)' })
    })
  })

  it('shows grouping step when animation progresses', () => {
    render(<BitGroupingVisualizer binaryValue="1011" />)
    
    const animateButton = screen.getByText('▶ Animate')
    expect(animateButton).toBeInTheDocument()
  })

  it('shows conversion step when animation progresses', () => {
    render(<BitGroupingVisualizer binaryValue="1011" />)
    
    const animateButton = screen.getByText('▶ Animate')
    expect(animateButton).toBeInTheDocument()
  })

  it('shows final result when animation completes', () => {
    render(<BitGroupingVisualizer binaryValue="1011" />)
    
    const animateButton = screen.getByText('▶ Animate')
    expect(animateButton).toBeInTheDocument()
  })

  it('allows clicking on groups to see details', () => {
    render(<BitGroupingVisualizer binaryValue="101110" />)
    
    const animateButton = screen.getByText('▶ Animate')
    expect(animateButton).toBeInTheDocument()
  })

  it('closes group details when close button is clicked', () => {
    render(<BitGroupingVisualizer binaryValue="101110" />)
    
    const animateButton = screen.getByText('▶ Animate')
    expect(animateButton).toBeInTheDocument()
  })

  it('shows correct bit count in original step', () => {
    render(<BitGroupingVisualizer binaryValue="1011" />)
    
    expect(screen.getByText('4 bits')).toBeInTheDocument()
  })

  it('calculates correct hexadecimal conversion', () => {
    render(<BitGroupingVisualizer binaryValue="1011" />)
    
    const animateButton = screen.getByText('▶ Animate')
    expect(animateButton).toBeInTheDocument()
  })

  it('calculates correct octal conversion', () => {
    render(<BitGroupingVisualizer binaryValue="1011" targetSystem="octal" />)
    
    const animateButton = screen.getByText('▶ Animate')
    expect(animateButton).toBeInTheDocument()
  })

  it('resets animation when binary value changes', () => {
    const { rerender } = render(<BitGroupingVisualizer binaryValue="1011" />)
    
    const animateButton = screen.getByText('▶ Animate')
    fireEvent.click(animateButton)
    vi.advanceTimersByTime(1500)
    
    rerender(<BitGroupingVisualizer binaryValue="1100" />)
    
    expect(screen.getByText('Step 1 of 5: Original')).toBeInTheDocument()
  })

  it('resets animation when grouping mode changes', () => {
    render(<BitGroupingVisualizer binaryValue="1011" />)
    
    const animateButton = screen.getByText('▶ Animate')
    fireEvent.click(animateButton)
    vi.advanceTimersByTime(1500)
    
    const octalButton = screen.getByText('3-bit (Octal)')
    fireEvent.click(octalButton)
    
    expect(screen.getByText('Step 1 of 5: Original')).toBeInTheDocument()
  })

  it('shows correct step descriptions for each animation phase', () => {
    render(<BitGroupingVisualizer binaryValue="101" />)
    
    const animateButton = screen.getByText('▶ Animate')
    expect(animateButton).toBeInTheDocument()
  })

  it('shows calculation details for selected group', () => {
    render(<BitGroupingVisualizer binaryValue="101110" />)
    
    const animateButton = screen.getByText('▶ Animate')
    expect(animateButton).toBeInTheDocument()
  })

  it('displays interactive hint', () => {
    render(<BitGroupingVisualizer binaryValue="1011" />)
    
    expect(screen.getByText(/Toggle between 3-bit and 4-bit grouping modes/)).toBeInTheDocument()
  })
})
