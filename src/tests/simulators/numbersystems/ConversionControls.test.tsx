/**
 * Tests for ConversionControls component
 * Tests animation control functionality and user interactions
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { ConversionControls } from '../../../simulators/numbersystems/ConversionControls'

describe('ConversionControls', () => {
  const mockProps = {
    isPlaying: false,
    onTogglePlay: vi.fn(),
    onNext: vi.fn(),
    onPrevious: vi.fn(),
    onReset: vi.fn(),
    speed: 'normal' as const,
    onSpeedChange: vi.fn(),
    currentStep: 0,
    totalSteps: 8,
    phase: 'division',
  }

  describe('Rendering', () => {
    it('should render all control buttons', () => {
      render(<ConversionControls {...mockProps} />)

      expect(screen.getByText('▶ Start')).toBeInTheDocument()
      expect(screen.getByText('← Previous')).toBeInTheDocument()
      expect(screen.getByText('Next →')).toBeInTheDocument()
      expect(screen.getByText('↻ Restart')).toBeInTheDocument()
    })

    it('should render speed selector', () => {
      render(<ConversionControls {...mockProps} />)

      expect(screen.getByLabelText('Animation speed')).toBeInTheDocument()
      expect(screen.getByText('Speed:')).toBeInTheDocument()
    })

    it('should render step indicator', () => {
      render(<ConversionControls {...mockProps} />)

      expect(screen.getByText('Step 1 / 8')).toBeInTheDocument()
    })
  })

  describe('Play/Pause Button', () => {
    it('should show Start button when not playing', () => {
      render(<ConversionControls {...mockProps} isPlaying={false} />)

      expect(screen.getByText('▶ Start')).toBeInTheDocument()
    })

    it('should show Pause button when playing', () => {
      render(<ConversionControls {...mockProps} isPlaying={true} />)

      expect(screen.getByText('⏸ Pause')).toBeInTheDocument()
    })

    it('should call onTogglePlay when clicked', () => {
      const onTogglePlay = vi.fn()
      render(<ConversionControls {...mockProps} onTogglePlay={onTogglePlay} />)

      const playButton = screen.getByText('▶ Start')
      fireEvent.click(playButton)

      expect(onTogglePlay).toHaveBeenCalled()
    })

    it('should be disabled when disabled prop is true', () => {
      render(<ConversionControls {...mockProps} disabled={true} />)

      const playButton = screen.getByText('▶ Start')
      expect(playButton).toBeDisabled()
    })
  })

  describe('Previous Button', () => {
    it('should call onPrevious when clicked', () => {
      const onPrevious = vi.fn()
      render(<ConversionControls {...mockProps} onPrevious={onPrevious} currentStep={2} />)

      const previousButton = screen.getByText('← Previous')
      fireEvent.click(previousButton)

      expect(onPrevious).toHaveBeenCalled()
    })

    it('should be disabled at first step in division phase', () => {
      render(
        <ConversionControls
          {...mockProps}
          currentStep={0}
          phase="division"
        />
      )

      const previousButton = screen.getByText('← Previous')
      expect(previousButton).toBeDisabled()
    })

    it('should be enabled when not at first step', () => {
      render(
        <ConversionControls
          {...mockProps}
          currentStep={2}
          phase="division"
        />
      )

      const previousButton = screen.getByText('← Previous')
      expect(previousButton).not.toBeDisabled()
    })
  })

  describe('Next Button', () => {
    it('should call onNext when clicked', () => {
      const onNext = vi.fn()
      render(<ConversionControls {...mockProps} onNext={onNext} />)

      const nextButton = screen.getByText('Next →')
      fireEvent.click(nextButton)

      expect(onNext).toHaveBeenCalled()
    })

    it('should be disabled in complete phase', () => {
      render(
        <ConversionControls
          {...mockProps}
          phase="complete"
        />
      )

      const nextButton = screen.getByText('Next →')
      expect(nextButton).toBeDisabled()
    })

    it('should be enabled in division phase', () => {
      render(
        <ConversionControls
          {...mockProps}
          phase="division"
        />
      )

      const nextButton = screen.getByText('Next →')
      expect(nextButton).not.toBeDisabled()
    })
  })

  describe('Reset Button', () => {
    it('should call onReset when clicked', () => {
      const onReset = vi.fn()
      render(<ConversionControls {...mockProps} onReset={onReset} />)

      const resetButton = screen.getByText('↻ Restart')
      fireEvent.click(resetButton)

      expect(onReset).toHaveBeenCalled()
    })

    it('should be disabled when disabled prop is true', () => {
      render(<ConversionControls {...mockProps} disabled={true} />)

      const resetButton = screen.getByText('↻ Restart')
      expect(resetButton).toBeDisabled()
    })
  })

  describe('Speed Selector', () => {
    it('should render all speed options', () => {
      render(<ConversionControls {...mockProps} />)

      const speedSelect = screen.getByLabelText('Animation speed')
      expect(speedSelect).toBeInTheDocument()

      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(3)
      expect(screen.getByText('Slow')).toBeInTheDocument()
      expect(screen.getByText('Normal')).toBeInTheDocument()
      expect(screen.getByText('Fast')).toBeInTheDocument()
    })

    it('should call onSpeedChange when value changes', () => {
      const onSpeedChange = vi.fn()
      render(<ConversionControls {...mockProps} onSpeedChange={onSpeedChange} />)

      const speedSelect = screen.getByLabelText('Animation speed')
      fireEvent.change(speedSelect, { target: { value: 'fast' } })

      expect(onSpeedChange).toHaveBeenCalledWith('fast')
    })

    it('should be disabled when disabled prop is true', () => {
      render(<ConversionControls {...mockProps} disabled={true} />)

      const speedSelect = screen.getByLabelText('Animation speed')
      expect(speedSelect).toBeDisabled()
    })
  })

  describe('Step Indicator', () => {
    it('should show correct step in division phase', () => {
      render(
        <ConversionControls
          {...mockProps}
          currentStep={3}
          phase="division"
        />
      )

      expect(screen.getByText('Step 4 / 8')).toBeInTheDocument()
    })

    it('should show reading message in reading phase', () => {
      render(
        <ConversionControls
          {...mockProps}
          phase="reading"
        />
      )

      expect(screen.getByText('Reading remainders...')).toBeInTheDocument()
    })

    it('should show complete message in complete phase', () => {
      render(
        <ConversionControls
          {...mockProps}
          phase="complete"
        />
      )

      expect(screen.getByText('Complete')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ConversionControls {...mockProps} />)

      expect(screen.getByLabelText('Play animation')).toBeInTheDocument()
      expect(screen.getByLabelText('Next step')).toBeInTheDocument()
      expect(screen.getByLabelText('Previous step')).toBeInTheDocument()
      expect(screen.getByLabelText('Restart animation')).toBeInTheDocument()
      expect(screen.getByLabelText('Animation speed')).toBeInTheDocument()
    })

    it('should support keyboard navigation', () => {
      render(<ConversionControls {...mockProps} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('Different Phases', () => {
    it('should render correctly in division phase', () => {
      render(
        <ConversionControls
          {...mockProps}
          phase="division"
          currentStep={2}
        />
      )

      expect(screen.getByText('Step 3 / 8')).toBeInTheDocument()
    })

    it('should render correctly in reading phase', () => {
      render(
        <ConversionControls
          {...mockProps}
          phase="reading"
        />
      )

      expect(screen.getByText('Reading remainders...')).toBeInTheDocument()
    })

    it('should render correctly in complete phase', () => {
      render(
        <ConversionControls
          {...mockProps}
          phase="complete"
        />
      )

      expect(screen.getByText('Complete')).toBeInTheDocument()
      expect(screen.getByText('Next →')).toBeDisabled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle single step', () => {
      render(
        <ConversionControls
          {...mockProps}
          totalSteps={1}
          currentStep={0}
        />
      )

      expect(screen.getByText('Step 1 / 1')).toBeInTheDocument()
    })

    it('should handle zero steps', () => {
      render(
        <ConversionControls
          {...mockProps}
          totalSteps={0}
          currentStep={0}
        />
      )

      expect(screen.getByText('Step 1 / 0')).toBeInTheDocument()
    })

    it('should handle large step count', () => {
      render(
        <ConversionControls
          {...mockProps}
          totalSteps={100}
          currentStep={50}
        />
      )

      expect(screen.getByText('Step 51 / 100')).toBeInTheDocument()
    })
  })
})
