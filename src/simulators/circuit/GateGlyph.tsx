import { pinText, centerRow, COMP_W, COMP_H, labelPosition, inputPinPortLocal, INPUT_PIN_SQUARE, pinLabelPosition } from './layout'
import type { LabelLocation, LabelTextStyle, PinFacing, PinLabelLocation } from './layout'
import type { GateType } from '../../core/gates/types'
import { bitValue } from '../../core/circuit'
import type { NetValue } from '../../core/circuit'

/** Vertical gap between adjacent pin rows. */
export const PIN_GAP = 30

function valueColor(value: NetValue | undefined): string {
  const bit = bitValue(value)
  if (bit === 1) return 'var(--accent-primary)'
  if (bit === 'E') return '#f87171'
  if (bit === undefined || bit === 'X') return 'var(--text-muted)'
  return 'var(--success-bg)'
}

/** Local x of the input/output pin columns (mirrors layout.ts). */
const IN_X = 8
const OUT_X = 132
const OUT_ROW = 50

/**
 * Logisim exact gate geometry constants.
 * Body width ranges from 48-90px inside the 140px box.
 */
const BASE_BODY_WIDTH = 70
const BASE_BODY_HEIGHT = 66
const OUTPUT_TIP_X = 104

/**
 * Compute shield wings for gates where inputs make the body taller than wide.
 * wingHeight = (height - width) / 2
 * dx = min(20, wingHeight / 4)
 */
function computeShield(bodyWidth: number, bodyHeight: number): { wingHeight: number; dx: number } {
  const wingHeight = Math.max(0, (bodyHeight - bodyWidth) / 2)
  const dx = Math.min(20, wingHeight / 4)
  return { wingHeight, dx }
}

/**
 * Logisim AND gate: flat left edge + half-circle arc centered at -width/2,
 * tip lands exactly on the output pin.
 */
function andPath(bodyWidth: number, bodyHeight: number): string {
  const halfHeight = bodyHeight / 2
  const left = OUTPUT_TIP_X - bodyWidth
  const top = OUT_ROW - halfHeight
  const bottom = OUT_ROW + halfHeight
  const arcCenterX = OUTPUT_TIP_X - bodyWidth / 2
  
  return `M ${left} ${top} L ${arcCenterX} ${top} ` +
         `A ${bodyWidth / 2} ${halfHeight} 0 0 1 ${OUTPUT_TIP_X} ${OUT_ROW} ` +
         `A ${bodyWidth / 2} ${halfHeight} 0 0 1 ${arcCenterX} ${bottom} ` +
         `L ${left} ${bottom} Z`
}

/**
 * Logisim OR gate PATH_WIDE bell with exact quadTo coordinates:
 * moveTo(0,0) quadTo(-25,-35,-70,-35) quadTo(-50,0,-70,35) quadTo(-25,35,0,0)
 * (concave left edge, convex bulge)
 */
function orPath(bodyWidth: number, bodyHeight: number): string {
  const tip = OUTPUT_TIP_X
  const width = bodyWidth
  const halfHeight = bodyHeight / 2
  const top = OUT_ROW - halfHeight
  const bottom = OUT_ROW + halfHeight
  const left = tip - width
  
  // Logisim PATH_WIDE proportions: quadTo control points at 25/50/70 ratios
  const c1x = tip - (25 / 70) * width
  const c2x = tip - (50 / 70) * width
  
  return `M ${tip} ${OUT_ROW} Q ${c1x} ${top} ${left} ${top} ` +
         `Q ${c2x} ${OUT_ROW} ${left} ${bottom} ` +
         `Q ${c1x} ${bottom} ${tip} ${OUT_ROW} Z`
}

/**
 * Logisim XOR gate: OR curve + paintShield offset -10 for double-curve.
 * The signature double-curve on the left.
 */
function xorPath(bodyWidth: number, bodyHeight: number): { path: string; accent: string } {
  const tip = OUTPUT_TIP_X
  const width = bodyWidth
  const halfHeight = bodyHeight / 2
  const top = OUT_ROW - halfHeight
  const bottom = OUT_ROW + halfHeight
  const left = tip - width
  
  const c1x = tip - (25 / 70) * width
  const c2x = tip - (50 / 70) * width
  
  const path = `M ${tip} ${OUT_ROW} Q ${c1x} ${top} ${left} ${top} ` +
               `Q ${c2x} ${OUT_ROW} ${left} ${bottom} ` +
               `Q ${c1x} ${bottom} ${tip} ${OUT_ROW} Z`
  
  // paintShield offset -10 creates the double-curve accent
  const accent = `M ${left - 10} ${top} Q ${c2x - 10} ${OUT_ROW} ${left - 10} ${bottom}`
  
  return { path, accent }
}

/** Compact triangle used by BUFFER / controlled gates. */
const TRI_BASE = 54
const TRI_TIP = 98
const TRI_HALF = 16

/** Where the controlled-gate enable line turns up into the triangle. */
const EN_X = 60
const EN_Y = 60

interface GateShape {
  /** x of the body's input face (stubs terminate here). */
  readonly left: number
  /** x of the body's output apex. */
  readonly tip: number
  /** SVG path of the filled silhouette. */
  readonly path: string
  /** Extra stroke-only curve (XOR's doubled left edge). */
  readonly accent?: string
  /** Body width for scaling calculations. */
  readonly bodyWidth: number
  /** Body height for scaling calculations. */
  readonly bodyHeight: number
  /** Input stub lengths (distance from IN_X to body edge). */
  readonly inputLengths: readonly number[]
  /** Whether gate has negation bubble. */
  readonly hasBubble: boolean
}

/** Per-gate body geometry using Logisim exact path data. */
function shaped(gate: GateType, inputCount: number): GateShape {
  // Calculate body dimensions based on input count
  const inputSpan = inputCount > 1 ? (inputCount - 1) * 24 : 0
  const bodyHeight = Math.max(BASE_BODY_HEIGHT, 10 + inputSpan)
  const bodyWidth = Math.min(90, Math.max(48, BASE_BODY_WIDTH))
  
  const left = OUTPUT_TIP_X - bodyWidth
  const shield = computeShield(bodyWidth, bodyHeight)
  
  // Calculate input stub lengths based on shield
  const inputLengths = Array.from({ length: inputCount }, (_, i) => {
    const y = centerRow(i, inputCount)
    const distFromCenter = Math.abs(y - OUT_ROW)
    // Stubs extend to shield edge when body is taller than wide
    if (shield.wingHeight > 0 && distFromCenter > bodyHeight / 2 - shield.dx) {
      return left - IN_X + shield.dx
    }
    return left - IN_X
  })
  
if (gate === 'AND' || gate === 'NAND') {
    return {
      left,
      tip: OUTPUT_TIP_X,
      path: andPath(bodyWidth, bodyHeight),
      bodyWidth,
      bodyHeight,
      inputLengths,
      hasBubble: gate === 'NAND',
    }
  }

  if (gate === 'OR' || gate === 'NOR') {
    return {
      left,
      tip: OUTPUT_TIP_X,
      path: orPath(bodyWidth, bodyHeight),
      bodyWidth,
      bodyHeight,
      inputLengths,
      hasBubble: gate === 'NOR',
    }
  }

  if (gate === 'XOR' || gate === 'XNOR') {
    const { path, accent } = xorPath(bodyWidth, bodyHeight)
    return {
      left: left - 10,
      tip: OUTPUT_TIP_X,
      accent,
      path,
      bodyWidth,
      bodyHeight,
      inputLengths: inputLengths.map(l => l + 10),
      hasBubble: gate === 'XNOR',
    }
  }

  if (gate === 'ODD_PARITY' || gate === 'EVEN_PARITY') {
    return {
      left,
      tip: OUTPUT_TIP_X,
      path: `M ${left} 12 L ${OUTPUT_TIP_X} 12 L ${OUTPUT_TIP_X} 88 L ${left} 88 Z`,
      bodyWidth,
      bodyHeight,
      inputLengths,
      hasBubble: false,
    }
  }

  // BUFFER, NOT, CON_BUF, CON_INV: compact Logisim triangle
  return {
    left: TRI_BASE,
    tip: TRI_TIP,
    path: `M ${TRI_TIP} ${OUT_ROW} L ${TRI_BASE} ${OUT_ROW - TRI_HALF} L ${TRI_BASE} ${OUT_ROW + TRI_HALF} Z`,
    bodyWidth: TRI_TIP - TRI_BASE,
    bodyHeight: TRI_HALF * 2,
    inputLengths: Array.from({ length: inputCount }, () => TRI_BASE - IN_X),
    hasBubble: gate === 'NOT' || gate === 'CON_INV',
  }
}

/** Pin y-positions aligned with the engine's port rows (single source of truth). */
function pinRows(count: number): number[] {
  return Array.from({ length: count }, (_, i) => centerRow(i, count))
}

/**
 * Tight bounding box of the drawn gate body (including the negation bubble, if
 * any). Used for the selection corner brackets so they hug the gate instead of
 * the full 140×100 component box.
 */
export function gateBodyBounds(gate: GateType, inputCount: number): { x: number; y: number; width: number; height: number } {
  const shape = shaped(gate, inputCount)
  let y: number
  let height: number
  if (gate === 'ODD_PARITY' || gate === 'EVEN_PARITY') {
    y = 12
    height = 76
  } else if (gate === 'BUFFER' || gate === 'NOT' || gate === 'CON_BUF' || gate === 'CON_INV') {
    y = OUT_ROW - TRI_HALF
    height = TRI_HALF * 2
  } else {
    y = OUT_ROW - shape.bodyHeight / 2
    height = shape.bodyHeight
  }
  const bubbleR = gate === 'NOT' || gate === 'CON_INV' ? 6 : 7
  const right = shape.hasBubble ? shape.tip + bubbleR * 2 : shape.tip
  return { x: shape.left, y, width: right - shape.left, height }
}

/** Check if a gate has negation dongles on specific inputs. */
function hasNegationDongle(_gate: GateType, _inputIndex: number): boolean {
  // Currently no gates have input-side negation dongles in this implementation
  // This function is reserved for future expansion (e.g., NAND with input negation)
  return false
}

interface GateGlyphProps {
  readonly gate: GateType
  readonly inputs: readonly (NetValue | undefined)[]
  readonly output: NetValue | undefined
  readonly label?: string
  readonly labelLocation?: LabelLocation
  readonly labelStyle?: LabelTextStyle
  readonly borderColor?: string
}

/** Single Logisim-shaped gate drawn to the canvas coordinate system (no box). */
export function GateGlyph({ gate, inputs, output, label, labelLocation, labelStyle, borderColor }: GateGlyphProps) {
  const shape = shaped(gate, inputs.length)
  const ys = pinRows(inputs.length)
  const isInverter = gate === 'NOT' || gate === 'CON_INV'
  const bubbleR = isInverter ? 6 : 7
  const hasBubble = shape.hasBubble
  const bubbleX = shape.tip + bubbleR
  const outStart = hasBubble ? bubbleX + bubbleR : shape.tip
  const isControlled = gate === 'CON_BUF' || gate === 'CON_INV'
  const outline = borderColor || 'var(--border-light)'
  const labelTextStyle = labelStyle ?? { fontSize: 11, fill: 'var(--text-secondary)', fontWeight: 400, fontStyle: 'normal' as const, textDecoration: 'none' as const, fontFamily: undefined }
  const labelAnchor = labelPosition(labelLocation ?? 'bottom', COMP_W, COMP_H)

  return (
    <g>
      {isControlled && ys.length >= 2 ? (
        <>
          <line x1={IN_X} y1={ys[0]} x2={TRI_BASE} y2={ys[0]} stroke={valueColor(inputs[0])} strokeWidth="3" />
          <polyline
            points={`${IN_X},${ys[1]} ${EN_X},${ys[1]} ${EN_X},${EN_Y}`}
            fill="none"
            stroke={valueColor(inputs[1])}
            strokeWidth="3"
          />
        </>
      ) : (
        ys.map((y, i) => {
          const stubLength = shape.inputLengths[i] ?? (shape.left - IN_X)
          const stubEndX = IN_X + stubLength
          return (
            <line
              key={`stub-${i}`}
              x1={IN_X}
              y1={y}
              x2={stubEndX}
              y2={y}
              stroke={valueColor(inputs[i])}
              strokeWidth="3"
            />
          )
        })
      )}
      {/* Negation dongles at lengths[i]+5 */}
      {ys.map((y, i) => {
        if (hasNegationDongle(gate, i)) {
          const stubLength = shape.inputLengths[i] ?? (shape.left - IN_X)
          const dongleX = IN_X + stubLength + 5
          return (
            <circle
              key={`dongle-${i}`}
              cx={dongleX}
              cy={y}
              r={4}
              fill="var(--bg-card)"
              stroke="var(--border-light)"
              strokeWidth="2"
            />
          )
        }
        return null
      })}
      {shape.accent && (
        <path d={shape.accent} fill="none" stroke={outline} strokeWidth="2.5" />
      )}
      <path
        d={shape.path}
        fill="var(--bg-card)"
        stroke={outline}
        strokeWidth="2.5"
        data-testid="gate-body"
      />
      {label && (
        <text
          x={labelAnchor.x}
          y={labelAnchor.y}
          textAnchor={labelAnchor.anchor}
          fontSize={labelTextStyle.fontSize}
          fill={labelTextStyle.fill}
          fontWeight={labelTextStyle.fontWeight}
          fontStyle={labelTextStyle.fontStyle}
          textDecoration={labelTextStyle.textDecoration}
          fontFamily={labelTextStyle.fontFamily}
          style={{ userSelect: 'none' }}
          data-testid="gate-label"
        >
          {label}
        </text>
      )}
      {hasBubble && (
        <circle cx={bubbleX} cy={OUT_ROW} r={bubbleR} fill="var(--bg-card)" stroke={outline} strokeWidth="2" />
      )}
      <line x1={outStart} y1={OUT_ROW} x2={OUT_X} y2={OUT_ROW} stroke="var(--border-light)" strokeWidth="2" />
      {/* pins — fixed columns matching the engine port rows; stubs join them to the body */}
      {ys.map((y, i) => (
        <circle key={`pin-${i}`} cx={IN_X} cy={y} r={6} fill={valueColor(inputs[i])} stroke="var(--border-color)" strokeWidth="1.5" data-pin={`in:${i}`} />
      ))}
      <circle cx={OUT_X} cy={OUT_ROW} r={7} fill={valueColor(output)} stroke="var(--border-color)" strokeWidth="1.5" data-pin="out:0" />
    </g>
  )
}

interface PinSymbolProps {
  readonly type: string
  readonly label: string
  readonly value: NetValue | undefined
  readonly width?: number
  /** Input pin only: where the label is drawn (outside the square). */
  readonly labelLocation?: PinLabelLocation
  /** Input pin only: label text styling from the label-style popup. */
  readonly labelStyle?: LabelTextStyle
  /** Input pin only: which side the connection dot / wire port faces. */
  readonly facing?: PinFacing
}

/**
 * Pins drawn as in Logisim: an INPUT pin is a value square (no outer border —
 * the surrounding box is removed in the designer) with a connection dot on the
 * facing side and its label placed outside the square; an OUTPUT pin is a
 * circle (value shown inside). A multi-bit pin shows a "N-bit" tag so the bus
 * width is visible at a glance.
 */
export function PinSymbol({ type, label, value, width, labelLocation, labelStyle, facing }: PinSymbolProps) {
  const isInput = type === 'input'
  const bit = bitValue(value)
  const textColor =
    bit === 1 ? '#4ade80' : bit === 0 ? '#16a34a' : bit === 'E' ? '#ef4444' : 'var(--text-muted)'
  const dotColor = bit === 1 ? '#4ade80' : bit === 'E' ? '#ef4444' : 'var(--text-muted)'
  const widthTag = (width ?? 1) > 1 ? `${width}b` : null
  const labelTextStyle =
    labelStyle ??
    ({ fontSize: 11, fill: 'var(--text-secondary)', fontWeight: 400, fontStyle: 'normal' as const, textDecoration: 'none' as const, fontFamily: undefined } as LabelTextStyle)

  if (isInput) {
    const s = INPUT_PIN_SQUARE
    const dot = inputPinPortLocal(facing ?? 'east')
    const labelAnchor = pinLabelPosition(labelLocation ?? 'bottom')
    return (
      <g>
        {/* inner value square (the only body; no outer border/box) */}
        <rect x={s.x} y={s.y} width={s.width} height={s.height} rx={2} fill="var(--bg-card)" stroke="var(--border-light)" strokeWidth={2} data-pin="out:0" data-testid="input-pin-square" />
        {/* connection dot on the facing side */}
        <circle cx={dot.x} cy={dot.y} r={5} fill={dotColor} />
        {/* value drawn inside */}
        <text x={s.x + 8} y={51} fontSize={16} fontWeight="bold" fill={textColor} fontFamily="monospace">{pinText(value)}</text>
        {widthTag && (
          <text x={s.x} y={s.y - 4} fontSize="9" fill="var(--text-muted)" style={{ userSelect: 'none' }}>{widthTag}</text>
        )}
        {/* label — outside the square (left/right/top/bottom) */}
        <text
          x={labelAnchor.x}
          y={labelAnchor.y}
          textAnchor={labelAnchor.anchor}
          fontSize={labelTextStyle.fontSize}
          fill={labelTextStyle.fill}
          fontWeight={labelTextStyle.fontWeight}
          fontStyle={labelTextStyle.fontStyle}
          textDecoration={labelTextStyle.textDecoration}
          fontFamily={labelTextStyle.fontFamily}
          style={{ userSelect: 'none' }}
          data-testid="pin-label"
        >
          {label}
        </text>
      </g>
    )
  }
  return (
    <g>
      {/* connection stub from the wire */}
      <line x1={92} y1={45} x2={104} y2={45} stroke="var(--border-light)" strokeWidth={2} />
      {/* circle body */}
      <circle cx={118} cy={45} r={18} fill="var(--bg-card)" stroke="var(--border-light)" strokeWidth={2} data-pin="in:0" />
      {/* value drawn inside */}
      <text x={118} y={51} textAnchor="middle" fontSize={16} fontWeight="bold" fill={textColor} fontFamily="monospace">{pinText(value)}</text>
      {widthTag && (
        <text x={118} y={24} textAnchor="middle" fontSize="9" fill="var(--text-muted)" style={{ userSelect: 'none' }}>{widthTag}</text>
      )}
      {/* label */}
      <text x={118} y={80} textAnchor="middle" fontSize="13" fill="var(--text-secondary)" style={{ userSelect: 'none' }}>
        {label}
      </text>
    </g>
  )
}
