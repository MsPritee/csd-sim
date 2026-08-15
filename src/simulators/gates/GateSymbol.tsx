import { motion } from 'framer-motion'
import type { Bit, GateType } from '../../core/gates/types'

/**
 * SVG gate symbol renderer (LG-05). Draws the ANSI-style shape for any gate,
 * with live input/output pins tinted by their bit value and an animated output
 * pin. Pure presentation: the bit math always comes from props.
 */

const W = 230
const H = 120
const IN_X = 18
const OUT_X = 207
const MID_Y = 60

/** Body outline for each gate. */
const BODY: Readonly<Record<GateType, string>> = {
  BUFFER: 'M 30 26 L 30 94 L 150 60 Z',
  NOT: 'M 30 26 L 30 94 L 150 60 Z',
  AND: 'M 40 28 L 118 28 Q 168 28 168 60 Q 168 92 118 92 L 40 92 Z',
  NAND: 'M 40 28 L 118 28 Q 168 28 168 60 Q 168 92 118 92 L 40 92 Z',
  OR: 'M 40 28 Q 88 28 114 60 Q 88 92 40 92 Q 150 92 172 60 Q 150 28 40 28 Z',
  NOR: 'M 40 28 Q 88 28 114 60 Q 88 92 40 92 Q 150 92 172 60 Q 150 28 40 28 Z',
  XOR: 'M 58 28 Q 106 28 132 60 Q 106 92 58 92 Q 168 92 190 60 Q 168 28 58 28 Z',
  XNOR: 'M 58 28 Q 106 28 132 60 Q 106 92 58 92 Q 168 92 190 60 Q 168 28 58 28 Z',
  CON_BUF: 'M 30 26 L 30 94 L 150 60 Z',
  CON_INV: 'M 30 26 L 30 94 L 150 60 Z',
  ODD_PARITY: 'M 40 28 L 150 28 L 150 92 L 40 92 Z',
  EVEN_PARITY: 'M 40 28 L 150 28 L 150 92 L 40 92 Z',
}

/** Where the output wire leaves the body, before any bubble. */
const RIGHT_WIRE_X: Readonly<Record<GateType, number>> = {
  BUFFER: 150,
  NOT: 150,
  AND: 168,
  NAND: 168,
  OR: 172,
  NOR: 172,
  XOR: 190,
  XNOR: 190,
  CON_BUF: 150,
  CON_INV: 150,
  ODD_PARITY: 150,
  EVEN_PARITY: 150,
}

/** XOR-family extra input-side arc. */
const XOR_ARC = 'M 34 28 Q 82 28 106 60 Q 82 92 34 92'

/** Gates whose output is drawn with an inversion bubble. */
const HAS_BUBBLE: ReadonlySet<GateType> = new Set(['NOT', 'NAND', 'NOR', 'XNOR', 'CON_INV'])
const HAS_XOR_ARC: ReadonlySet<GateType> = new Set(['XOR', 'XNOR'])

const UNARY: ReadonlySet<GateType> = new Set(['BUFFER', 'NOT'])

function bitColor(bit: Bit | null): string {
  if (bit === 1) return 'var(--accent-primary)'
  return 'var(--text-muted)'
}

export interface GateSymbolProps {
  readonly gate: GateType
  readonly inputs: readonly Bit[]
  readonly output: Bit
}

export default function GateSymbol({ gate, inputs, output }: GateSymbolProps) {
  const isUnary = UNARY.has(gate)
  const inputYs = isUnary ? [MID_Y] : [40, 80]
  const bodyLeftX = gate === 'XOR' || gate === 'XNOR' ? 58 : 40
  const hasBubble = HAS_BUBBLE.has(gate)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${gate} gate symbol`}
      data-testid={`gate-symbol-${gate.toLowerCase()}`}
      className="w-full max-h-56"
    >
      {/* wires */}
      {inputYs.map((y) => (
        <line
          key={`in-${y}`}
          x1={bodyLeftX}
          y1={y}
          x2={IN_X}
          y2={y}
          stroke="var(--border-light)"
          strokeWidth="2"
        />
      ))}
      {/* XOR-family extra arc */}
      {HAS_XOR_ARC.has(gate) && (
        <path d={XOR_ARC} fill="none" stroke="var(--border-light)" strokeWidth="2" />
      )}
      <line
        x1={RIGHT_WIRE_X[gate]}
        y1={MID_Y}
        x2={OUT_X}
        y2={MID_Y}
        stroke="var(--border-light)"
        strokeWidth="2"
      />
      {/* body */}
      <path
        d={BODY[gate]}
        fill="var(--bg-card)"
        stroke="var(--border-light)"
        strokeWidth="2.5"
      />
      {/* bubble */}
      {hasBubble && (
        <circle cx={192} cy={MID_Y} r={9} fill="var(--bg-card)" stroke="var(--border-light)" strokeWidth="2" />
      )}
      {/* input pins */}
      {inputYs.map((y, i) => (
        <motion.circle
          key={`pin-in-${i}`}
          cx={IN_X}
          cy={y}
          r={7}
          fill={bitColor(inputs[i] ?? null)}
          stroke="var(--border-color)"
        />
      ))}
      {/* output pin */}
      <motion.circle
        cx={OUT_X}
        cy={MID_Y}
        r={8}
        fill={bitColor(output)}
        stroke="var(--border-color)"
        animate={{ scale: output === 1 ? 1.12 : 1 }}
        transition={{ duration: 0.25, type: 'spring' }}
        data-testid="output-pin"
      />
    </svg>
  )
}