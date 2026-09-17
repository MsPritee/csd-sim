import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VariableNameEditor from '../../../simulators/kmap/components/VariableNameEditor'

function selects(container: HTMLElement): HTMLSelectElement[] {
  return Array.from(container.querySelectorAll('select'))
}

function selectValues(container: HTMLElement): (string | undefined)[] {
  return selects(container).map((s) => s.value)
}

function option(select: HTMLSelectElement, label: string): HTMLOptionElement {
  return Array.from(select.options).find((o) => o.textContent === label)!
}

describe('VariableNameEditor', () => {
  it('renders a single-row Name: label plus one dropdown per variable with the preset defaults', () => {
    const { container } = render(<VariableNameEditor variables={['A', 'B', 'C']} onChange={vi.fn()} />)
    expect(selects(container)).toHaveLength(3)
    expect(selectValues(container)).toEqual(['A', 'B', 'C'])
    expect(screen.getByText('Name:')).toBeDefined()
    expect(screen.getByLabelText('Variable 1 name')).toBeDefined()
    expect(screen.getByLabelText('Variable 2 name')).toBeDefined()
    expect(screen.getByLabelText('Variable 3 name')).toBeDefined()
  })

  it('renders dropdowns for 2, 4 and 5 variable counts', () => {
    const two = render(<VariableNameEditor variables={['A', 'B']} onChange={vi.fn()} />)
    expect(selectValues(two.container)).toEqual(['A', 'B'])

    const four = render(<VariableNameEditor variables={['A', 'B', 'C', 'D']} onChange={vi.fn()} />)
    expect(selectValues(four.container)).toEqual(['A', 'B', 'C', 'D'])

    const five = render(<VariableNameEditor variables={['A', 'B', 'C', 'D', 'E']} onChange={vi.fn()} />)
    expect(selectValues(five.container)).toEqual(['A', 'B', 'C', 'D', 'E'])
    expect(screen.getByLabelText('Variable 5 name')).toBeDefined()
  })

  it('renders a custom input for a name that is not in the preset list', () => {
    const { container } = render(<VariableNameEditor variables={['G', 'B']} onChange={vi.fn()} />)
    expect(selects(container)[0]?.value).toBe('__custom__')
    expect(screen.getByLabelText('Custom name for Variable 1')).toHaveValue('G')
  })

  it('commits a preset name change', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(<VariableNameEditor variables={['A', 'B', 'C']} onChange={onChange} />)
    await user.selectOptions(selects(container)[0]!, 'W')
    expect(onChange).toHaveBeenCalledWith(['W', 'B', 'C'])
  })

  it('commits a valid custom name typed via Other', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(<VariableNameEditor variables={['A', 'B', 'C']} onChange={onChange} />)
    await user.selectOptions(selects(container)[0]!, '__custom__')

    const input = screen.getByPlaceholderText('Input variable name...')
    fireEvent.change(input, { target: { value: 'Q' } })
    expect(onChange).toHaveBeenCalledWith(['Q', 'B', 'C'])
  })

  it('shows a duplicate validation message and never commits the invalid set', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(<VariableNameEditor variables={['A', 'B', 'C']} onChange={onChange} />)
    await user.selectOptions(selects(container)[1]!, '__custom__')

    fireEvent.change(screen.getByPlaceholderText('Input variable name...'), {
      target: { value: 'A' },
    })
    expect(screen.getByText(/already used by Variable 1/)).toBeDefined()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows an empty-name validation message when Other is chosen', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(<VariableNameEditor variables={['A', 'B', 'C']} onChange={onChange} />)
    await user.selectOptions(selects(container)[0]!, '__custom__')

    expect(screen.getByText(/cannot be empty/)).toBeDefined()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows a single-letter validation message for multi-character names', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(<VariableNameEditor variables={['A', 'B', 'C']} onChange={onChange} />)
    await user.selectOptions(selects(container)[0]!, '__custom__')

    fireEvent.change(screen.getByPlaceholderText('Input variable name...'), {
      target: { value: 'AB' },
    })
    expect(screen.getByText(/single letter/)).toBeDefined()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('disables preset names already assigned to another variable', () => {
    const { container } = render(<VariableNameEditor variables={['A', 'B', 'C']} onChange={vi.fn()} />)
    const first = selects(container)[0]!
    const second = selects(container)[1]!

    expect(option(first, 'A').disabled).toBe(false) // its own name stays enabled
    expect(option(first, 'B').disabled).toBe(true) // used by Variable 2
    expect(option(first, 'C').disabled).toBe(true) // used by Variable 3
    expect(option(second, 'A').disabled).toBe(true)
    expect(option(second, 'Other')).toBeDefined()
  })

  it('reconciles when the variables change externally (4 -> 3)', async () => {
    const { container, rerender } = render(<VariableNameEditor variables={['A', 'B', 'C', 'D']} onChange={vi.fn()} />)
    expect(selects(container)).toHaveLength(4)

    rerender(<VariableNameEditor variables={['A', 'B', 'C']} onChange={vi.fn()} />)
    await waitFor(() => expect(selects(container)).toHaveLength(3))
    expect(selectValues(container)).toEqual(['A', 'B', 'C'])
  })

  it('returns to a preset dropdown once a custom name matches a preset letter', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(<VariableNameEditor variables={['A', 'B', 'C']} onChange={onChange} />)
    await user.selectOptions(selects(container)[0]!, '__custom__')

    fireEvent.change(screen.getByPlaceholderText('Input variable name...'), {
      target: { value: 'W' },
    })
    expect(onChange).toHaveBeenCalledWith(['W', 'B', 'C'])
    expect(screen.queryByPlaceholderText('Input variable name...')).toBeNull()
    expect(selects(container)[0]?.value).toBe('W')
  })
})