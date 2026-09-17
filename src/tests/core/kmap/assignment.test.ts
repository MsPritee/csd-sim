import { describe, it, expect } from 'vitest'
import {
  buildAssignment,
  cellToMinterm,
  createKMap,
  mintermToCell,
  type KMapModel,
} from '../../../core/kmap/model'
import { simplify } from '../../../core/kmap/simplify'

const VARS = ['A', 'B', 'C', 'D', 'E']

function permutations(vars: string[]): string[][] {
  if (vars.length <= 1) return [vars]
  const out: string[][] = []
  for (let i = 0; i < vars.length; i++) {
    for (const rest of permutations(vars.filter((_, j) => j !== i))) {
      out.push([vars[i]!, ...rest])
    }
  }
  return out
}

/**
 * Every assignment legal for `createKMap` + `buildAssignment`: all axis
 * topologies (optional plane of 1 variable, rows 1..2, columns 1..2, total 2..5)
 * crossed with every permutation of the variable ordering. The default 5-variable
 * flat layout (3 column variables) is intentionally excluded here — it is only
 * reachable through the default path and is covered separately.
 */
function allAssignments(variables: string[]): { name: string; model: KMapModel }[] {
  const out: { name: string; model: KMapModel }[] = []
  const topologies: { plane: number; row: number }[] = []
  for (let plane = 0; plane <= 1; plane++) {
    for (let row = 1; row <= 2; row++) {
      const col = variables.length - plane - row
      if (col < 1 || col > 2) continue
      topologies.push({ plane, row })
    }
  }
  for (const perm of permutations([...variables])) {
    for (const t of topologies) {
      const planeVars = t.plane ? perm.slice(0, 1) : []
      const rowVars = perm.slice(t.plane, t.plane + t.row)
      const colVars = perm.slice(t.plane + t.row)
      out.push({
        name: `plane ${planeVars.join('') || '—'}/row ${rowVars.join('')}/col ${colVars.join('')}`,
        model: createKMap(variables, buildAssignment(planeVars, rowVars, colVars)),
      })
    }
  }
  return out
}

function planesFromGrid(model: KMapModel) {
  const { planes, cols } = model.layout
  return { colSize: planes > 1 ? cols / planes : cols, planes }
}

describe('Phase 4 — cellToMinterm / mintermToCell round-trip for every legal assignment', () => {
  // Default layouts (the flat, backward-compatible path) round-trip too.
  it.each([2, 3, 4, 5] as const)('default %s-variable model inverts every minterm', (n) => {
    const model = createKMap(VARS.slice(0, n))
    const { colSize, planes } = planesFromGrid(model)
    const seen = new Set<number>()
    for (const rowCells of model.cells) {
      for (const cell of rowCells) {
        const plane = planes > 1 ? Math.floor(cell.col / colSize) : 0
        const col = cell.col % colSize
        expect(cellToMinterm(model, cell.row, col, plane)).toBe(cell.minterm)
        expect(mintermToCell(model, cell.minterm)).toEqual(
          planes > 1 ? { row: cell.row, col, plane } : { row: cell.row, col },
        )
        expect(mintermToCell(model, cellToMinterm(model, cell.row, col, plane))).toEqual(
          planes > 1 ? { row: cell.row, col, plane } : { row: cell.row, col },
        )
        seen.add(cell.minterm)
      }
    }
    expect(seen.size).toBe(2 ** n)
  })

  for (const n of [3, 4, 5] as const) {
    const variables = VARS.slice(0, n)
    const assignments = allAssignments(variables)
    it(`n=${n}: all ${assignments.length} assignment permutations invert every minterm`, () => {
      expect(assignments.length).toBeGreaterThan(0)
      for (const { name, model } of assignments) {
        const { colSize, planes } = planesFromGrid(model)
        const seen = new Set<number>()
        expect(model.cells.flat()).toHaveLength(2 ** n)
        for (const rowCells of model.cells) {
          for (const cell of rowCells) {
            const plane = planes > 1 ? Math.floor(cell.col / colSize) : 0
            const col = cell.col % colSize
            expect(cellToMinterm(model, cell.row, col, plane), name).toBe(cell.minterm)
            expect(mintermToCell(model, cell.minterm), name).toEqual(
              planes > 1 ? { row: cell.row, col, plane } : { row: cell.row, col },
            )
            expect(
              mintermToCell(model, cellToMinterm(model, cell.row, col, plane)),
              name,
            ).toEqual(planes > 1 ? { row: cell.row, col, plane } : { row: cell.row, col })
            seen.add(cell.minterm)
          }
        }
        // The cell->minterm map is a bijection onto [0, 2^n).
        expect(seen.size, name).toBe(2 ** n)
        expect(Math.min(...seen), name).toBe(0)
        expect(Math.max(...seen), name).toBe(2 ** n - 1)
      }
    })
  }
})

function planeLayouts(variables: string[]): { name: string; model: () => KMapModel }[] {
  return variables.map((pv) => {
    const rest = variables.filter((v) => v !== pv)
    const rowCount = Math.floor(rest.length / 2) || 1
    return {
      name: `plane ${pv}`,
      model: () =>
        createKMap(variables, buildAssignment([pv], rest.slice(0, rowCount), rest.slice(rowCount))),
    }
  })
}

function planify(result: ReturnType<typeof simplify>) {
  return {
    sop: result.sopGroups.map((g) => g.productText).slice().sort(),
    pos: result.posGroups.map((g) => g.sumText).slice().sort(),
  }
}

function runSimplify(model: KMapModel, on: number[], dontCares: number[] = []) {
  const ones = new Set(on)
  const dc = new Set(dontCares)
  const zeros = new Set(
    Array.from({ length: 32 }, (_, i) => i).filter((i) => !ones.has(i) && !dc.has(i)),
  )
  return simplify(model, ones, zeros, dc)
}

function assertCovers(result: ReturnType<typeof simplify>, on: number[]) {
  const covered = new Set(result.sopGroups.flatMap((g) => g.cells))
  for (const m of on) {
    expect(covered.has(m), `cover misses minterm m${m}`).toBe(true)
  }
}

describe('Phase 4 — canonical-minterm invariance (same Σm → same simplification under any layout)', () => {
  // The 5-variable flat *default* model folds E into the column axis (E = LSB), so
  // a prime whose constant set includes E cannot be drawn as a single rectangle
  // there — that is exactly (and only) the case where the stacked-plane layouts
  // differ. These fixtures avoid E-constant primes, so every layout must agree.
  const flat = [{ name: 'default (flat)', model: () => createKMap(VARS) }]
  const layouts = [...flat, ...planeLayouts(VARS)]

  const fixtures: { name: string; on: number[] }[] = [
    { name: "A'B'C' (m0..m7)", on: [0, 1, 2, 3, 4, 5, 6, 7] },
    { name: 'A (m16..m31)', on: Array.from({ length: 16 }, (_, i) => i + 16) },
    { name: 'B (bit3 set)', on: Array.from({ length: 16 }, (_, i) => i + 8) },
    { name: "A'B'C' + AB'C", on: [0, 1, 2, 3, 4, 5, 6, 7, 20, 21, 22, 23] },
  ]

  it.each(fixtures)('$name — identical normalized SOP/POS in every layout', ({ on }) => {
    const base = planify(runSimplify(createKMap(VARS), on))
    for (const layout of layouts) {
      const result = runSimplify(layout.model(), on)
      expect(planify(result), `${layout.name} vs ${base}`).toEqual(base)
      assertCovers(result, on)
    }
  })

  it('don\'t-cares extend the same covers in every layout', () => {
    // ones m0..m7 with don't-cares m8..m15: A' (= m0..m15) becomes a fully
    // eligible cube, so the minimal cover is A' everywhere.
    const on = [0, 1, 2, 3, 4, 5, 6, 7]
    const dc = Array.from({ length: 8 }, (_, i) => i + 8)
    const base = planify(runSimplify(createKMap(VARS), on, dc))
    expect(base.sop).toEqual(["A'"])
    for (const layout of layouts) {
      const result = runSimplify(layout.model(), on, dc)
      expect(planify(result), layout.name).toEqual(base)
      assertCovers(result, on)
    }
  })

  // Floor/ceiling: the flat default folds D and E into the 3-variable column
  // axis, where a prime whose constant set includes D or E cannot be drawn as a
  // single rectangle — that is the exact class of primes the stacked-plane
  // layouts exist to expose (E' = the whole E=0 plane, D' crosses the fold.
  // Every plane layout must agree on the true minimal cover; the flat default
  // keeps its legacy (valid, sub-optimal) cover.
  const boundaryFixtures: { name: string; on: number[]; minimal: string[] }[] = [
    { name: "E' (even minterms)", on: Array.from({ length: 16 }, (_, i) => i * 2), minimal: ["E'"] },
    { name: 'D (bit1 set)', on: Array.from({ length: 32 }, (_, i) => i).filter((i) => (i & 2) !== 0), minimal: ['D'] },
  ]

  it.each(boundaryFixtures)('$name — all plane layouts agree on the minimal cover', ({ on, minimal }) => {
    const results = planeLayouts(VARS).map((layout) => ({
      name: layout.name,
      result: runSimplify(layout.model(), on),
    }))
    const first = results[0]!.result
    expect(planify(first).sop).toEqual(minimal)
    for (const { name, result } of results) {
      expect(planify(result), name).toEqual(planify(first))
      assertCovers(result, on)
    }
    // The legacy flat cover stays valid.
    assertCovers(runSimplify(createKMap(VARS), on), on)
  })

  it('E\' legacy flat cover is unchanged (two sub-groups)', () => {
    const on = Array.from({ length: 16 }, (_, i) => i * 2)
    const legacy = runSimplify(createKMap(VARS), on)
    expect(planify(legacy).sop).toEqual(["D'E'", "DE'"])
    assertCovers(legacy, on)
  })

  it('4-variable plane assignments agree with the default layout', () => {
    const vars = ['A', 'B', 'C', 'D']
    const layouts = [
      { name: 'default', model: () => createKMap(vars) },
      ...planeLayouts(vars),
    ]
    const fixtures: { name: string; on: number[] }[] = [
      { name: "A'B' + CD", on: [0, 1, 2, 3, 7, 11, 15] },
      { name: "B' (bits 00/10 rows)", on: [0, 1, 2, 3, 8, 9, 10, 11] },
    ]
    for (const fixture of fixtures) {
      const base = planify(runSimplify(createKMap(vars), fixture.on))
      const result = planify(runSimplify(layouts.find((l) => l.name === 'default')!.model(), fixture.on))
      expect(result).toEqual(base)
      for (const layout of layouts.slice(1)) {
        const got = runSimplify(layout.model(), fixture.on)
        expect(planify(got), `${fixture.name}: ${layout.name}`).toEqual(base)
        assertCovers(got, fixture.on)
      }
    }
  })

  it('3-variable plane assignments agree with the default layout', () => {
    const vars = ['A', 'B', 'C']
    const on = [0, 1, 2, 3] // A'
    const base = planify(runSimplify(createKMap(vars), on))
    for (const layout of planeLayouts(vars)) {
      const got = runSimplify(layout.model(), on)
      expect(planify(got), layout.name).toEqual(base)
      assertCovers(got, on)
    }
  })
})