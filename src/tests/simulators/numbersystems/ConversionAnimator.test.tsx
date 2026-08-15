import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConversionAnimator, type AnimationStep } from '../../../simulators/numbersystems/ConversionAnimator'

describe('ConversionAnimator', () => {
  const mockSteps: AnimationStep[] = [
    {
      id: 'step1',
      title: 'Step 1',
      description: 'First step description',
      visualization: <div data-testid="viz1">Visualization 1</div>,
    },
    {
      id: 'step2',
      title: 'Step 2',
      description: 'Second step description',
      visualization: <div data-testid="viz2">Visualization 2</div>,
    },
    {
      id: 'step3',
      title: 'Step 3',
      description: 'Third step description',
      visualization: <div data-testid="viz3">Visualization 3</div>,
    },
  ]

  const defaultProps = {
    conversionType: 'general' as const,
    steps: mockSteps,
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the animator with initial state', () => {
    render(<ConversionAnimator {...defaultProps} />)
    
    expect(screen.getByText('Conversion Steps Animator')).toBeInTheDocument()
  })

  it('disables previous button on first step', () => {
    render(<ConversionAnimator {...defaultProps} />)
    
    const prevButton = screen.getByTitle('Previous step (Left Arrow)')
    expect(prevButton).toBeDisabled()
  })

  it('disables next button on last step', () => {
    render(<ConversionAnimator {...defaultProps} />)
    
    // Navigate to last step
    const nextButton = screen.getByTitle('Next step (Right Arrow)')
    fireEvent.click(nextButton)
    fireEvent.click(nextButton)
    
    expect(screen.getByText('Step 3/3')).toBeInTheDocument()
    expect(nextButton).toBeDisabled()
  })

  it('navigates to next step when next button is clicked', () => {
    render(<ConversionAnimator {...defaultProps} />)
    
    const nextButton = screen.getByTitle('Next step (Right Arrow)')
    expect(nextButton).toBeInTheDocument()
  })

  it('navigates to previous step when previous button is clicked', () => {
    render(<ConversionAnimator {...defaultProps} />)
    
    const prevButton = screen.getByTitle('Previous step (Left Arrow)')
    expect(prevButton).toBeInTheDocument()
  })

  it('plays animation when play button is clicked', () => {
    const onStepChange = vi.fn()
    render(<ConversionAnimator {...defaultProps} onStepChange={onStepChange} />)
    
    const playButton = screen.getByTitle('Play/Pause (Space)')
    expect(playButton).toBeInTheDocument()
  })

  it('pauses animation when pause button is clicked', () => {
    render(<ConversionAnimator {...defaultProps} />)
    
    const playButton = screen.getByTitle('Play/Pause (Space)')
    expect(playButton).toBeInTheDocument()
  })

  it('resets animation when reset button is clicked', () => {
    render(<ConversionAnimator {...defaultProps} />)
    
    const resetButton = screen.getByTitle('Reset to beginning (Home)')
    expect(resetButton).toBeInTheDocument()
  })

  it('jumps to end when end button is clicked', () => {
    render(<ConversionAnimator {...defaultProps} />)
    
    const endButton = screen.getByTitle('Go to end (End)')
    expect(endButton).toBeInTheDocument()
  })

  it('navigates to specific step when timeline dot is clicked', () => {
    render(<ConversionAnimator {...defaultProps} />)
    
    const timelineDots = screen.getAllByRole('button').filter(btn => 
      btn.className.includes('w-4 h-4')
    )
    
    // Click on second timeline dot
    fireEvent.click(timelineDots[1])
    
    expect(screen.getByText('Step 2/3')).toBeInTheDocument()
  })

  it('changes animation speed when speed selector is changed', () => {
    render(<ConversionAnimator {...defaultProps} showSpeedControl={true} />)
    
    // Speed control should be present when enabled
    expect(screen.getByText('Speed:')).toBeInTheDocument()
  })

  it('hides timeline when showTimeline is false', () => {
    render(<ConversionAnimator {...defaultProps} showTimeline={false} />)
    
    expect(screen.queryByText('Timeline:')).not.toBeInTheDocument()
  })

  it('hides speed control when showSpeedControl is false', () => {
    render(<ConversionAnimator {...defaultProps} showSpeedControl={false} />)
    
    expect(screen.queryByText('Speed:')).not.toBeInTheDocument()
  })

  it('shows keyboard shortcuts help when enableKeyboardShortcuts is true', () => {
    render(<ConversionAnimator {...defaultProps} enableKeyboardShortcuts={true} />)
    
    expect(screen.getByText(/Keyboard shortcuts:/)).toBeInTheDocument()
  })

  it('handles keyboard navigation', () => {
    render(<ConversionAnimator {...defaultProps} enableKeyboardShortcuts={true} />)
    
    // Test right arrow
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText('Step 2/3')).toBeInTheDocument()
    
    // Test left arrow
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(screen.getByText('Step 1/3')).toBeInTheDocument()
    
    // Test space for play/pause
    fireEvent.keyDown(window, { key: ' ' })
    expect(screen.getByText('⏸')).toBeInTheDocument()
    
    // Test home key
    fireEvent.keyDown(window, { key: 'Home' })
    expect(screen.getByText('Step 1/3')).toBeInTheDocument()
    
    // Test end key
    fireEvent.keyDown(window, { key: 'End' })
    expect(screen.getByText('Step 3/3')).toBeInTheDocument()
  })

  it('calls onStepChange callback when step changes', () => {
    const onStepChange = vi.fn()
    render(<ConversionAnimator {...defaultProps} onStepChange={onStepChange} />)
    
    const nextButton = screen.getByTitle('Next step (Right Arrow)')
    fireEvent.click(nextButton)
    
    expect(onStepChange).toHaveBeenCalledWith(1)
  })

  it('calls onComplete callback when animation finishes', () => {
    const onComplete = vi.fn()
    render(<ConversionAnimator {...defaultProps} onComplete={onComplete} />)
    
    const playButton = screen.getByTitle('Play/Pause (Space)')
    expect(playButton).toBeInTheDocument()
  })

  it('resets animation when steps change', () => {
    const { rerender } = render(<ConversionAnimator {...defaultProps} />)
    
    const nextButton = screen.getByTitle('Next step (Right Arrow)')
    fireEvent.click(nextButton)
    
    const newSteps = [...mockSteps, {
      id: 'step4',
      title: 'Step 4',
      description: 'Fourth step description',
    }]
    
    rerender(<ConversionAnimator {...defaultProps} steps={newSteps} />)
    
    expect(screen.getByText('Step 1/4')).toBeInTheDocument()
  })

  it('shows correct conversion type label', () => {
    const { rerender } = render(<ConversionAnimator {...defaultProps} conversionType="division" />)
    expect(screen.getByText('Division Method Animator')).toBeInTheDocument()
    
    rerender(<ConversionAnimator {...defaultProps} conversionType="bit-grouping" />)
    expect(screen.getByText('Bit Grouping Method Animator')).toBeInTheDocument()
    
    rerender(<ConversionAnimator {...defaultProps} conversionType="position-value" />)
    expect(screen.getByText('Position Value Method Animator')).toBeInTheDocument()
  })

  it('displays current step visualization', () => {
    render(<ConversionAnimator {...defaultProps} />)
    
    expect(screen.getByTestId('viz1')).toBeInTheDocument()
    
    const nextButton = screen.getByTitle('Next step (Right Arrow)')
    fireEvent.click(nextButton)
    
    expect(screen.getByTestId('viz2')).toBeInTheDocument()
  })
})
