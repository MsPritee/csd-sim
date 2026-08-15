import { attrNumber, packedValue, bitValue } from '../../core/circuit'
import type { NetValue } from '../../core/circuit'
import type { AttrValue } from '../../core/circuit/descriptors'
import { wireColor, pinText } from './layout'

const IN_X = 8
const OUT_X = 132

/** Port y-positions distributed across the standard 100px-tall box. */
function rowYs(count: number): number[] {
  if (count === 1) return [50]
  return Array.from({ length: count }, (_, i) => 20 + (60 * i) / Math.max(1, count - 1))
}

/**
 * Logisim drawSelectCircle logic:
 * Skip when min ≤ 20
 * delta = 8 when max ≤ 50, else 6
 */
function drawSelectCircle(min: number, max: number): { show: boolean; delta: number } {
  if (min <= 20) return { show: false, delta: 0 }
  const delta = max <= 50 ? 8 : 6
  return { show: true, delta }
}

/** Logisim trapezoid path for plexer components */
function trapezoidPath(x: number, y: number, width: number, height: number, delta: number): string {
  const left = x
  const right = x + width
  const top = y
  const bottom = y + height
  
  // Trapezoid with wider top (input side) and narrower bottom (output side) for MUX
  // Or wider bottom and narrower top for DEMUX
  return `M ${left} ${top} L ${right} ${top + delta} L ${right} ${bottom - delta} L ${left} ${bottom} Z`
}

function PortPegs({
  counts,
  inVals,
  outVals,
}: {
  counts: { inputs: number; outputs: number }
  inVals: (NetValue | undefined)[]
  outVals: (NetValue | undefined)[]
}) {
  const inYs = rowYs(counts.inputs)
  const outYs = rowYs(counts.outputs)
  return (
    <g>
      {inYs.map((y, i) => (
        <circle key={`in-${i}`} cx={IN_X} cy={y} r={6} fill={wireColor(inVals[i])} />
      ))}
      {outYs.map((y, i) => (
        <g key={`out-${i}`}>
          <line x1={OUT_X - 8} y1={y} x2={OUT_X} y2={y} stroke="var(--border-light)" strokeWidth={2} />
          <circle cx={OUT_X} cy={y} r={7} fill={wireColor(outVals[i])} />
        </g>
      ))}
    </g>
  )
}

/** Lights a green lamp when the (integer) value is non-zero. */
function lit(value: NetValue | undefined): boolean {
  const bit = bitValue(value)
  if (bit === 1) return true
  const packed = packedValue(value)
  return packed !== null ? packed !== 0 : false
}

/** Pin label configuration for memory components */
const PIN_LABELS: Record<string, { inputs: string[]; outputs: string[] }> = {
  jk: { inputs: ['J', 'K', 'CLK'], outputs: ['Q', 'Q̄'] },
  t: { inputs: ['T', 'CLK'], outputs: ['Q', 'Q̄'] },
  sr: { inputs: ['S', 'R', 'CLK'], outputs: ['Q', 'Q̄'] },
  register: { inputs: ['D', 'CLK'], outputs: ['Q'] },
  counter: { inputs: ['CLK', 'EN'], outputs: ['Q'] },
  ram: { inputs: ['ADDR', 'DATA', 'WE', 'CLK'], outputs: ['DATA'] },
  rom: { inputs: ['ADDR'], outputs: ['DATA'] },
}

/** Get pin labels for a memory component type */
function getPinLabels(type: string): { inputs: string[]; outputs: string[] } {
  return PIN_LABELS[type] || { inputs: [], outputs: [] }
}

/** Draw CLK notch indicator (triangle pointing inward) */
function drawClockNotch(x: number, y: number): JSX.Element {
  return (
    <polygon
      points={`${x},${y - 4} ${x + 6},${y} ${x},${y + 4}`}
      fill="var(--text-secondary)"
    />
  )
}

/** Draw pin label text */
function drawPinLabel(label: string, x: number, y: number, isInput: boolean): JSX.Element {
  return (
    <text
      x={x}
      y={y}
      textAnchor={isInput ? 'end' : 'start'}
      fontSize={9}
      fill="var(--text-secondary)"
      style={{ userSelect: 'none' }}
    >
      {label}
    </text>
  )
}

/**
 * Glyphs for the Phase-4 wiring / IO / arithmetic components. Each draws its
 * own distinguishing icon plus the standard input/output port pegs.
 */
export function LibraryGlyph({
  type,
  attrs,
  counts,
  inVals,
  outVals,
}: {
  type: string
  attrs: Readonly<Record<string, AttrValue>>
  counts: { inputs: number; outputs: number }
  inVals: (NetValue | undefined)[]
  outVals: (NetValue | undefined)[]
}) {
  const width = attrNumber(attrs, 'width', 1)
  const body = {
    on: 'var(--accent-primary)',
    off: 'var(--border-light)',
    text: 'var(--text-secondary)',
  }

  return (
    <g>
      <PortPegs counts={counts} inVals={inVals} outVals={outVals} />

      {type === 'constant' && (
        <g>
          {/* Logisim-style constant: rounded rectangle with value display */}
          <rect x={42} y={28} width={56} height={32} rx={4} fill="var(--bg-tertiary)" stroke={body.off} strokeWidth={2} />
          <text x={70} y={48} textAnchor="middle" fontSize="14" fontWeight={700} fill={body.text} style={{ userSelect: 'none' }}>
            K
          </text>
          <text x={70} y={76} textAnchor="middle" fontSize="11" fill={wireColor(outVals[0])}>
            {pinText(outVals[0])}
          </text>
        </g>
      )}

      {type === 'probe' &&
        (() => {
          const v = inVals[0]
          const width = v !== undefined && v !== 'E' && v.kind === 'bits' ? v.width : 1
          if (width === 1) {
            return (
              <g>
                {/* Logisim-style probe: rounded rectangle with prominent value */}
                <rect x={32} y={30} width={76} height={36} rx={4} fill="var(--bg-tertiary)" stroke={body.off} strokeWidth={2} />
                <text x={70} y={54} textAnchor="middle" fontSize="16" fontWeight={600} fill={wireColor(inVals[0])} data-testid="probe-value">
                  {pinText(inVals[0])}
                </text>
              </g>
            )
          }
          // Multi-bit bus: render one lane per bit, MSB-first, splitter-style.
          const states = v !== undefined && v !== 'E' && v.kind === 'bits' ? v.states : undefined
          const lane = (idx: number): '0' | '1' | 'X' | 'E' => {
            const s = states?.[idx]
            if (s === 1 || s === 0) return String(s) as '0' | '1'
            return s === 'E' ? 'E' : 'X'
          }
          const size = 12
          const gap = 4
          const total = width * size + (width - 1) * gap
          const x0 = 70 - total / 2 + size / 2
          const lanes = Array.from({ length: width }, (_, i) => width - 1 - i) // MSB first
          return (
            <g>
              {/* Logisim-style multi-bit probe */}
              <rect x={22} y={28} width={96} height={44} rx={4} fill="var(--bg-tertiary)" stroke={body.off} strokeWidth={2} />
              <text x={70} y={84} textAnchor="middle" fontSize="10" fill="var(--text-muted)" style={{ userSelect: 'none' }}>
                {width} bits
              </text>
              {lanes.map((bitIdx, i) => {
                const st = lane(bitIdx)
                const x = x0 + i * (size + gap)
                return (
                  <line
                    key={bitIdx}
                    x1={x}
                    y1={36}
                    x2={x}
                    y2={64}
                    strokeWidth={size}
                    strokeLinecap="round"
                    stroke={st === '1' ? '#4ade80' : st === '0' ? '#16a34a' : st === 'E' ? '#ef4444' : '#60a5fa'}
                    data-testid="probe-bit"
                  />
                )
              })}
            </g>
          )
        })()}

      {type === 'tunnel' && (
        <g>
          {/* Logisim-style tunnel: arrow through connection */}
          <line x1={14} y1={50} x2={56} y2={50} stroke={body.off} strokeWidth={4} />
          <line x1={72} y1={50} x2={126} y2={50} stroke={body.off} strokeWidth={4} />
          <polygon points="56,38 72,50 56,62" fill={body.text} />
        </g>
      )}

      {type === 'clock' && (
        <g>
          {/* Logisim-style clock: square wave symbol */}
          <rect x={48} y={30} width={44} height={40} rx={4} fill="var(--bg-tertiary)" stroke={body.off} strokeWidth={2} />
          <text x={70} y={52} textAnchor="middle" fontSize="28" fill={lit(outVals[0]) ? body.on : body.text} data-testid="clock-value">
            ~~~
          </text>
          <text x={70} y={78} textAnchor="middle" fontSize="10" fill={wireColor(outVals[0])}>
            {pinText(outVals[0])}
          </text>
        </g>
      )}

      {type === 'led' && (
        <g>
          {/* Logisim-style LED: circular lamp with inner reflector */}
          <circle cx={70} cy={50} r={22} fill={lit(inVals[0]) ? '#fde047' : 'var(--bg-tertiary)'} stroke={lit(inVals[0]) ? '#facc15' : body.off} strokeWidth={2.5} data-testid="led-lamp" />
          <circle cx={70} cy={50} r={10} fill={lit(inVals[0]) ? '#fef9c3' : 'var(--bg-card)'} stroke={body.off} strokeWidth={1} />
        </g>
      )}

      {type === 'button' && (
        <g>
          {/* Logisim-style button: rounded square with indicator */}
          <rect x={46} y={28} width={48} height={44} rx={6} fill="var(--bg-tertiary)" stroke={body.off} strokeWidth={2} />
          <circle cx={70} cy={50} r={10} fill={lit(outVals[0]) ? '#fde047' : 'var(--bg-card)'} stroke={body.text} strokeWidth={2} />
        </g>
      )}

      {type === 'segment' && (
        <g>
          <SevenSegmentSegments on={lit(inVals[0])} />
        </g>
      )}

      {(type === 'adder' || type === 'subtractor') && (
        <g>
          {/* Logisim box */}
          <rect x={44} y={24} width={52} height={52} rx={4} fill="var(--bg-tertiary)" stroke={body.off} strokeWidth={2} />
          {/* + glyph with two crossing lines (Logisim Adder.java style) */}
          {type === 'adder' ? (
            <>
              <line x1={58} y1={50} x2={82} y2={50} stroke={body.text} strokeWidth={3} />
              <line x1={70} y1={38} x2={70} y2={62} stroke={body.text} strokeWidth={3} />
            </>
          ) : (
            <text x={70} y={50} textAnchor="middle" fontSize="26" fill={body.text}>
              −
            </text>
          )}
          {/* c in/c out port labels for Adder */}
          {type === 'adder' && (
            <>
              <text x={20} y={30} textAnchor="middle" fontSize="8" fill={body.text}>
                c in
              </text>
              <text x={120} y={30} textAnchor="middle" fontSize="8" fill={body.text}>
                c out
              </text>
            </>
          )}
          <text x={70} y={82} textAnchor="middle" fontSize="10" fill={wireColor(outVals[0])}>
            {pinText(outVals[0])}
          </text>
        </g>
      )}

      {type === 'comparator' && (
        <g>
          <text x={70} y={50} textAnchor="middle" fontSize="20" fill={body.text}>
            =&gt;
          </text>
          <text x={88} y={50} textAnchor="middle" fontSize="12" fill="var(--text-muted)">
            {width}
          </text>
        </g>
      )}

      {type === 'negator' && (
        <g>
          <text x={70} y={50} textAnchor="middle" fontSize="24" fill={body.text}>
            −
          </text>
          <text x={88} y={50} textAnchor="middle" fontSize="12" fill="var(--text-muted)">
            {pinText(outVals[0])}
          </text>
        </g>
      )}

      {(type === 'mux' ||
        type === 'demux' ||
        type === 'decoder' ||
        type === 'encoder' ||
        type === 'priority_encoder' ||
        type === 'bit_selector') && (
        <g>
          {/* Logisim trapezoid body */}
          {(() => {
            const selectInfo = drawSelectCircle(counts.inputs, counts.outputs)
            const delta = selectInfo.show ? selectInfo.delta : 0
            return (
              <path
                d={trapezoidPath(44, 26, 52, 48, delta)}
                fill="var(--bg-tertiary)"
                stroke={body.off}
                strokeWidth={2}
              />
            )
          })()}
          
          {/* Select circle at corner when applicable */}
          {(() => {
            const selectInfo = drawSelectCircle(counts.inputs, counts.outputs)
            if (selectInfo.show) {
              return (
                <circle
                  cx={type === 'demux' ? 96 : 44}
                  cy={type === 'demux' ? 26 : 74}
                  r={4}
                  fill={body.text}
                />
              )
            }
            return null
          })()}
          
          {/* Component label */}
          <text x={70} y={65} textAnchor="middle" fontSize={14} fontWeight={700} fill={body.text} style={{ userSelect: 'none' }} data-testid={`plexer-${type}`}>
            {type === 'mux'
              ? 'MUX'
              : type === 'demux'
                ? 'DEMUX'
                : type === 'decoder'
                  ? 'DEC'
                  : type === 'encoder'
                    ? 'ENC'
                    : type === 'priority_encoder'
                      ? 'PRI'
                      : 'BITS'}
          </text>
          
          {/* MUX label when wide */}
          {type === 'mux' && width > 1 && (
            <text x={70} y={82} textAnchor="middle" fontSize={9} fill={body.text}>
              {width}b
            </text>
          )}
          
          {/* Data-bit labels on inputs */}
          {inVals.length > 0 && inVals.map((val, i) => {
            const bitWidth = val !== undefined && val !== 'E' && val.kind === 'bits' ? val.width : 1
            if (bitWidth > 1) {
              const y = rowYs(counts.inputs)[i]
              return (
                <text key={`bit-label-${i}`} x={IN_X + 12} y={y - 8} textAnchor="middle" fontSize={8} fill={body.text}>
                  {bitWidth}b
                </text>
              )
            }
            return null
          })}
        </g>
      )}

      {type === 'splitter' && (
        <g>
          {/* Logisim-style splitter body */}
          <rect x={52} y={22} width={36} height={56} rx={4} fill="var(--bg-tertiary)" stroke={body.off} strokeWidth={2} />
          {/* Σ bar in Logisim style */}
          <line x1={56} y1={50} x2={84} y2={50} stroke={body.text} strokeWidth={3} />
          <text x={70} y={50} textAnchor="middle" fontSize="12" fill={body.text} data-testid="splitter-sum">
            Σ
          </text>
          <text x={70} y={74} textAnchor="middle" fontSize="9" fill="var(--text-muted)">
            {width}b
          </text>
        </g>
      )}

      {type === 'pull' && (
        <g>
          <path
            d="M 26 50 L 42 50 L 46 36 L 54 64 L 62 36 L 70 64 L 74 50 L 106 50"
            fill="none"
            stroke={body.off}
            strokeWidth={2.5}
            data-testid="pull-resistor"
          />
          <text x={66} y={84} textAnchor="middle" fontSize="10" fill={body.text}>
            R={String(attrs['pull'] ?? 1)}
          </text>
        </g>
      )}

      {(type === 'jk' ||
        type === 't' ||
        type === 'sr' ||
        type === 'register' ||
        type === 'counter' ||
        type === 'ram' ||
        type === 'rom') && (
        <g>
          {/* Logisim-style rectangle body */}
          <rect x={42} y={24} width={56} height={52} rx={5} fill="var(--bg-tertiary)" stroke={body.off} strokeWidth={2} />
          
          {/* Component type label */}
          <text x={70} y={45} textAnchor="middle" fontSize="14" fontWeight={700} fill={body.text} style={{ userSelect: 'none' }} data-testid={`mem-${type}`}>
            {type === 'jk'
              ? 'JK'
              : type === 't'
                ? 'T'
                : type === 'sr'
                  ? 'SR'
                  : type === 'register'
                    ? 'REG'
                    : type === 'counter'
                      ? 'CNT'
                      : type === 'ram'
                        ? 'RAM'
                        : 'ROM'}
          </text>
          
          {/* Address bits label for RAM/ROM */}
          {(type === 'ram' || type === 'rom') && (
            <text x={70} y={65} textAnchor="middle" fontSize="9" fill="var(--text-muted)">
              {String(attrs['addrBits'] ?? 4)}b
            </text>
          )}
          
          {/* Pin labels */}
          {(() => {
            const labels = getPinLabels(type)
            const inYs = rowYs(counts.inputs)
            const outYs = rowYs(counts.outputs)
            
            return (
              <>
                {/* Input pin labels */}
                {labels.inputs.map((label, i) => {
                  const y = inYs[i]
                  const isClock = label === 'CLK'
                  return (
                    <g key={`in-label-${i}`}>
                      {drawPinLabel(label, IN_X - 4, y + 3, true)}
                      {isClock && drawClockNotch(IN_X, y)}
                    </g>
                  )
                })}
                
                {/* Output pin labels */}
                {labels.outputs.map((label, i) => {
                  const y = outYs[i]
                  return (
                    <g key={`out-label-${i}`}>
                      {drawPinLabel(label, OUT_X + 4, y + 3, false)}
                    </g>
                  )
                })}
              </>
            )
          })()}
        </g>
      )}
    </g>
  )
}

/** A compact seven-segment-style face that lights when the driver is high. */
function SevenSegmentSegments({ on }: { on: boolean }) {
  const onColor = '#facc15'
  const offColor = 'var(--border-light)'
  const c = on ? onColor : offColor
  const seg = (x: number, y: number, w: number, h: number) => (
    <rect x={x} y={y} width={w} height={h} rx={2.5} fill={c} data-testid="segment-bar" />
  )
  return (
    <g>
      {seg(58, 24, 20, 5)}
      {seg(58, 60, 20, 5)}
      {seg(58, 42, 20, 5)}
      {seg(56, 26, 5, 18)}
      {seg(56, 56, 5, 18)}
      {seg(75, 26, 5, 18)}
      {seg(75, 56, 5, 18)}
    </g>
  )
}