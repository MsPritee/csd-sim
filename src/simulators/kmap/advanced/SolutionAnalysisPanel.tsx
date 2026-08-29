import type { KMapModel } from '../../../core/kmap'
import { historyComment, type HistoryEntry } from '../../../core/kmap/solutions'
import { canonicalVsMinimalExplanation } from '../../../education/advanced'
import ExpandableSection from '../components/ExpandableSection'
import type { Analysis } from './analysis'
import { INPUT_CLS, INPUT_STYLE } from './inputClass'
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
    <div className="border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
      <NiceHeader title="Solution analysis" hint="Derived live from the current K-map." />
      <div className="space-y-3">
        <ExpandableSection title="SOP / POS minimal solution + cost" defaultExpanded>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <p className="font-medium mb-1" style={{ color: 'var(--accent-secondary)' }}>SOP (Sum of Products)</p>
              <code style={{ color: 'var(--success-text)' }}>{analysis.simp.sop || '0'}</code>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{analysis.costSop.terms} term(s) · {analysis.costSop.literals} literal(s) · est. {analysis.costSop.estimatedGates} gates</p>
            </div>
            <div className="rounded p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <p className="font-medium mb-1" style={{ color: 'var(--accent-secondary)' }}>POS (Product of Sums)</p>
              <code style={{ color: 'var(--success-text)' }}>{analysis.simp.pos || '0'}</code>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{analysis.costPos.terms} term(s) · {analysis.costPos.literals} literal(s) · est. {analysis.costPos.estimatedGates} gates</p>
            </div>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Gate count is a transparent literals + terms heuristic, not real hardware cost.</p>
        </ExpandableSection>

        <ExpandableSection title="Prime implicants (implicant → prime → essential)">
          <RunningText lines={progression} />
          <ul className="text-sm space-y-1 mt-2" style={{ color: 'var(--text-primary)' }}>
            {analysis.prime.length === 0 && <li style={{ color: 'var(--text-muted)' }}>No ON-set cells to cover.</li>}
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
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Canonical SOP</p>
              <code style={{ color: 'var(--success-text)' }}>{analysis.canon.canonicalSop || '0'}</code>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Minimal SOP</p>
              <code style={{ color: 'var(--success-text)' }}>{analysis.canon.simplifiedSop || '0'}</code>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Canonical POS</p>
              <code style={{ color: 'var(--success-text)' }}>{analysis.canon.canonicalPos || '0'}</code>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Minimal POS</p>
              <code style={{ color: 'var(--success-text)' }}>{analysis.canon.simplifiedPos || '0'}</code>
            </div>
          </div>
        </ExpandableSection>

        <ExpandableSection title="Multiple valid solutions">
          <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{analysis.comparison.verdict}</p>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded p-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Minimal {analysis.modeEngine.toUpperCase()}</p>
              <code style={{ color: 'var(--success-text)' }}>A: {analysis.primary}</code>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{analysis.comparison.a.cost.literals} literals</p>
            </div>
            <div className="rounded p-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Complementary form ({analysis.modeEngine === 'sop' ? 'POS' : 'SOP'})</p>
              <code style={{ color: 'var(--success-text)' }}>B: {analysis.modeEngine === 'sop' ? analysis.simp.pos : analysis.simp.sop}</code>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{analysis.comparison.b.cost.literals} literals</p>
            </div>
          </div>
          <div className="mt-3">
            <label className="text-sm block mb-1" style={{ color: 'var(--text-primary)' }} htmlFor="student-expr">
              Check your own expression (A vs B):
            </label>
            <input
              id="student-expr"
              value={studentExpr}
              onChange={(e) => onStudentExprChange(e.target.value)}
              placeholder={`e.g. ${analysis.primary}`}
              className={INPUT_CLS}
              style={INPUT_STYLE}
              aria-label="Student expression"
            />
          </div>
        </ExpandableSection>

        <ExpandableSection title="Grouping strategy (your current selection)">
          {strategy.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select cells on the K-map to analyze your grouping.</p>
          ) : (
            <ul className="text-sm space-y-1" style={{ color: 'var(--text-primary)' }}>
              {strategy.map((s, i) => <li key={i}>· {s}</li>)}
            </ul>
          )}
        </ExpandableSection>

        <ExpandableSection title="Session history (this page)">
          {history.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Define a function to start a history log.</p>
          ) : (
            <ul className="text-sm space-y-1" style={{ color: 'var(--text-primary)' }}>
              {history.map((h, i) => (
                <li key={h.id}>
                  <span style={{ color: 'var(--text-muted)' }}>#{h.id}</span> <code style={{ color: 'var(--success-text)' }}>{h.expression}</code> · {h.terms}t/{h.literals}l · {h.mode.toUpperCase()}
                  {i > 0 && <span style={{ color: 'var(--text-secondary)' }}> — {historyComment(history[i - 1]!, h)}</span>}
                </li>
              ))}
            </ul>
          )}
        </ExpandableSection>

        <div className="rounded px-3 py-2 text-sm" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
          <p className="font-medium mb-1" style={{ color: 'var(--accent-secondary)' }}>Current function (derived from the K-map)</p>
          <p className="text-xs">
            ON (minterms): <Pills items={eof.minterms} /> · OFF (maxterms): <Pills items={eof.maxterms} /> · Don't-care: <Pills items={eof.dontCares} />
          </p>
        </div>
      </div>
    </div>
  )
}
