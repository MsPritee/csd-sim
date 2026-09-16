import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FiveVarGrid from '../../../simulators/kmap/components/FiveVarGrid'
import { createKMap, withValue } from '../../../core/kmap'

describe('FiveVarGrid', () => {
  const noop = () => {}

  function renderGrid(kmap = createKMap(['A', 'B', 'C', 'D', 'E'])) {
    return render(
      <FiveVarGrid
        kmap={kmap}
        onCellClick={noop}
        onCellSelect={noop}
        onCellInfo={noop}
        selectedCells={new Set()}
        hoveredCell={null}
        onCellHover={noop}
        showMintermNumbers={true}
        showSOP={true}
      />,
    )
  }

  it('renders both E=0 and E=1 planes with all 32 cells', () => {
    renderGrid()
    expect(screen.getByText('E = 0')).toBeTruthy()
    expect(screen.getByText('E = 1')).toBeTruthy()
    expect(document.querySelectorAll('[data-testid^="kmap-cell-"]')).toHaveLength(32)
  })

  it('uses the model minterm convention for plane cell labels', () => {
    renderGrid()
    // Consecutive minterms differ only in E (bit0), so they must sit at the
    // same position across the two planes next to each other.
    expect(screen.getByTestId('kmap-cell-0')).toBeTruthy()
    expect(screen.getByTestId('kmap-cell-1')).toBeTruthy()
    // (plane row 1, col 0): AB=01, CD=00, E=0 -> minterm 8; E=1 -> minterm 9.
    expect(screen.getByTestId('kmap-cell-8')).toBeTruthy()
    expect(screen.getByTestId('kmap-cell-9')).toBeTruthy()
    // (plane row 0, col 1): AB=00, CD=01, E=0 -> minterm 2.
    expect(screen.getByTestId('kmap-cell-2')).toBeTruthy()
  })

  it('displays the correct value in the cell for a given minterm', () => {
    const kmap = withValue(createKMap(['A', 'B', 'C', 'D', 'E']), 2, 1)
    renderGrid(kmap)
    const cell = screen.getByTestId('kmap-cell-2').closest('g')!
    expect(cell.textContent).toContain('1')
  })

  it('reports the correct minterm when a plane cell is clicked', () => {
    const onCellClick = vi.fn()
    render(
      <FiveVarGrid
        kmap={createKMap(['A', 'B', 'C', 'D', 'E'])}
        onCellClick={onCellClick}
        onCellSelect={noop}
        onCellInfo={noop}
        selectedCells={new Set()}
        hoveredCell={null}
        onCellHover={noop}
        showMintermNumbers={true}
        showSOP={true}
      />,
    )
    fireEvent.click(screen.getByTestId('kmap-cell-5'))
    expect(onCellClick).toHaveBeenCalledWith(5)
  })
})

describe('FiveVarGrid — group overlay rectangles', () => {
  const noop = () => {}
  // jsdom has no layout, so cellSize is clamped to MIN_CELL_SIZE (40).
  // LABEL_WIDTH = 40, PLANE_LABEL_HEIGHT = 22, HEADER_HEIGHT = 40,
  // overlay pad = 2, and the E=0 plane is offset by LABEL_WIDTH.
  const CS = 40

  function renderWithGroups(minterms: number[]) {
    const kmap = createKMap(['A', 'B', 'C', 'D', 'E'])
    return render(
      <FiveVarGrid
        kmap={kmap}
        onCellClick={noop}
        onCellSelect={noop}
        onCellInfo={noop}
        selectedCells={new Set()}
        hoveredCell={null}
        onCellHover={noop}
        showMintermNumbers={true}
        showSOP={true}
        groupOverlays={[{ minterms, colorIndex: 0 }]}
      />,
    )
  }

  // Solid overlay fill rects = merged group blocks per plane (cells are keyed
  // by data-testid, border rects use fill="none").
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

  it('draws a left-right wrap group inside a plane as two merged bars', () => {
    // Plane E=0, rows 0-1, cols 0 and 3. Minterms follow the 5-var
    // convention (ab<<3 | cd<<1 | e): (0,0)->0, (0,3)->4, (1,0)->8, (1,3)->12.
    renderWithGroups([0, 4, 8, 12])
    expect(groupBlocks()).toEqual([
      { x: 38, y: 60, w: CS + 4, h: CS * 2 + 4 },
      { x: 158, y: 60, w: CS + 4, h: CS * 2 + 4 },
    ])
  })

  it('draws a top-bottom wrap group inside a plane as two merged bars', () => {
    // Plane E=0, rows 0 and 3, cols 0-1.
    // Minterms: (0,0)->0, (0,1)->2, (3,0)->16, (3,1)->18.
    renderWithGroups([0, 2, 16, 18])
    expect(groupBlocks()).toEqual([
      { x: 38, y: 60, w: CS * 2 + 4, h: CS + 4 },
      { x: 38, y: 180, w: CS * 2 + 4, h: CS + 4 },
    ])
  })

  it('renders a single merged rectangle for a non-wrapping group', () => {
    // Plane E=1, rows 1-2, cols 1-2 (mid-group). Minterms include E bit:
    // (1,1,E1) -> 11, (1,2,E1) -> 15, (2,1,E1) -> 27, (2,2,E1) -> 31.
    // E=1 plane offset = LABEL_WIDTH + planeWidth + PLANE_GAP = 40+160+24.
    renderWithGroups([11, 15, 27, 31])
    expect(groupBlocks()).toEqual([
      { x: 262, y: 100, w: CS * 2 + 4, h: CS * 2 + 4 },
    ])
  })
})