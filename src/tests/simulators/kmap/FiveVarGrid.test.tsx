import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FiveVarGrid from '../../../simulators/kmap/components/FiveVarGrid'
import { createKMap, withValue, buildAssignment, cellToMinterm, mintermToCell, translateMinterm } from '../../../core/kmap'

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

  it('uses plane-first display numbering for plane cell labels', () => {
    renderGrid()
    // The display is numbered with the plane variable as the MSB, so the two
    // planes sit side by side as 0..15 and 16..31: the matching slot across
    // the gap differs only in the plane bit (1<<4 = 16).
    expect(screen.getByTestId('kmap-cell-0')).toBeTruthy()
    expect(screen.getByTestId('kmap-cell-16')).toBeTruthy()
    // (plane row 1, col 0): AB=01, CD=00, E=0 -> display 4; E=1 -> display 20.
    expect(screen.getByTestId('kmap-cell-4')).toBeTruthy()
    expect(screen.getByTestId('kmap-cell-20')).toBeTruthy()
    // (plane row 0, col 3): AB=00, CD=10, E=0 -> display 2.
    expect(screen.getByTestId('kmap-cell-2')).toBeTruthy()
  })

  it('displays the correct value in the cell for a given minterm', () => {
    const kmap = withValue(createKMap(['A', 'B', 'C', 'D', 'E']), 2, 1)
    renderGrid(kmap)
    // Model minterm 2 (D only) is shown plane-first as display cell 1.
    const cell = screen.getByTestId('kmap-cell-1').closest('g')!
    expect(cell.textContent).toContain('1')
  })

  it('reports the base model minterm when a plane cell is clicked', () => {
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
    // Display cell 16 sits in the E=1 plane at slot (row 0, col 0); its base
    // model minterm is 1 (E only), so clicks report the canonical minterm.
    fireEvent.click(screen.getByTestId('kmap-cell-16'))
    expect(onCellClick).toHaveBeenCalledWith(1)
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

describe('FiveVarGrid — custom plane layouts', () => {
  const noop = () => {}

  it('renders two planes labelled with the configured plane variable', () => {
    const kmap = createKMap(['A', 'B', 'C', 'D', 'E'], buildAssignment(['C'], ['A', 'B'], ['D', 'E']))
    render(
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
    expect(screen.getByText('C = 0')).toBeTruthy()
    expect(screen.getByText('C = 1')).toBeTruthy()
    expect(document.querySelectorAll('[data-testid^="kmap-cell-"]')).toHaveLength(32)
    // Variable headers follow the model axes: rows = A,B and cols = D,E.
    expect(screen.getAllByText('AB').length).toBeGreaterThan(0)
    expect(screen.getAllByText('DE').length).toBeGreaterThan(0)
  })

  it('places values at the correct plane for a custom plane variable', () => {
    // Plane C, rows AB, cols DE. Model minterm 19 = 10011 (A=1,B=0,C=0,D=1,E=1).
    // The plane-first view promotes C to the MSB, so it displays as
    // 11 = C=0, A=1, B=0, D=1, E=1 and must NOT be found with C=1 semantics.
    let kmap = createKMap(['A', 'B', 'C', 'D', 'E'], buildAssignment(['C'], ['A', 'B'], ['D', 'E']))
    kmap = withValue(kmap, 19, 1)
    render(
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
    const cell = screen.getByTestId('kmap-cell-11').closest('g')!
    expect(cell.textContent).toContain('1')
    // Groups filtered by the configured plane bit land in the right plane.
    expect(screen.getByTestId('kmap-cell-11')).toBeTruthy()
  })

  it('keeps the minterm mapping stable when rows and columns are swapped', () => {
    const kmap = createKMap(['A', 'B', 'C', 'D', 'E'], buildAssignment(['C'], ['D', 'E'], ['A', 'B']))
    render(
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
    expect(screen.getByText('C = 0')).toBeTruthy()
    expect(screen.getByText('C = 1')).toBeTruthy()
    expect(screen.getAllByText('DE').length).toBeGreaterThan(0)
    expect(screen.getAllByText('AB').length).toBeGreaterThan(0)
    // The plane-first display number for model minterm 19 is the same (11)
    // regardless of the row/column split.
    expect(screen.getByTestId('kmap-cell-11')).toBeTruthy()
  })

  it('reports the base model minterm when a custom-layout cell is clicked', () => {
    const onCellClick = vi.fn()
    render(
      <FiveVarGrid
        kmap={createKMap(['A', 'B', 'C', 'D', 'E'], buildAssignment(['C'], ['D', 'E'], ['A', 'B']))}
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
    // Display cell 19 = 10011 with C as MSB (C=1,A=0,B=0,D=1,E=1); translated
    // back into the canonical ordering that value is model minterm 7.
    const base = translateMinterm(19, ['C', 'A', 'B', 'D', 'E'], ['A', 'B', 'C', 'D', 'E'])
    fireEvent.click(screen.getByTestId('kmap-cell-19'))
    expect(onCellClick).toHaveBeenCalledWith(base)
  })
})

describe('FiveVarGrid — overlay wrap rectangles under custom plane assignments', () => {
  const noop = () => {}
  const CS = 40

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

  function renderWithGroups(kmap: ReturnType<typeof createKMap>, minterms: number[]) {
    render(
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

  it('draws a left-right wrap group as merged bars inside the correct plane (plane variable C)', () => {
    // Plane C, rows AB, cols DE (C is bit2, NOT bit0). The wrap group sits in
    // the C=0 plane at rows 0-1, cols 0 and 3 -> minterms 0, 2, 8, 10.
    const kmap = createKMap(['A', 'B', 'C', 'D', 'E'], buildAssignment(['C'], ['A', 'B'], ['D', 'E']))
    renderWithGroups(kmap, [0, 2, 8, 10])
    expect(groupBlocks()).toEqual([
      { x: 38, y: 60, w: CS + 4, h: CS * 2 + 4 },
      { x: 158, y: 60, w: CS + 4, h: CS * 2 + 4 },
    ])
  })

  it('filters overlays by the real plane bit, not the LSB (C=1 minterms ignored by C=0 plane)', () => {
    // Same positions, but split across both planes: C=0 -> 0,2,8,10 and
    // C=1 -> 4,6,12,14 (the C bit is 1<<2). Each plane must render its own
    // wrap bars; the merged blocks must line up with each plane's offset.
    const kmap = createKMap(['A', 'B', 'C', 'D', 'E'], buildAssignment(['C'], ['A', 'B'], ['D', 'E']))
    renderWithGroups(kmap, [0, 2, 8, 10, 4, 6, 12, 14])
    expect(groupBlocks()).toEqual([
      { x: 38, y: 60, w: CS + 4, h: CS * 2 + 4 },
      { x: 158, y: 60, w: CS + 4, h: CS * 2 + 4 },
      { x: 222, y: 60, w: CS + 4, h: CS * 2 + 4 },
      { x: 342, y: 60, w: CS + 4, h: CS * 2 + 4 },
    ])
  })

  it('renders a single merged rectangle for a non-wrapping C=1 group', () => {
    const kmap = createKMap(['A', 'B', 'C', 'D', 'E'], buildAssignment(['C'], ['A', 'B'], ['D', 'E']))
    // C=1, rows 1-2, cols 1-2: (1,1)=13, (1,2)=15, (2,1)=29, (2,2)=31.
    renderWithGroups(kmap, [13, 15, 29, 31])
    expect(groupBlocks()).toEqual([
      { x: 262, y: 100, w: CS * 2 + 4, h: CS * 2 + 4 },
    ])
  })
})

describe('FiveVarGrid — plane labels and cell numbers for every plane variable', () => {
  const noop = () => {}
  // jsdom has no layout -> cellSize clamps to MIN_CELL_SIZE (40).
  // LABEL_WIDTH = 40, PLANE_LABEL_HEIGHT = 22, HEADER_HEIGHT = 40, PLANE_GAP = 24.
  const CS = 40
  const OFFSET0 = 40
  const OFFSET1 = 40 + 4 * CS + 24 // planeWidth + gap
  const Y_BASE = 22 + 40

  const PLANE_VARS = ['A', 'B', 'C', 'D', 'E']

  // The display reorders variables so the plane variable is the MSB. This is
  // the exact render model the grid is built from.
  function displayModel(pv: string) {
    const rest = ['A', 'B', 'C', 'D', 'E'].filter((v) => v !== pv)
    return createKMap([pv, ...rest], buildAssignment([pv], rest.slice(0, 2), rest.slice(2)))
  }

  it('renders `<planeVar> = 0/1` labels, row/col variable headers, and every cell at its axis position', () => {
    for (const pv of PLANE_VARS) {
      const { unmount } = render(
        <FiveVarGrid
          kmap={displayModel(pv)}
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

      const rest = ['A', 'B', 'C', 'D', 'E'].filter((v) => v !== pv)
      expect(screen.getAllByText(`${pv} = 0`)).toHaveLength(1)
      expect(screen.getAllByText(`${pv} = 1`)).toHaveLength(1)
      // Axis variable pairs are rendered once per plane.
      expect(screen.getAllByText(rest.slice(0, 2).join(''))).toHaveLength(2)
      expect(screen.getAllByText(rest.slice(2).join(''))).toHaveLength(2)
      expect(document.querySelectorAll('[data-testid^="kmap-cell-"]')).toHaveLength(32)

      // The displayed cell numbers are plane-first: mintermToCell on the
      // display model gives the on-screen slot for every shown number.
      const model = displayModel(pv)
      for (let m = 0; m < 32; m++) {
        const { row, col, plane } = mintermToCell(model, m)
        const el = screen.getByTestId(`kmap-cell-${m}`)
        const offset = plane === 1 ? OFFSET1 : OFFSET0
        expect(Number(el.getAttribute('x')), `display m${m} @ ${pv}`).toBe(offset + col * CS)
        expect(Number(el.getAttribute('y')), `display m${m} @ ${pv}`).toBe(Y_BASE + row * CS)
      }
      unmount()
    }
  }, 60000)

  it('cell below and above the gap differ only in the plane variable bit', () => {
    for (const pv of PLANE_VARS) {
      const model = displayModel(pv)
      // Plane-first numbering promotes the plane variable to the MSB, so the
      // two planes always differ by exactly 1<<4 = 16 (planes 0..15 / 16..31).
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const m0 = cellToMinterm(model, r, c, 0)
          const m1 = cellToMinterm(model, r, c, 1)
          expect(m0 ^ m1, `${pv} (r${r}, c${c})`).toBe(1 << 4)
        }
      }
    }
  })
})

describe('FiveVarGrid — wrap-around group overlays per plane variable', () => {
  const noop = () => {}
  const CS = 40
  const OFFSET1 = 40 + 4 * CS + 24

  const PLANE_VARS = ['A', 'B', 'C', 'D', 'E']

  function planeModel(pv: string) {
    const rest = ['A', 'B', 'C', 'D', 'E'].filter((v) => v !== pv)
    return createKMap(['A', 'B', 'C', 'D', 'E'], buildAssignment([pv], rest.slice(0, 2), rest.slice(2)))
  }

  function wrapMinterms(model: ReturnType<typeof createKMap>, plane: 0 | 1): number[] {
    const out: number[] = []
    for (let r = 0; r < 4; r++) {
      out.push(cellToMinterm(model, r, 0, plane), cellToMinterm(model, r, 3, plane))
    }
    return out
  }

  function renderWithGroups(kmap: ReturnType<typeof createKMap>, minterms: number[]) {
    render(
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

  it.each(PLANE_VARS)(
    'plane variable $pv: left-right wrap renders two merged bars at the plane-0 offset',
    (pv) => {
      const model = planeModel(pv)
      renderWithGroups(model, wrapMinterms(model, 0))
      expect(groupBlocks()).toEqual([
        { x: 38, y: 60, w: CS + 4, h: CS * 4 + 4 },
        { x: 158, y: 60, w: CS + 4, h: CS * 4 + 4 },
      ])
    },
  )

  it.each(PLANE_VARS)(
    'plane variable $pv: cross-plane wrap filters by the plane bit and draws bars in both planes',
    (pv) => {
      const model = planeModel(pv)
      renderWithGroups(model, [...wrapMinterms(model, 0), ...wrapMinterms(model, 1)])
      expect(groupBlocks()).toEqual([
        { x: 38, y: 60, w: CS + 4, h: CS * 4 + 4 },
        { x: 158, y: 60, w: CS + 4, h: CS * 4 + 4 },
        { x: OFFSET1 - 2, y: 60, w: CS + 4, h: CS * 4 + 4 },
        { x: OFFSET1 + 3 * CS - 2, y: 60, w: CS + 4, h: CS * 4 + 4 },
      ])
    },
  )
})

describe('FiveVarGrid — selection and hover translate base minterms to the plane-first display', () => {
  const noop = () => {}

  it('highlights the display cell for a selected base minterm (plane C)', () => {
    // Model minterm 19 = 10011 (A=1,B=0,C=0,D=1,E=1) displays plane-first as 11.
    const kmap = createKMap(['A', 'B', 'C', 'D', 'E'], buildAssignment(['C'], ['A', 'B'], ['D', 'E']))
    render(
      <FiveVarGrid
        kmap={kmap}
        onCellClick={noop}
        onCellSelect={noop}
        onCellInfo={noop}
        selectedCells={new Set([19])}
        hoveredCell={null}
        onCellHover={noop}
        showMintermNumbers={true}
        showSOP={true}
      />,
    )
    const selected = screen.getByTestId('kmap-cell-11')
    expect(selected.getAttribute('class')).toContain('kmap-cell-selected')
  })

  it('reports the hovered base minterm when a display cell is hovered', () => {
    const onCellHover = vi.fn()
    const kmap = createKMap(['A', 'B', 'C', 'D', 'E'], buildAssignment(['C'], ['A', 'B'], ['D', 'E']))
    render(
      <FiveVarGrid
        kmap={kmap}
        onCellClick={noop}
        onCellSelect={noop}
        onCellInfo={noop}
        selectedCells={new Set()}
        hoveredCell={null}
        onCellHover={onCellHover}
        showMintermNumbers={false}
        showSOP={true}
      />,
    )
    // Display cell 11 lives in the C=0 plane; its base minterm is 19.
    fireEvent.mouseEnter(screen.getByTestId('kmap-cell-11'))
    expect(onCellHover).toHaveBeenCalledWith(19)
    fireEvent.mouseLeave(screen.getByTestId('kmap-cell-11'))
    expect(onCellHover).toHaveBeenCalledWith(null)
  })

  it('marks the base-hovered display cell with the hover stroke', () => {
    const kmap = createKMap(['A', 'B', 'C', 'D', 'E'], buildAssignment(['C'], ['A', 'B'], ['D', 'E']))
    render(
      <FiveVarGrid
        kmap={kmap}
        onCellClick={noop}
        onCellSelect={noop}
        onCellInfo={noop}
        selectedCells={new Set()}
        hoveredCell={19}
        onCellHover={noop}
        showMintermNumbers={true}
        showSOP={true}
      />,
    )
    expect(screen.getByTestId('kmap-cell-11').getAttribute('class')).toContain('stroke-2')
  })

  it('draws a cross-plane adjacency line when both matched base cells are selected', () => {
    const kmap = createKMap(['A', 'B', 'C', 'D', 'E'], buildAssignment(['C'], ['A', 'B'], ['D', 'E']))
    render(
      <FiveVarGrid
        kmap={kmap}
        onCellClick={noop}
        onCellSelect={noop}
        onCellInfo={noop}
        selectedCells={new Set([11, 15])}
        hoveredCell={null}
        onCellHover={noop}
        showMintermNumbers={true}
        showSOP={true}
      />,
    )
    // Base 11 (01011) and base 15 (01111) occupy the SAME row/col slot and
    // differ only in the plane variable C, so both halves of the matched pair
    // are selected and a dashed cross-plane line must appear between the planes.
    const dash = Array.from(document.querySelectorAll<SVGLineElement>('line')).find(
      (el) => el.getAttribute('stroke-dasharray') === '4 3',
    )
    expect(dash).toBeTruthy()
  })

  it('skips the cross-plane line when only one side of the matched pair is selected', () => {
    const kmap = createKMap(['A', 'B', 'C', 'D', 'E'], buildAssignment(['C'], ['A', 'B'], ['D', 'E']))
    render(
      <FiveVarGrid
        kmap={kmap}
        onCellClick={noop}
        onCellSelect={noop}
        onCellInfo={noop}
        selectedCells={new Set([11])}
        hoveredCell={null}
        onCellHover={noop}
        showMintermNumbers={true}
        showSOP={true}
      />,
    )
    const dash = Array.from(document.querySelectorAll<SVGLineElement>('line')).find(
      (el) => el.getAttribute('stroke-dasharray') === '4 3',
    )
    expect(dash).toBeUndefined()
  })
})