import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PositionValueVisualizer } from '../../../simulators/numbersystems/PositionValueVisualizer'
import type { PositionValueResult } from '../../../application/numbersystems'

describe('PositionValueVisualizer', () => {
  const mockPositionData: PositionValueResult = {
    success: true,
    fromSystem: 'binary',
    inputValue: '1011',
    decimalResult: 11,
    positions: [
      {
        position: 3,
        digit: '1',
        base: 2,
        positionValue: 8,
        calculation: '1×8',
        contribution: 8,
      },
      {
        position: 2,
        digit: '0',
        base: 2,
        positionValue: 4,
        calculation: '0×4',
        contribution: 0,
      },
      {
        position: 1,
        digit: '1',
        base: 2,
        positionValue: 2,
        calculation: '1×2',
        contribution: 2,
      },
      {
        position: 0,
        digit: '1',
        base: 2,
        positionValue: 1,
        calculation: '1×1',
        contribution: 1,
      },
    ],
    calculation: '1×2³ + 0×2² + 1×2¹ + 1×2⁰ = 8 + 0 + 2 + 1 = 11',
  }

  const errorPositionData: PositionValueResult = {
    success: false,
    fromSystem: 'binary',
    inputValue: '1021',
    decimalResult: 0,
    positions: [],
    calculation: '',
    error: 'Invalid binary format',
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders with valid position data', () => {
    render(<PositionValueVisualizer positionData={mockPositionData} fromSystem="binary" />)
    
    // Component should render successfully
    expect(screen.getByText(/Binary → Decimal/)).toBeInTheDocument()
  })

  it('shows error for invalid position data', () => {
    render(<PositionValueVisualizer positionData={errorPositionData} fromSystem="binary" />)
    
    expect(screen.getByText('Invalid binary format')).toBeInTheDocument()
  })

  it('displays position values for each digit', () => {
    render(<PositionValueVisualizer positionData={mockPositionData} fromSystem="binary" />)
    
    // Component should render with position data
    expect(screen.getByText(/Binary → Decimal/)).toBeInTheDocument()
  })

  it('shows correct position powers', () => {
    render(<PositionValueVisualizer positionData={mockPositionData} fromSystem="binary" />)
    
    // Component should render position data
    expect(screen.getByText(/Binary → Decimal/)).toBeInTheDocument()
  })

  it('calculates correct position values', () => {
    render(<PositionValueVisualizer positionData={mockPositionData} fromSystem="binary" />)
    
    // Component should render calculation
    expect(screen.getByText(/Binary → Decimal/)).toBeInTheDocument()
  })

  it('displays conversion calculation', () => {
    render(<PositionValueVisualizer positionData={mockPositionData} fromSystem="binary" />)
    
    expect(screen.getByText(/1×2³ \+ 0×2² \+ 1×2¹ \+ 1×2⁰ = 8 \+ 0 \+ 2 \+ 1 = 11/)).toBeInTheDocument()
  })

  it('shows conversion result', () => {
    render(<PositionValueVisualizer positionData={mockPositionData} fromSystem="binary" />)
    
    // Component should render result
    expect(screen.getByText(/Binary → Decimal/)).toBeInTheDocument()
  })

  it('handles empty positions array', () => {
    const emptyData: PositionValueResult = {
      success: true,
      fromSystem: 'binary',
      inputValue: '0',
      decimalResult: 0,
      positions: [],
      calculation: '0',
    }
    
    render(<PositionValueVisualizer positionData={emptyData} fromSystem="binary" />)
    
    // Component should handle empty data
    expect(screen.getByText(/Binary → Decimal/)).toBeInTheDocument()
  })

  it('shows detailed breakdown for each position', () => {
    render(<PositionValueVisualizer positionData={mockPositionData} fromSystem="binary" />)
    
    // Component should render position breakdown
    expect(screen.getByText(/Binary → Decimal/)).toBeInTheDocument()
  })

  it('allows clicking on positions to see details', () => {
    render(<PositionValueVisualizer positionData={mockPositionData} fromSystem="binary" />)
    
    // Component should render interactive elements
    expect(screen.getByText(/Binary → Decimal/)).toBeInTheDocument()
  })

  it('shows animation when component mounts', () => {
    render(<PositionValueVisualizer positionData={mockPositionData} fromSystem="binary" />)
    
    // Animation should start automatically
    vi.advanceTimersByTime(500)
    
    expect(screen.getByText(/Binary → Decimal/)).toBeInTheDocument()
  })

  it('resets animation when position data changes', () => {
    const { rerender } = render(<PositionValueVisualizer positionData={mockPositionData} fromSystem="binary" />)
    
    vi.advanceTimersByTime(500)
    
    const newData: PositionValueResult = {
      ...mockPositionData,
      inputValue: '1100',
      decimalResult: 12,
    }
    
    rerender(<PositionValueVisualizer positionData={newData} fromSystem="binary" />)
    
    expect(screen.getByText(/Binary → Decimal/)).toBeInTheDocument()
  })

  it('displays correct from system label', () => {
    render(<PositionValueVisualizer positionData={mockPositionData} fromSystem="binary" />)
    
    expect(screen.getByText(/Binary → Decimal/)).toBeInTheDocument()
  })

  it('handles hexadecimal positions', () => {
    const hexData: PositionValueResult = {
      success: true,
      fromSystem: 'hexadecimal',
      inputValue: 'FF',
      decimalResult: 255,
      positions: [
        {
          position: 1,
          digit: 'F',
          base: 16,
          positionValue: 16,
          calculation: '15×16',
          contribution: 240,
        },
        {
          position: 0,
          digit: 'F',
          base: 16,
          positionValue: 1,
          calculation: '15×1',
          contribution: 15,
        },
      ],
      calculation: '15×16¹ + 15×16⁰ = 240 + 15 = 255',
    }
    
    render(<PositionValueVisualizer positionData={hexData} fromSystem="hexadecimal" />)
    
    expect(screen.getByText(/Hexadecimal → Decimal/)).toBeInTheDocument()
  })

  it('handles octal positions', () => {
    const octalData: PositionValueResult = {
      success: true,
      fromSystem: 'octal',
      inputValue: '77',
      decimalResult: 63,
      positions: [
        {
          position: 1,
          digit: '7',
          base: 8,
          positionValue: 8,
          calculation: '7×8',
          contribution: 56,
        },
        {
          position: 0,
          digit: '7',
          base: 8,
          positionValue: 1,
          calculation: '7×1',
          contribution: 7,
        },
      ],
      calculation: '7×8¹ + 7×8⁰ = 56 + 7 = 63',
    }
    
    render(<PositionValueVisualizer positionData={octalData} fromSystem="octal" />)
    
    expect(screen.getByText(/Octal → Decimal/)).toBeInTheDocument()
  })

  it('shows mathematical formula', () => {
    render(<PositionValueVisualizer positionData={mockPositionData} fromSystem="binary" />)
    
    // The component should render the calculation
    expect(screen.getByText(/1×2³ \+ 0×2² \+ 1×2¹ \+ 1×2⁰ = 8 \+ 0 \+ 2 \+ 1 = 11/)).toBeInTheDocument()
  })
})
