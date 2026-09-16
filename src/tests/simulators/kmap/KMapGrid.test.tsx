import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import KMapGrid from '../../../simulators/kmap/components/KMapGrid'
import { createKMap, cellToMinterm } from '../../../core/kmap'

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

describe('KMapGrid — group overlay rectangles', () => {
  const noop = () => {}
  // jsdom has no layout, so cellSize is clamped to MIN_CELL_SIZE (45).
  // LABEL_WIDTH = 45, HEADER_HEIGHT = 45, overlay pad = 2.
  const CS = 45
  const PAD = 2

  function renderWithGroups(minterms: number[]) {
    const kmap = createKMap(['A', 'B', 'C', 'D'])
    return render(
      <KMapGrid
        kmap={kmap}
        onCellClick={noop}
        onCellSelect={noop}
        onCellInfo={noop}
        selectedCells={new Set()}
        hoveredCell={null}
        onCellHover={noop}
        showMintermNumbers={false}
        showSOP={true}
        groupOverlays={[{ minterms, colorIndex: 0 }]}
      />,
    )
  }

  // Solid overlay fill rects = the merged group blocks. Cells are keyed by
  // data-testid and border rects use fill="none", so neither is matched.
  function groupBlocks() {
    return Array.from(document.querySelectorAll<SVGRectElement>('rect'))
      .filter((el) => !el.hasAttribute('data-testid') && el.getAttribute('fill') !== 'none')
      .map((el) => ({
        x: Number(el.getAttribute('x')),
        y: Number(el.getAttribute('y')),
        w: Number(el.getAttribute('width')),
        h: Number(el.getAttribute('height')),
      }))
      .sort((a, b) => a.x - b.x || a.y - b.y)
  }

  it('keeps a non-wrapping group as a single solid rectangle', () => {
    const kmap = createKMap(['A', 'B', 'C', 'D'])
    // 2x2 middle block: rows 1-2, cols 1-2.
    const minterms = [
      cellToMinterm(kmap, 1, 1),
      cellToMinterm(kmap, 1, 2),
      cellToMinterm(kmap, 2, 1),
      cellToMinterm(kmap, 2, 2),
    ]
    renderWithGroups(minterms)
    expect(groupBlocks()).toEqual([
      { x: 88, y: 88, w: 94, h: 94 },
    ])
  })

  it('draws a left-right wrap group as two solid vertical bars', () => {
    const kmap = createKMap(['A', 'B', 'C', 'D'])
    // 4 cells spanning the left and right edges (cols 0 and 3), rows 0-1.
    const minterms = [
      cellToMinterm(kmap, 0, 0),
      cellToMinterm(kmap, 0, 3),
      cellToMinterm(kmap, 1, 0),
      cellToMinterm(kmap, 1, 3),
    ]
    renderWithGroups(minterms)
    expect(groupBlocks()).toEqual([
      { x: 43, y: 43, w: CS + PAD * 2, h: CS * 2 + PAD * 2 },
      { x: 178, y: 43, w: CS + PAD * 2, h: CS * 2 + PAD * 2 },
    ])
  })

  it('draws a top-bottom wrap group as two solid horizontal bars', () => {
    const kmap = createKMap(['A', 'B', 'C', 'D'])
    // 4 cells spanning the top and bottom edges (rows 0 and 3), cols 0-1.
    const minterms = [
      cellToMinterm(kmap, 0, 0),
      cellToMinterm(kmap, 0, 1),
      cellToMinterm(kmap, 3, 0),
      cellToMinterm(kmap, 3, 1),
    ]
    renderWithGroups(minterms)
    expect(groupBlocks()).toEqual([
      { x: 43, y: 43, w: CS * 2 + PAD * 2, h: CS + PAD * 2 },
      { x: 43, y: 178, w: CS * 2 + PAD * 2, h: CS + PAD * 2 },
    ])
  })

  it('draws a four-corner wrap group as four solid corner rectangles', () => {
    const kmap = createKMap(['A', 'B', 'C', 'D'])
    // 4 cells wrapping both axes: corners (0,0), (0,3), (3,0), (3,3).
    const minterms = [
      cellToMinterm(kmap, 0, 0),
      cellToMinterm(kmap, 0, 3),
      cellToMinterm(kmap, 3, 0),
      cellToMinterm(kmap, 3, 3),
    ]
    renderWithGroups(minterms)
    expect(groupBlocks()).toEqual([
      { x: 43, y: 43, w: CS + PAD * 2, h: CS + PAD * 2 },
      { x: 43, y: 178, w: CS + PAD * 2, h: CS + PAD * 2 },
      { x: 178, y: 43, w: CS + PAD * 2, h: CS + PAD * 2 },
      { x: 178, y: 178, w: CS + PAD * 2, h: CS + PAD * 2 },
    ])
  })

  it('draws a full-height left-right wrap group of 8 as two full-height bars', () => {
    const kmap = createKMap(['A', 'B', 'C', 'D'])
    // All 4 rows x (cols 0 and 3): wraps at the vertical seam.
    const minterms = [
      cellToMinterm(kmap, 0, 0),
      cellToMinterm(kmap, 0, 3),
      cellToMinterm(kmap, 1, 0),
      cellToMinterm(kmap, 1, 3),
      cellToMinterm(kmap, 2, 0),
      cellToMinterm(kmap, 2, 3),
      cellToMinterm(kmap, 3, 0),
      cellToMinterm(kmap, 3, 3),
    ]
    renderWithGroups(minterms)
    expect(groupBlocks()).toEqual([
      { x: 43, y: 43, w: CS + PAD * 2, h: CS * 4 + PAD * 2 },
      { x: 178, y: 43, w: CS + PAD * 2, h: CS * 4 + PAD * 2 },
    ])
  })
})