import { useMemo } from 'react'
import type { GroupedTerm } from '../../../core/kmap/simplify'
import SectionCard from './SectionCard'

interface LogicCircuitProps {
  simplifiedExpression: string
  groups: readonly GroupedTerm[]
  mode: 'sop' | 'pos'
}

interface LayoutInfo {
  inputX: number
  gateStartX: number
  gateWidth: number
  gateHeight: number
  gateSpacing: number
  outputX: number
  /** Vertical centre of the whole diagram (used for the second-level gate & output). */
  outputY: number
  svgWidth: number
  svgHeight: number
  inputY: (index: number) => number
  gateY: (index: number) => number
}

/**
 * Vertical layout for the gate diagram.
 *
 * A shared row grid (48px per row) holds both the input rails and the
 * first-level gates, so a circuit with many terms never overflows the canvas
 * (the old centring formula could push the top gate out of view) and a
 * circuit with many variables keeps its gates centred on the input band.
 */
function computeLayout(
  termCount: number,
  varCount: number,
  maxTermLabelLen: number,
  exprLength: number,
): LayoutInfo {
  const inputX = 40
  const gateStartX = 190
  const gateHeight = 36
  const rowStep = 48
  const vTop = 48

  const gateWidth = Math.max(64, 18 + maxTermLabelLen * 7)

  const maxRows = Math.max(Math.max(varCount, termCount), 1)
  const bandMid = vTop + ((maxRows - 1) * rowStep) / 2
  const gatesTotal = (termCount - 1) * rowStep
  const gatesTop =
    termCount > 1 ? bandMid - gatesTotal / 2 : bandMid - gateHeight / 2

  const outputX = gateStartX + gateWidth + 90
  const svgWidth = outputX + 64 + exprLength * 8
  const svgHeight = vTop + (maxRows - 1) * rowStep + gateHeight + 28

  const inputY = (i: number) => vTop + i * rowStep
  const gateY = (i: number) => gatesTop + i * rowStep

  return {
    inputX,
    gateStartX,
    gateWidth,
    gateHeight,
    gateSpacing: rowStep,
    outputX,
    outputY: bandMid,
    svgWidth,
    svgHeight,
    inputY,
    gateY,
  }
}

function NotCircle({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={4} fill="var(--bg-primary)" stroke="var(--text-primary)" strokeWidth={1.5} />
}

function AndGate({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const d = `M${x},${y} L${x + w * 0.5},${y} Q${x + w},${y} ${x + w},${y + h / 2} Q${x + w},${y + h} ${x + w * 0.5},${y + h} L${x},${y + h} Z`
  return <path d={d} fill="var(--bg-tertiary)" stroke="var(--text-primary)" strokeWidth={1.5} />
}

function OrGate({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const d = `M${x},${y} Q${x + w * 0.2},${y + h * 0.25} ${x + w},${y + h / 2} Q${x + w * 0.2},${y + h * 0.75} ${x},${y + h} Q${x + w * 0.35},${y + h / 2} ${x},${y} Z`
  return <path d={d} fill="var(--bg-tertiary)" stroke="var(--text-primary)" strokeWidth={1.5} />
}

function OutputWire({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const midX = (x1 + x2) / 2
  return (
    <>
      <line x1={x1} y1={y1} x2={midX} y2={y1} stroke="var(--text-secondary)" strokeWidth={1} />
      <line x1={midX} y1={y1} x2={midX} y2={y2} stroke="var(--text-secondary)" strokeWidth={1} />
      <line x1={midX} y1={y2} x2={x2} y2={y2} stroke="var(--text-secondary)" strokeWidth={1} />
    </>
  )
}

function GateInputWire({ x1, y1, x2, y2, hasNot }: { x1: number; y1: number; x2: number; y2: number; hasNot: boolean }) {
  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--text-secondary)" strokeWidth={1} />
      {hasNot && <NotCircle cx={x2 - 6} cy={y2} />}
    </>
  )
}

export default function LogicCircuit({ simplifiedExpression, groups, mode }: LogicCircuitProps) {
  const layout = useMemo(() => {
    const termCount = groups.length
    const allVars = new Set<string>()
    for (const g of groups) {
      for (const l of mode === 'sop' ? g.product : g.sum) {
        allVars.add(l.name)
      }
    }
    const variables = [...allVars].sort()
    const termTexts = groups.map((g) =>
      mode === 'sop' ? g.productText : g.sumText,
    )
    const maxTermLabelLen = termTexts.length
      ? Math.max(...termTexts.map((t) => t.length))
      : 0
    return computeLayout(
      termCount,
      variables.length,
      maxTermLabelLen,
      simplifiedExpression.length,
    )
  }, [groups, mode, simplifiedExpression])

  const variables = useMemo(() => {
    const allVars = new Set<string>()
    for (const g of groups) {
      for (const l of mode === 'sop' ? g.product : g.sum) {
        allVars.add(l.name)
      }
    }
    return [...allVars].sort()
  }, [groups, mode])

  if (groups.length === 0) {
    return null
  }

  const isSOP = mode === 'sop'
  const firstGate = isSOP ? AndGate : OrGate
  const firstLabel = isSOP ? 'AND' : 'OR'
  const secondLabel = isSOP ? 'OR' : 'AND'

  const inputYMap = new Map<string, number>()
  variables.forEach((v, i) => {
    inputYMap.set(v, layout.inputY(i))
  })

  return (
    <SectionCard
      title="Logic Circuit Diagram"
      subtitle={`Auto-generated from the simplified ${mode.toUpperCase()} expression.`}
      className="section-card-secondary"
      defaultOpen={false}
    >
      <div className="rounded-lg border overflow-x-auto" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
        <svg
          width={layout.svgWidth}
          height={layout.svgHeight}
          viewBox={`0 0 ${layout.svgWidth} ${layout.svgHeight}`}
          className="mx-auto"
          style={{ minWidth: layout.svgWidth }}
        >
          {/* Input variable labels */}
          {variables.map((v, i) => (
            <text
              key={`label-${v}`}
              x={layout.inputX - 10}
              y={layout.inputY(i) + 5}
              textAnchor="end"
              className="text-xs font-semibold"
              style={{ fill: 'var(--accent-primary)' }}
            >
              {v}
            </text>
          ))}

          {/* Input variable lines */}
          {variables.map((v) => (
            <line
              key={`line-${v}`}
              x1={layout.inputX}
              y1={inputYMap.get(v)!}
              x2={layout.inputX}
              y2={layout.svgHeight - 15}
              stroke="var(--text-secondary)"
              strokeWidth={1}
            />
          ))}

          {/* First-level gates and input wires */}
          {groups.map((group, gi) => {
            const literals = isSOP ? group.product : group.sum
            const gateX = layout.gateStartX
            const gateY = layout.gateY(gi)
            const GateComponent = firstGate

            return (
              <g key={`gate-${gi}`}>
                {literals.map((lit, li) => {
                  const yOff = (li - (literals.length - 1) / 2) * 10
                  return (
                    <GateInputWire
                      key={`wire-${gi}-${li}`}
                      x1={layout.inputX}
                      y1={inputYMap.get(lit.name)!}
                      x2={gateX}
                      y2={gateY + layout.gateHeight / 2 + yOff}
                      hasNot={lit.negated}
                    />
                  )
                })}
                <GateComponent x={gateX} y={gateY} w={layout.gateWidth} h={layout.gateHeight} />
                <text
                  x={gateX + layout.gateWidth / 2}
                  y={gateY - 6}
                  textAnchor="middle"
                  className="text-[9px]"
                  style={{ fill: 'var(--text-muted)' }}
                >
                  {firstLabel}
                </text>
                <text
                  x={gateX + layout.gateWidth / 2}
                  y={gateY + layout.gateHeight / 2 + 3}
                  textAnchor="middle"
                  className="text-[10px] font-medium"
                  style={{ fill: 'var(--accent-primary)' }}
                >
                  {isSOP ? group.productText : group.sumText}
                </text>
              </g>
            )
          })}

          {/* Wires from first gates to second gate */}
          {groups.map((_, gi) => {
            const gateY = layout.gateY(gi)
            return (
              <OutputWire
                key={`out-${gi}`}
                x1={layout.gateStartX + layout.gateWidth}
                y1={gateY + layout.gateHeight / 2}
                x2={layout.outputX - layout.gateWidth}
                y2={layout.outputY}
              />
            )
          })}

          {/* Second-level gate */}
          {(() => {
            const secondGateX = layout.outputX - layout.gateWidth
            const secondGateY = layout.outputY - layout.gateHeight / 2
            return (
              <g>
                {isSOP ? (
                  <OrGate x={secondGateX} y={secondGateY} w={layout.gateWidth} h={layout.gateHeight} />
                ) : (
                  <AndGate x={secondGateX} y={secondGateY} w={layout.gateWidth} h={layout.gateHeight} />
                )}
                <text
                  x={secondGateX + layout.gateWidth / 2}
                  y={secondGateY - 6}
                  textAnchor="middle"
                  className="text-[9px]"
                  style={{ fill: 'var(--text-muted)' }}
                >
                  {secondLabel}
                </text>
              </g>
            )
          })()}

          {/* Output wire */}
          <line
            x1={layout.outputX}
            y1={layout.outputY}
            x2={layout.outputX + 50}
            y2={layout.outputY}
            stroke="var(--text-secondary)"
            strokeWidth={1.5}
          />

          {/* Output label */}
          <text
            x={layout.outputX + 55}
            y={layout.outputY + 5}
            className="text-sm font-bold"
            style={{ fill: 'var(--accent-primary)' }}
          >
            F = {simplifiedExpression}
          </text>
        </svg>
      </div>
    </SectionCard>
  )
}
