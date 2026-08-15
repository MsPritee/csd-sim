/**
 * Example circuits (Layer 2 — application). Pure TypeScript, no React.
 *
 * Loadable templates for the circuit designer, served through the *existing*
 * save/load machinery: each example is a plain, versioned `ProjectFile` that
 * `parseProjectJSON` accepts and `loadProject` opens, so examples reuse the
 * exact same validation/round-trip path as downloaded/imported projects.
 *
 * Schematics deliberately use the built-in compound blocks (adder, mux, demux,
 * subtractor, width-aware gates) so each template demonstrates real wiring
 * across libraries while staying small enough to inspect and poke.
 */

import { PROJECT_VERSION } from './persistence'
import type { ProjectFile } from './persistence'
import { addComponent } from '../../core/circuit/build'
import type { Component } from '../../core/circuit'

/** One loadable example template. */
export interface ExampleCircuit {
  /** Stable id (also the slug used in menu testids). */
  readonly id: string
  /** Human-readable menu label. */
  readonly name: string
  /** One-line description shown to the user. */
  readonly description: string
  /** A valid, versioned project ready for `loadProject`. */
  readonly project: ProjectFile
}

/** Build a single-circuit project file from components + [from, to] wire pairs. */
function projectWith(
  name: string,
  components: readonly Component[],
  wires: readonly (readonly [string, string])[],
): ProjectFile {
  return {
    app: 'csd-sim',
    version: PROJECT_VERSION,
    activeTabId: name,
    tabs: [
      {
        id: name,
        name,
        circuit: {
          components,
          wires: wires.map(([from, to], i) => ({ id: `w${i}`, from, to })),
        },
      },
    ],
  }
}

// ── Adder ───────────────────────────────────────────────────────────────
// A + B (8-bit) + Cin -> 8-bit Sum + Carry-out.
const adderProject: ProjectFile = projectWith(
  'Adder',
  [
    addComponent('a', 'input', { label: 'A', width: 8 }, 20, 20),
    addComponent('b', 'input', { label: 'B', width: 8 }, 20, 60),
    addComponent('cin', 'input', { label: 'Cin', width: 1 }, 20, 100),
    addComponent('add', 'adder', { width: 8 }, 200, 40),
    addComponent('sum', 'output', { label: 'Sum', width: 8 }, 400, 20),
    addComponent('cout', 'output', { label: 'Cout', width: 1 }, 400, 100),
  ],
  [
    ['a:out:0', 'add:in:0'],
    ['b:out:0', 'add:in:1'],
    ['cin:out:0', 'add:in:2'],
    ['add:out:0', 'sum:in:0'],
    ['add:out:1', 'cout:in:0'],
  ],
)

// ── MUX + DEMUX ─────────────────────────────────────────────────────────
// 2:1 mux routes D0/D1 by Sel, then a 1:2 demux steers the result back out
// onto the output selected by the same Sel (a round-trip data-router demo).
const muxDemuxProject: ProjectFile = projectWith(
  'MUX+DEMUX',
  [
    addComponent('d0', 'input', { label: 'D0', width: 1 }, 20, 20),
    addComponent('d1', 'input', { label: 'D1', width: 1 }, 20, 60),
    addComponent('sel', 'input', { label: 'Sel', width: 1 }, 20, 100),
    addComponent('m', 'mux', { width: 1, dataCount: 2 }, 200, 40),
    addComponent('dm', 'demux', { width: 1, dataCount: 2 }, 360, 40),
    addComponent('o0', 'output', { label: 'O0', width: 1 }, 540, 20),
    addComponent('o1', 'output', { label: 'O1', width: 1 }, 540, 60),
  ],
  [
    ['d0:out:0', 'm:in:0'],
    ['d1:out:0', 'm:in:1'],
    ['sel:out:0', 'm:in:2'],
    ['m:out:0', 'dm:in:0'],
    ['sel:out:0', 'dm:in:1'],
    ['dm:out:0', 'o0:in:0'],
    ['dm:out:1', 'o1:in:0'],
  ],
)

// ── ALU ─────────────────────────────────────────────────────────────────
// A and B feed an adder, a subtractor, an AND and an OR; a 2-bit Op selects
// which result appears on the 8-bit output via a 4:1 mux.
const aluProject: ProjectFile = projectWith(
  'ALU',
  [
    addComponent('a', 'input', { label: 'A', width: 8 }, 20, 20),
    addComponent('b', 'input', { label: 'B', width: 8 }, 20, 60),
    addComponent('op', 'input', { label: 'Op', width: 2 }, 20, 100),
    addComponent('add', 'adder', { width: 8 }, 200, 20),
    addComponent('sub', 'subtractor', { width: 8 }, 200, 80),
    addComponent('and', 'AND', { width: 8, inputs: 2 }, 200, 140),
    addComponent('or', 'OR', { width: 8, inputs: 2 }, 200, 200),
    addComponent('m', 'mux', { width: 8, dataCount: 4 }, 400, 100),
    addComponent('result', 'output', { label: 'Result', width: 8 }, 580, 100),
  ],
  [
    ['a:out:0', 'add:in:0'],
    ['b:out:0', 'add:in:1'],
    ['a:out:0', 'sub:in:0'],
    ['b:out:0', 'sub:in:1'],
    ['a:out:0', 'and:in:0'],
    ['b:out:0', 'and:in:1'],
    ['a:out:0', 'or:in:0'],
    ['b:out:0', 'or:in:1'],
    ['add:out:0', 'm:in:0'],
    ['sub:out:0', 'm:in:1'],
    ['and:out:0', 'm:in:2'],
    ['or:out:0', 'm:in:3'],
    ['op:out:0', 'm:in:4'],
    ['m:out:0', 'result:in:0'],
  ],
)

/** The built-in loadable example templates (stable order). */
export const EXAMPLE_CIRCUITS: readonly ExampleCircuit[] = [
  {
    id: 'adder',
    name: 'Adder',
    description: '8-bit adder with carry-in and carry-out.',
    project: adderProject,
  },
  {
    id: 'mux-demux',
    name: 'MUX + DEMUX',
    description: '2:1 multiplexer routed through a 1:2 demultiplexer.',
    project: muxDemuxProject,
  },
  {
    id: 'alu',
    name: 'ALU',
    description: 'Add / subtract / AND / OR selected by a 2-bit opcode.',
    project: aluProject,
  },
]

/** Find an example by its id (undefined for unknown ids). */
export function getExample(id: string): ExampleCircuit | undefined {
  return EXAMPLE_CIRCUITS.find((e) => e.id === id)
}
