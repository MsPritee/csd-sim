/**
 * Wiring-library evaluators (Layer 1 — core). Pure TypeScript, no React and no
 * stores. Phase 5 adds the Splitter (multi-bit bus fan-out / fan-in) and the
 * Pull Resistor (forces an undriven wire to a known level).
 *
 * Splitter port convention (matches the descriptor):
 *  - port 0 is the *stem*: `in:0` accepts the full-width bus, `out:0` emits the
 *    combined bus when arms are driven (fan-in).
 *  - ports 1..fanOut are the *arms*: `out:i` carries arm i's slice (fan-out),
 *    `in:i` accepts arm i's value for fan-in.
 *  - A splitter is bidirectional: whichever end is driven propagates to the
 *    other. Undriven arms contribute Unknown ('X') lanes when combining.
 */

import { netFromNumber, netFromBits, errorNet } from './value'
import type { BitState, NetValue } from './value'

/** Width of each splitter arm for a total `width` and `fanOut` arms. */
export function splitterArmWidths(width: number, fanOut: number): number[] {
  const n = Math.max(1, fanOut)
  const base = Math.floor(width / n)
  const extra = width % n
  const out: number[] = []
  for (let i = 0; i < n; i++) out.push(base + (i < extra ? 1 : 0))
  return out
}

/**
 * Compute every splitter output net from its inputs (stem + arms).
 * `ins[0]` is the stem, `ins[1..fanOut]` the arms.
 */
export function splitterNets(
  ins: readonly (NetValue | undefined)[],
  width: number,
  fanOut: number,
): NetValue[] {
  const armWidths = splitterArmWidths(width, fanOut)
  const stemIn = ins[0]

  // Fan-out: slice the stem across the arms.
  const armOuts: NetValue[] = armWidths.map((_w, i) => {
    if (stemIn === undefined) return undefined
    if (stemIn === 'E') return 'E'
    if (stemIn.width !== width) return 'E'
    const states = stemIn.states.slice(i === 0 ? 0 : armWidths.slice(0, i).reduce((a, b) => a + b, 0), 0 + armWidths.slice(0, i + 1).reduce((a, b) => a + b, 0))
    return states.length === 0 ? undefined : netFromBits(states)
  })

  // Fan-in: combine the arms back into the stem (undriven arms → 'X').
  const armsIn = ins.slice(1, 1 + armWidths.length)
  let stemOut: NetValue = undefined
  if (armsIn.some((a) => a !== undefined)) {
    const states: BitState[] = []
    let valid = true
    for (let i = 0; i < armWidths.length; i++) {
      const arm = armsIn[i]
      const w = armWidths[i]!
      if (arm === 'E') {
        valid = false
        break
      }
      if (arm === undefined) {
        for (let b = 0; b < w; b++) states.push('X')
        continue
      }
      if (arm.width !== w) {
        valid = false
        break
      }
      for (const s of arm.states) states.push(s)
    }
    stemOut = valid ? netFromBits(states) : errorNet()
  }

  return [stemOut, ...armOuts]
}

/**
 * Pull Resistor: output follows its input when the line is driven, otherwise it
 * forces the configured pull value (0 or 1) so undriven wires have a level.
 */
export function pullNet(inValue: NetValue | undefined, pull: 0 | 1): NetValue {
  if (inValue !== undefined) return inValue
  return netFromNumber(1, pull)
}
