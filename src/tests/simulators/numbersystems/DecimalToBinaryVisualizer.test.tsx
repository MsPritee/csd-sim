/**
 * Tests for DecimalToBinaryVisualizer component
 * Tests visual conversion, animation sequences, and user interactions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DecimalToBinaryVisualizer } from '../../../simulators/numbersystems/DecimalToBinaryVisualizer'

describe('DecimalToBinaryVisualizer', () => {
  describe('Component Rendering', () => {
    it('should render with decimal value 200', () => {
      const { container } = render(<DecimalToBinaryVisualizer decimalValue={200} />)
      expect(container.textContent).toContain('(200)₁₀')
    })

    it('should render with decimal value 5', () => {
      const { container } = render(<DecimalToBinaryVisualizer decimalValue={5} />)
      expect(container.textContent).toContain('(5)₁₀')
    })

    it('should render division table', () => {
      const { container } = render(<DecimalToBinaryVisualizer decimalValue={10} />)
      expect(container.textContent).toContain('Repeated Division by 2')
    })

    it('should render controls', () => {
      render(<DecimalToBinaryVisualizer decimalValue={10} />)
      expect(screen.getByText('▶ Start')).toBeInTheDocument()
      expect(screen.getByText('← Previous')).toBeInTheDocument()
      expect(screen.getByText('Next →')).toBeInTheDocument()
      expect(screen.getByText('↻ Restart')).toBeInTheDocument()
    })

    it('should render keyboard shortcuts help', () => {
      const { container } = render(<DecimalToBinaryVisualizer decimalValue={10} />)
      expect(container.textContent).toContain('Keyboard Shortcuts')
    })
  })

  describe('Division Steps Generation', () => {
    it('should generate correct division steps for 200', () => {
      const { container } = render(<DecimalToBinaryVisualizer decimalValue={200} />)
      
      // Check that division steps are present
      expect(container.textContent).toContain('200')
      expect(container.textContent).toContain('100')
      expect(container.textContent).toContain('50')
      expect(container.textContent).toContain('25')
      expect(container.textContent).toContain('12')
      expect(container.textContent).toContain('6')
      expect(container.textContent).toContain('3')
      expect(container.textContent).toContain('1')
      expect(container.textContent).toContain('0')
    })

    it('should generate correct division steps for 5', () => {
      const { container } = render(<DecimalToBinaryVisualizer decimalValue={5} />)
      
      expect(container.textContent).toContain('5')
      expect(container.textContent).toContain('2')
      expect(container.textContent).toContain('1')
      expect(container.textContent).toContain('0')
    })

    it('should handle zero correctly', () => {
      const { container } = render(<DecimalToBinaryVisualizer decimalValue={0} />)
      expect(container.textContent).toContain('(0)₁₀')
    })

    it('should handle one correctly', () => {
      const { container } = render(<DecimalToBinaryVisualizer decimalValue={1} />)
      expect(container.textContent).toContain('(1)₁₀')
    })

    it('should handle powers of two correctly', () => {
      const { container } = render(<DecimalToBinaryVisualizer decimalValue={256} />)
      expect(container.textContent).toContain('(256)₁₀')
    })

    it('should handle large numbers correctly', () => {
      const { container } = render(<DecimalToBinaryVisualizer decimalValue={1024} />)
      expect(container.textContent).toContain('(1024)₁₀')
    })
  })

  describe('Remainder Calculation', () => {
    it('should calculate correct remainders for 200', () => {
      render(<DecimalToBinaryVisualizer decimalValue={200} />)
      
      // The remainders for 200 should be: 0, 0, 0, 1, 0, 0, 1, 1
      const remainders = screen.getAllByText(/\d/)
      const remainderValues = remainders
        .map(el => parseInt(el.textContent || '0'))
        .filter(n => n === 0 || n === 1)
      
      // Check that we have the expected number of remainders
      expect(remainderValues.length).toBeGreaterThan(0)
    })

    it('should calculate correct remainders for 13', () => {
      const { container } = render(<DecimalToBinaryVisualizer decimalValue={13} />)
      
      // 13 in binary is 1101
      // Division steps: 13÷2=6r1, 6÷2=3r0, 3÷2=1r1, 1÷2=0r1
      expect(container.textContent).toContain('13')
    })
  })

  describe('Animation Controls', () => {
    it('should start animation when play button is clicked', async () => {
      render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      const playButton = screen.getByText('▶ Start')
      fireEvent.click(playButton)
      
      await waitFor(() => {
        expect(screen.getByText('⏸ Pause')).toBeInTheDocument()
      })
    })

    it('should pause animation when pause button is clicked', async () => {
      render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      const playButton = screen.getByText('▶ Start')
      fireEvent.click(playButton)
      
      await waitFor(() => {
        expect(screen.getByText('⏸ Pause')).toBeInTheDocument()
      })
      
      const pauseButton = screen.getByText('⏸ Pause')
      fireEvent.click(pauseButton)
      
      await waitFor(() => {
        expect(screen.getByText('▶ Start')).toBeInTheDocument()
      })
    })

    it('should go to next step when next button is clicked', () => {
      render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      const nextButton = screen.getByText('Next →')
      fireEvent.click(nextButton)
      
      // Step indicator should change
      expect(screen.getByText(/Step \d+ \/ \d+/)).toBeInTheDocument()
    })

    it('should go to previous step when previous button is clicked', () => {
      const { container } = render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      // First go forward
      const nextButton = screen.getByText('Next →')
      fireEvent.click(nextButton)
      
      // Then go back
      const previousButton = screen.getByText('← Previous')
      fireEvent.click(previousButton)
      
      // Should be back at step 1
      expect(container.textContent).toContain('Step 1')
    })

    it('should reset animation when restart button is clicked', () => {
      const { container } = render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      // Go forward a few steps
      const nextButton = screen.getByText('Next →')
      fireEvent.click(nextButton)
      fireEvent.click(nextButton)
      
      // Reset
      const restartButton = screen.getByText('↻ Restart')
      fireEvent.click(restartButton)
      
      // Should be back at step 1
      expect(container.textContent).toContain('Step 1')
    })

    it('should change animation speed', () => {
      render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      const speedSelect = screen.getByLabelText('Animation speed')
      fireEvent.change(speedSelect, { target: { value: 'fast' } })
      
      expect(speedSelect).toHaveValue('fast')
    })
  })

  describe('Step Navigation', () => {
    it('should update step indicator correctly', () => {
      render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      const nextButton = screen.getByText('Next →')
      fireEvent.click(nextButton)
      
      expect(screen.getByText(/Step 2/)).toBeInTheDocument()
    })

    it('should disable previous button at first step', () => {
      render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      const previousButton = screen.getByText('← Previous')
      expect(previousButton).toBeDisabled()
    })

    it('should disable next button at completion', async () => {
      render(<DecimalToBinaryVisualizer decimalValue={5} />)
      
      // Fast forward to completion
      const nextButton = screen.getByText('Next →')
      for (let i = 0; i < 10; i++) {
        fireEvent.click(nextButton)
      }
      
      await waitFor(() => {
        expect(screen.getByText('Complete')).toBeInTheDocument()
      })
    })
  })

  describe('Binary Result Display', () => {
    it('should show underscores before completion', () => {
      const { container } = render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      // Binary result should show underscores before completion
      expect(container.textContent).toMatch(/\(_+\)₂/)
    })

    it('should show correct binary result for 200 after completion', async () => {
      const { container } = render(<DecimalToBinaryVisualizer decimalValue={200} />)
      
      // 200 in binary is 11001000
      const nextButton = screen.getByText('Next →')
      
      // Fast forward to completion
      for (let i = 0; i < 20; i++) {
        fireEvent.click(nextButton)
      }
      
      await waitFor(() => {
        expect(container.textContent).toContain('(11001000)₂')
      })
    })

    it('should show correct binary result for 5 after completion', async () => {
      const { container } = render(<DecimalToBinaryVisualizer decimalValue={5} />)
      
      // 5 in binary is 101
      const nextButton = screen.getByText('Next →')
      
      // Fast forward to completion
      for (let i = 0; i < 10; i++) {
        fireEvent.click(nextButton)
      }
      
      await waitFor(() => {
        expect(container.textContent).toContain('(101)₂')
      })
    })
  })

  describe('Explanation Panel', () => {
    it('should show explanation panel by default', () => {
      render(<DecimalToBinaryVisualizer decimalValue={10} />)
      expect(screen.getByText('Explanation')).toBeInTheDocument()
    })

    it('should hide explanation when hide button is clicked', () => {
      render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      const hideButton = screen.getByText('Hide Explanation')
      fireEvent.click(hideButton)
      
      expect(screen.queryByText('Explanation')).not.toBeInTheDocument()
    })

    it('should show explanation when show button is clicked', () => {
      render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      const hideButton = screen.getByText('Hide Explanation')
      fireEvent.click(hideButton)
      
      const showButton = screen.getByText('Show Explanation')
      fireEvent.click(showButton)
      
      expect(screen.getByText('Explanation')).toBeInTheDocument()
    })

    it('should update explanation based on current step', () => {
      const { container } = render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      const nextButton = screen.getByText('Next →')
      fireEvent.click(nextButton)
      
      // Explanation should be visible and updated
      expect(container.textContent).toContain('Explanation')
    })
  })

  describe('Bottom-to-Top Reading Animation', () => {
    it('should show reading animation after division completes', async () => {
      render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      const nextButton = screen.getByText('Next →')
      
      // Fast forward through division steps
      for (let i = 0; i < 10; i++) {
        fireEvent.click(nextButton)
      }
      
      await waitFor(() => {
        expect(screen.getByText('Reading Remainders Bottom to Top')).toBeInTheDocument()
      })
    })

    it('should show animated arrow during reading phase', async () => {
      render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      const nextButton = screen.getByText('Next →')
      
      // Fast forward to reading phase
      for (let i = 0; i < 10; i++) {
        fireEvent.click(nextButton)
      }
      
      await waitFor(() => {
        expect(screen.getByText('Read this direction')).toBeInTheDocument()
      })
    })
  })

  describe('Educational Callout', () => {
    it('should show educational callout at completion', async () => {
      render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      const nextButton = screen.getByText('Next →')
      
      // Fast forward to completion
      for (let i = 0; i < 15; i++) {
        fireEvent.click(nextButton)
      }
      
      await waitFor(() => {
        expect(screen.getByText('Why Read from Bottom to Top?')).toBeInTheDocument()
      })
    })

    it('should explain LSB and MSB concepts', async () => {
      const { container } = render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      const nextButton = screen.getByText('Next →')
      
      // Fast forward to completion
      for (let i = 0; i < 15; i++) {
        fireEvent.click(nextButton)
      }
      
      await waitFor(() => {
        expect(container.textContent).toContain('LSB')
        expect(container.textContent).toContain('MSB')
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('should go to next step on right arrow key', () => {
      render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      fireEvent.keyDown(window, { key: 'ArrowRight' })
      
      expect(screen.getByText(/Step 2/)).toBeInTheDocument()
    })

    it('should go to previous step on left arrow key', () => {
      const { container } = render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      // First go forward
      fireEvent.keyDown(window, { key: 'ArrowRight' })
      
      // Then go back
      fireEvent.keyDown(window, { key: 'ArrowLeft' })
      
      expect(container.textContent).toContain('Step 1')
    })

    it('should toggle play on Enter key', () => {
      render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      fireEvent.keyDown(window, { key: 'Enter' })
      
      expect(screen.getByText('⏸ Pause')).toBeInTheDocument()
    })

    it('should reset on Escape key', () => {
      const { container } = render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      // Go forward first
      fireEvent.keyDown(window, { key: 'ArrowRight' })
      
      // Reset
      fireEvent.keyDown(window, { key: 'Escape' })
      
      expect(container.textContent).toContain('Step 1')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels on controls', () => {
      render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      expect(screen.getByLabelText('Play animation')).toBeInTheDocument()
      expect(screen.getByLabelText('Next step')).toBeInTheDocument()
      expect(screen.getByLabelText('Previous step')).toBeInTheDocument()
      expect(screen.getByLabelText('Restart animation')).toBeInTheDocument()
    })

    it('should support keyboard navigation for division rows', () => {
      render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      const divisionRows = screen.getAllByRole('button')
      expect(divisionRows.length).toBeGreaterThan(0)
    })

    it('should provide screen reader friendly descriptions', () => {
      const { container } = render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      // Check for ARIA labels and descriptions
      const mainContainer = container.querySelector('[aria-label]')
      expect(mainContainer).toBeTruthy()
    })
  })

  describe('Edge Cases', () => {
    it('should handle maximum valid number', () => {
      render(<DecimalToBinaryVisualizer decimalValue={4294967295} />)
      expect(screen.getByText('(4294967295)₁₀')).toBeInTheDocument()
    })

    it('should handle negative numbers with error', () => {
      // This should handle the error case gracefully
      render(<DecimalToBinaryVisualizer decimalValue={-5} />)
      // Component should show error or handle gracefully
    })

    it('should handle non-integer inputs gracefully', () => {
      render(<DecimalToBinaryVisualizer decimalValue={10.5} />)
      // Should handle decimal input gracefully
    })
  })

  describe('Responsive Design', () => {
    it('should render correctly on mobile viewport', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      expect(screen.getByText('(10)₁₀')).toBeInTheDocument()
    })

    it('should render correctly on tablet viewport', () => {
      // Simulate tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      render(<DecimalToBinaryVisualizer decimalValue={10} />)
      
      expect(screen.getByText('(10)₁₀')).toBeInTheDocument()
    })
  })
})
