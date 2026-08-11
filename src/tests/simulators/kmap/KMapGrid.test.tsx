import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import KMapGrid from '../../../simulators/kmap/components/KMapGrid'
import { createKMap } from '../../../core/kmap'

describe('KMapGrid', () => {
  const noop = () => {}

  function renderGrid(showSOP: boolean, showMintermNumbers = true) {
    const kmap = createKMap(['A', 'B'])
    return render(
      <KMapGrid
        kmap={kmap}
        onCellClick={noop}
        onCellSelect={noop}
        onCellInfo={noop}
        selectedCells={new Set()}
        hoveredCell={null}
        onCellHover={noop}
        showMintermNumbers={showMintermNumbers}
        showSOP={showSOP}
      />,
    )
  }

  it('shows minterm notation for empty cells in SOP mode', () => {
    renderGrid(true, false)
    expect(screen.getAllByText('m0').length).toBeGreaterThan(0)
    expect(screen.getAllByText('m3').length).toBeGreaterThan(0)
  })

  it('shows maxterm notation for empty cells in POS mode', () => {
    renderGrid(false, false)
    expect(screen.getAllByText('M0').length).toBeGreaterThan(0)
    expect(screen.getAllByText('M3').length).toBeGreaterThan(0)
  })

  it('renders minterm index labels in cell corners when enabled', () => {
    renderGrid(true, true)
    expect(screen.getAllByText('0').length).toBeGreaterThan(0)
    expect(screen.getAllByText('3').length).toBeGreaterThan(0)
  })
})