import { motion } from 'framer-motion'
import type { CellValue } from '../../../../core/kmap'
import { truthTableToKMap } from '../../../../core/kmap'
import KMapGrid from '../KMapGrid'
import type { TruthTableSpec } from '../../concepts/sop-pos'
import { binaryString } from '../../concepts/sop-pos'

interface KMapConnectionProps {
  mode: 'sop' | 'pos'
  spec: TruthTableSpec
  /** Cells to spotlight. Use one for the "row → cell" chain, several to hint at grouping. */
  focusMinterms: readonly number[]
  /** Optional chain label for the minterm / maxterm number (defaults from `focusMinterms[0]`). */
  labelMinterm?: number
}

/**
 * The conceptual bridge between a truth table and the K-map. It walks the chain
 *  truth-table row → binary → m/M number → K-map cell
 * and reuses the shared KMapGrid to spotlight the corresponding cells, so the
 * student sees that each K-map cell is literally just the visual home of a
 * truth-table row.
 */
export default function KMapConnection({
  mode,
  spec,
  focusMinterms,
  labelMinterm,
}: KMapConnectionProps) {
  const model = truthTableToKMap({ variables: [...spec.variables], outputs: [...spec.outputs] })
  const focus = focusMinterms[0]
  const number = labelMinterm ?? focus
  const chip = mode === 'sop' ? `m${number}` : `M${number}`

  const highlightMap = new Map<number, number>()
  focusMinterms.forEach((minterm, index) => highlightMap.set(minterm, index % 4))
  const tone = mode === 'sop' ? 'green' : 'red'
  const valueOf: CellValue = mode === 'sop' ? 1 : 0

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[auto_auto_auto_auto] items-center gap-2 overflow-x-auto text-center text-sm">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-slate-400">truth-table row</span>
          <span className="font-mono text-white">{binaryString({ variables: spec.variables, bits: focusMinterms.length ? mintermBits(focusMinterms[0]!, spec.variables.length) : [] })}</span>
        </div>
        <span className="text-slate-500">→</span>
        <div className="flex flex-col items-center">
          <span className="text-slate-400">binary</span>
          <span className="font-mono text-white">{binaryString({ variables: spec.variables, bits: mintermBits(focusMinterms[0]!, spec.variables.length) })}</span>
        </div>
        <span className="text-slate-500">→</span>
        <div className="flex flex-col items-center">
          <span className="text-slate-400">{mode === 'sop' ? 'minterm' : 'maxterm'}</span>
          <span className={`font-mono font-bold ${tone === 'green' ? 'text-green-400' : 'text-red-400'}`}>{chip}</span>
        </div>
        <span className="text-slate-500">→</span>
        <div className="flex flex-col items-center">
          <span className="text-slate-400">K-map cell</span>
          <span className="font-mono font-bold text-violet-300">{chip}</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-lg border border-slate-700 bg-slate-800/60 p-3"
      >
        <p className="mb-2 text-xs text-slate-400">
          Each K-map cell represents the same input combination as the row. The{' '}
          <span className={tone === 'green' ? 'text-green-400' : 'text-red-400'}>{chip}</span>{' '}
          cell holds F = <span className={`font-mono ${valueOf === 1 ? 'text-green-400' : 'text-red-400'}`}>{valueOf}</span>
          {mode === 'pos' && ' — so it is important for POS.'}
        </p>
        <KMapGrid
          kmap={model}
          onCellClick={() => {}}
          onCellSelect={() => {}}
          onCellInfo={() => {}}
          selectedCells={new Set()}
          hoveredCell={null}
          onCellHover={() => {}}
          showMintermNumbers={false}
          showSOP={mode === 'sop'}
          highlightMap={highlightMap}
        />
      </motion.div>
    </div>
  )
}

function mintermBits(minterm: number, width: number): number[] {
  return minterm
    .toString(2)
    .padStart(width, '0')
    .split('')
    .map((bit) => Number(bit))
}