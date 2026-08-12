import type { KMapModel } from '../../../core/kmap'
import { historyComment, type HistoryEntry } from '../../../core/kmap/solutions'
import { canonicalVsMinimalExplanation } from '../../../education/advanced'
import ExpandableSection from '../components/ExpandableSection'
import type { Analysis } from './analysis'
import { INPUT_CLS } from './inputClass'
import CoverageTable from './CoverageTable'
import NiceHeader from './NiceHeader'
import Pills from './Pills'
import PrimeRow from './PrimeRow'
import RunningText from './RunningText'

interface Props {
  analysis: Analysis
  kmap: KMapModel
  progression: readonly string[]
  strategy: readonly string[]
  history: readonly HistoryEntry[]
  studentExpr: string
  onStudentExprChange: (v: string) => void
  eof: { minterms: readonly number[]; maxterms: readonly number[]; dontCares: readonly number[] }
}

export default function SolutionAnalysisPanel({
  analysis,
  kmap,
  progression,
  strategy,
  history,
  studentExpr,
  onStudentExprChange,
  eof,
}: Props) {
  return (
    <div className="border-t border-slate-700 pt-4">
      <NiceHeader title="Solution analysis" hint="Derived live from the current K-map." />
      <div className="space-y-3">
        <ExpandableSection title="SOP / POS minimal solution + cost" defaultExpanded>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded bg-slate-900 border border-slate-700 p-3">
              <p className="text-violet-300 font-medium mb-1">SOP (Sum of Products)</p>
              <code className="text-green-300">{analysis.simp.sop || '0'}</code>
              <p className="text-slate-400 text-xs mt-1">{analysis.costSop.terms} term(s) · {analysis.costSop.literals} literal(s) · est. {analysis.costSop.estimatedGates} gates</p>
            </div>
            <div className="rounded bg-slate-900 border border-slate-700 p-3">
              <p className="text-violet-300 font-medium mb-1">POS (Product of Sums)</p>
              <code className="text-green-300">{analysis.simp.pos || '0'}</code>
              <p className="text-slate-400 text-xs mt-1">{analysis.costPos.terms} term(s) · {analysis.costPos.literals} literal(s) · est. {analysis.costPos.estimatedGates} gates</p>
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-2">Gate count is a transparent literals + terms heuristic, not real hardware cost.</p>
        </ExpandableSection>

        <ExpandableSection title="Prime implicants (implicant → prime → essential)">
          <RunningText lines={progression} />
          <ul className="text-sm text-slate-300 space-y-1 mt-2">
            {analysis.prime.length === 0 && <li className="text-slate-500">No ON-set cells to cover.</li>}
            {analysis.prime.map((p) => <PrimeRow key={p.id} p={p} />)}
          </ul>
        </ExpandableSection>

        <ExpandableSection title="Coverage matrix">
          <CoverageTable model={kmap} />
        </ExpandableSection>

        <ExpandableSection title="Canonical vs minimal">
          <RunningText lines={canonicalVsMinimalExplanation()} />
          <div className="mt-2 grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-400 text-xs">Canonical SOP</p>
              <code className="text-green-300">{analysis.canon.canonicalSop || '0'}</code>
              <p className="text-slate-400 text-xs mt-1">Minimal SOP</p>
              <code className="text-green-300">{analysis.canon.simplifiedSop || '0'}</code>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Canonical POS</p>
              <code className="text-green-300">{analysis.canon.canonicalPos || '0'}</code>
              <p className="text-slate-400 text-xs mt-1">Minimal POS</p>
              <code className="text-green-300">{analysis.canon.simplifiedPos || '0'}</code>
            </div>
          </div>
        </ExpandableSection>

        <ExpandableSection title="Multiple valid solutions">
          <p className="text-slate-300 text-sm mb-2">{analysis.comparison.verdict}</p>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded bg-slate-900 border border-slate-700 p-2">
              <p className="text-slate-500 text-xs">Minimal {analysis.modeEngine.toUpperCase()}</p>
              <code className="text-green-300">A: {analysis.primary}</code>
              <p className="text-slate-500 text-xs">{analysis.comparison.a.cost.literals} literals</p>
            </div>
            <div className="rounded bg-slate-900 border border-slate-700 p-2">
              <p className="text-slate-500 text-xs">Complementary form ({analysis.modeEngine === 'sop' ? 'POS' : 'SOP'})</p>
              <code className="text-green-300">B: {analysis.modeEngine === 'sop' ? analysis.simp.pos : analysis.simp.sop}</code>
              <p className="text-slate-500 text-xs">{analysis.comparison.b.cost.literals} literals</p>
            </div>
          </div>
          <div className="mt-3">
            <label className="text-slate-300 text-sm block mb-1" htmlFor="student-expr">
              Check your own expression (A vs B):
            </label>
            <input
              id="student-expr"
              value={studentExpr}
              onChange={(e) => onStudentExprChange(e.target.value)}
              placeholder={`e.g. ${analysis.primary}`}
              className={INPUT_CLS}
              aria-label="Student expression"
            />
          </div>
        </ExpandableSection>

        <ExpandableSection title="Grouping strategy (your current selection)">
          {strategy.length === 0 ? (
            <p className="text-slate-500 text-sm">Select cells on the K-map to analyze your grouping.</p>
          ) : (
            <ul className="text-sm text-slate-300 space-y-1">
              {strategy.map((s, i) => <li key={i}>· {s}</li>)}
            </ul>
          )}
        </ExpandableSection>

        <ExpandableSection title="Session history (this page)">
          {history.length === 0 ? (
            <p className="text-slate-500 text-sm">Define a function to start a history log.</p>
          ) : (
            <ul className="text-sm text-slate-300 space-y-1">
              {history.map((h, i) => (
                <li key={h.id}>
                  <span className="text-slate-500">#{h.id}</span> <code className="text-green-300">{h.expression}</code> · {h.terms}t/{h.literals}l · {h.mode.toUpperCase()}
                  {i > 0 && <span className="text-slate-400"> — {historyComment(history[i - 1]!, h)}</span>}
                </li>
              ))}
            </ul>
          )}
        </ExpandableSection>

        <div className="rounded bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-300">
          <p className="text-violet-300 font-medium mb-1">Current function (derived from the K-map)</p>
          <p className="text-xs">
            ON (minterms): <Pills items={eof.minterms} /> · OFF (maxterms): <Pills items={eof.maxterms} /> · Don't-care: <Pills items={eof.dontCares} />
          </p>
        </div>
      </div>
    </div>
  )
}