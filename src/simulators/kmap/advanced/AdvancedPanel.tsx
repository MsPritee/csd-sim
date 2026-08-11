import { useMemo, useState } from 'react'
import { useKMapStore } from '../../../stores/kmapStore'
import { minterms, maxterms, dontCares, type KMapModel } from '../../../core/kmap'
import { performSimplification } from '../../../application/kmap'
import {
  defineFunction,
  kmapToDefinition,
  definitionToKMap,
  outputsToDefinition,
  expressionToDefinition,
  parseValidatedIndices,
  DefinitionError,
  type FunctionDefinition,
} from '../../../core/kmap/definition'
import {
  computePrimeImplicants,
  coverageMatrix,
  type Implicant,
} from '../../../core/kmap/prime-implicants'
import {
  canonicalForms,
  compareSolutions,
  costOfSimplification,
  recordHistory,
  historyComment,
  type HistoryEntry,
} from '../../../core/kmap/solutions'
import {
  mintermExplanation,
  maxtermExplanation,
  expressionChain,
  expressionTermsWithCells,
  canonicalVsMinimalExplanation,
  implicantProgression,
  groupingStrategy,
  glossaryByTerm,
  GLOSSARY,
} from '../../../education/advanced'
import ExpandableSection from '../components/ExpandableSection'

type Method = 'minterms' | 'maxterms' | 'expression' | 'truth'
type Level = 'beginner' | 'advanced'

const METHOD_LABELS: Record<Method, string> = {
  minterms: 'Minterms (∑m)',
  maxterms: 'Maxterms (∏M)',
  expression: 'Boolean Expression',
  truth: 'Truth Table',
}

/* ------------------------- tiny presentational helpers ------------------------- */

function NiceHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-1">
      <h3 className="font-medium text-violet-200 text-base">{title}</h3>
      {hint ? <p className="text-slate-500 text-xs mt-0.5">{hint}</p> : null}
    </div>
  )
}

function GlossaryTip({ word }: { word: string }) {
  const [open, setOpen] = useState(false)
  const text = glossaryByTerm(word)
  if (!text) return null
  return (
    <span className="inline-flex items-start">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`Explain ${word}`}
        className="underline decoration-dotted underline-offset-2 text-violet-300 hover:text-white font-medium"
      >
        {word}
      </button>
      {open && <span className="text-slate-400 text-xs ml-1">— {text}</span>}
    </span>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mt-2 rounded bg-red-950/60 border border-red-700/60 px-3 py-2 text-red-300 text-sm" role="alert">
      {message}
    </div>
  )
}

function Notice({ lines }: { lines: readonly string[] }) {
  if (lines.length === 0) return null
  return (
    <div className="rounded bg-slate-800 border border-slate-700 px-3 py-2 text-slate-300 text-sm space-y-1">
      {lines.map((n, i) => <p key={i}>{n}</p>)}
    </div>
  )
}

function RunningText({ lines }: { lines: readonly string[] }) {
  if (lines.length === 0) return null
  return (
    <div className="text-slate-400 text-sm space-y-1">
      {lines.map((l, i) => <p key={i}>{l}</p>)}
    </div>
  )
}

function Pills({ items }: { items: readonly number[] }) {
  if (items.length === 0) return <span className="text-slate-500 text-sm">none</span>
  return (
    <span className="flex flex-wrap gap-1">
      {items.map((m) => (
        <code key={m} className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-200 text-xs">
          m{m}
        </code>
      ))}
    </span>
  )
}

function PrimeRow({ p }: { p: Implicant }) {
  return (
    <li className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
      <code className="text-green-300">m{p.cells.join(',m')}</code>
      {p.essential ? (
        <span className="text-violet-300 text-xs">essential — covers m{p.essentialFor.join(',m')} uniquely</span>
      ) : (
        <span className="text-slate-400 text-xs">non-essential</span>
      )}
    </li>
  )
}

function CoverageTable({ model }: { model: KMapModel }) {
  const { coverage, primes, uniquelyCovered } = coverageMatrix(model)
  const on = [...new Set(minterms(model))].sort((a, b) => a - b)
  if (on.length === 0) return <p className="text-slate-500 text-sm">No ON-set cells to cover.</p>
  return (
    <div className="overflow-x-auto">
      <table className="text-xs text-slate-200 border-collapse">
        <thead>
          <tr>
            <th className="border border-slate-700 px-2 py-1 text-left text-slate-400">Prime</th>
            {on.map((m) => <th key={m} className="border border-slate-700 px-1 py-1 text-slate-400">m{m}</th>)}
            <th className="border border-slate-700 px-2 py-1 text-slate-400">Role</th>
          </tr>
        </thead>
        <tbody>
          {primes.map((p) => {
            const covers = coverage.get(p.id) ?? new Set<number>()
            return (
              <tr key={p.id}>
                <td className="border border-slate-700 px-2 py-1"><code className="text-green-300">m{p.cells.join(',m')}</code></td>
                {on.map((m) => (
                  <td key={m} className="border border-slate-700 px-1 py-1 text-center">
                    {covers.has(m) ? <span className="text-green-400">●</span> : <span className="text-slate-700">·</span>}
                  </td>
                ))}
                <td className="border border-slate-700 px-2 py-1">
                  {p.essential ? (
                    <span className="text-violet-300">essential (m{uniquelyCovered.get(p.id) ?? ''})</span>
                  ) : (
                    <span className="text-slate-500">optional</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function ExprTermBreakdown({ variables, expression }: { variables: readonly string[]; expression: string }) {
  const rows = expressionTermsWithCells(variables, expression)
  if (rows.length === 0) return null
  return (
    <ExpandableSection title="Term → input combinations (which rows each term covers)">
      <ul className="text-sm text-slate-300 space-y-2">
        {rows.map((r) => (
          <li key={r.term}>
            <code className="text-green-300">{r.term}</code> covers <Pills items={r.minterms} />
          </li>
        ))}
      </ul>
    </ExpandableSection>
  )
}

/* ------------------------- main panel ------------------------- */

export default function AdvancedPanel() {
  const { variables, model: kmap, setModel, setShowSOP, selectedCells } = useKMapStore()

  const [level, setLevel] = useState<Level>('beginner')
  const [method, setMethod] = useState<Method>('minterms')
  const [mintermText, setMintermText] = useState('')
  const [maxtermText, setMaxtermText] = useState('')
  const [dontCareText, setDontCareText] = useState('')
  const [expressionText, setExpressionText] = useState('')
  const [truthText, setTruthText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string[]>([])
  const [lastDefined, setLastDefined] = useState<readonly number[] | null>(null)
  const [history, setHistory] = useState<readonly HistoryEntry[]>([])
  const [studentExpr, setStudentExpr] = useState('')

  const total = 2 ** variables.length

  const explicitDef = useMemo(() => kmapToDefinition(kmap), [kmap])
  const onSet = explicitDef.minterms

  const analysis = useMemo(() => {
    const prime = computePrimeImplicants(kmap)
    const matrix = coverageMatrix(kmap)
    const simp = performSimplification(kmap)
    const on = new Set(minterms(kmap))
    const off = new Set(maxterms(kmap))
    const dc = new Set(dontCares(kmap))
    const canon = canonicalForms(variables, on, off, dc)
    const costSop = costOfSimplification(variables, 'sop', on, off, dc)
    const costPos = costOfSimplification(variables, 'pos', on, off, dc)
    const modeEngine: 'sop' | 'pos' = costSop.literals <= costPos.literals ? 'sop' : 'pos'
    const primary = modeEngine === 'sop' ? simp.sop : simp.pos
    const comparison = compareSolutions(
      variables,
      modeEngine,
      primary,
      modeEngine === 'sop' ? simp.pos : simp.sop,
    )
    return { prime, matrix, simp, canon, costSop, costPos, modeEngine, primary, comparison }
  }, [kmap, variables])

  const changedSinceDefine =
    lastDefined !== null &&
    (onSet.length !== lastDefined.length ||
      onSet.some((m) => !lastDefined?.includes(m)) ||
      lastDefined.some((m) => !onSet.includes(m)))

  const eof = {
    minterms: explicitDef.minterms,
    maxterms: explicitDef.maxterms,
    dontCares: explicitDef.dontCares,
  }

  function applyDefinition(def: FunctionDefinition, explain: string[]) {
    setModel(definitionToKMap(def))
    setShowSOP(def.minterms.length > 0)
    setLastDefined([...def.minterms])
    setNotice(explain)
    setError(null)
    const mode = def.minterms.length > 0 ? 'sop' : 'pos'
    const cost = costOfSimplification(variables, mode, new Set(def.minterms), new Set(def.maxterms), new Set(def.dontCares))
    setHistory((prev) =>
      recordHistory(prev, {
        id: prev.length + 1,
        expression: mode === 'sop' && analysis.simp.sop ? analysis.simp.sop : analysis.simp.pos,
        mode,
        terms: cost.terms,
        literals: cost.literals,
        timestamp: Date.now(),
      }),
    )
  }

  function readList(text: string, allowEmpty: boolean): readonly number[] {
    const { values } = parseValidatedIndices(text, total, allowEmpty)
    return values
  }

  function handleDefineMinterms() {
    try {
      const mins = readList(mintermText, true)
      const dcs = readList(dontCareText, true)
      const def = defineFunction(variables, mins, [], dcs)
      applyDefinition(def, [
        ...mintermExplanation(variables, def.minterms),
        ...(def.dontCares.length ? dontCareLines(def.dontCares) : []),
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input.')
    }
  }

  function handleDefineMaxterms() {
    try {
      const x = readList(maxtermText, true)
      const dcs = readList(dontCareText, true)
      const def = defineFunction(variables, [], x, dcs)
      applyDefinition(def, [
        ...maxtermExplanation(variables, def.maxterms),
        ...(def.dontCares.length ? dontCareLines(def.dontCares) : []),
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input.')
    }
  }

  function handleDefineExpression() {
    try {
      const expr = expressionText.trim()
      if (!expr) throw new DefinitionError({ code: 'EMPTY', message: 'Enter a Boolean expression, e.g. AB + A\'C.' })
      const { definition, mode } = expressionToDefinition(variables, expr)
      setModel(definitionToKMap(definition))
      setShowSOP(mode === 'sop')
      setLastDefined([...definition.minterms])
      setNotice([
        `Evaluated "${expr}" → ${definition.minterms.length} ON minterm(s): m${definition.minterms.join(', m')}.`,
        'The expression is now mapped on the K-map; scroll down to Advanced analysis for its minimal solution.',
      ])
      setError(null)
      setHistory((prev) =>
        recordHistory(prev, {
          id: prev.length + 1,
          expression: expr,
          mode,
          terms: definition.minterms.length || 1,
          literals: expr.replace(/[+·.()\s']/g, '').length,
          timestamp: Date.now(),
        }),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid expression.')
    }
  }

  function handleDefineTruth() {
    try {
      const clean = truthText.trim()
      if (!clean) throw new DefinitionError({ code: 'EMPTY', message: 'Enter one output (0, 1, or X) per row, in order from row 0.' })
      const parts = clean.split(/[\s,;]+/).filter((p) => p !== '')
      if (parts.length !== total) {
        throw new DefinitionError({
          code: 'RANGE',
          message: `This function has ${total} rows (row 0 to ${total - 1}). You entered ${parts.length} output value(s).`,
        })
      }
      for (const p of parts) {
        if (p !== '0' && p !== '1' && p.toLowerCase() !== 'x') {
          throw new DefinitionError({ code: 'MALFORMED', message: `"${p}" is not a valid output (use 0, 1, or X).` })
        }
      }
      const outputs = parts.map((p) => (p === '0' ? 0 : p === '1' ? 1 : 'X')) as (0 | 1 | 'X')[]
      const def = outputsToDefinition(variables, outputs)
      applyDefinition(def, [`Applied your truth table: ${def.minterms.length} row(s) output 1 and are marked as minterms on the map.`])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid truth table.')
    }
  }

  const strategy = useMemo(() => {
    const cells = [...selectedCells]
    if (cells.length === 0) return []
    return groupingStrategy(kmap, [cells], analysis.modeEngine)
  }, [kmap, selectedCells, analysis.modeEngine])

  const progression = useMemo(() => {
    const { intro, prime, essential } = implicantProgression()
    return [intro, prime, essential]
  }, [])

  const methodInputs: Record<Method, {
    label: string
    help?: React.ReactNode
    fields: React.ReactNode[]
    action: () => void
    actionLabel: string
  }> = {
    minterms: {
      label: 'Type the minterm indices that must output 1, e.g. Σm(1, 3, 5, 7). Optional don\'t-cares below.  e.g. d(4, 6)',
      fields: [
        <input
          key="m"
          value={mintermText}
          onChange={(e) => setMintermText(e.target.value)}
          placeholder="Σm(1,3,5,7)  or  1,3,5,7"
          className={INPUT_CLS}
          aria-label="Minterm indices"
        />,
        <input
          key="d"
          value={dontCareText}
          onChange={(e) => setDontCareText(e.target.value)}
          placeholder="Don't-cares — e.g. d(4,6)"
          className={INPUT_CLS}
          aria-label="Don't-care indices"
        />,
      ],
      action: handleDefineMinterms,
      actionLabel: 'Apply minterms',
    },
    maxterms: {
      label: 'Type the maxterm indices that must output 0, e.g. ΠM(0, 2). The remaining cells become 1 (the ON-set).',
      fields: [
        <input
          key="x"
          value={maxtermText}
          onChange={(e) => setMaxtermText(e.target.value)}
          placeholder="ΠM(0,2)  or  0,2"
          className={INPUT_CLS}
          aria-label="Maxterm indices"
        />,
        <input
          key="d"
          value={dontCareText}
          onChange={(e) => setDontCareText(e.target.value)}
          placeholder="Don't-cares — e.g. d(4,6)"
          className={INPUT_CLS}
          aria-label="Don't-care indices"
        />,
      ],
      action: handleDefineMaxterms,
      actionLabel: 'Apply maxterms',
    },
    expression: {
      label: "Enter a minimal SOP Boolean expression. Operators: + (OR), · or juxtaposition (AND), ' (NOT). Example: A'B + AB'",
      fields: [
        <input
          key="e"
          value={expressionText}
          onChange={(e) => setExpressionText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleDefineExpression() }}
          placeholder="A'B + AB'"
          className={INPUT_CLS}
          aria-label="Boolean expression"
        />,
      ],
      action: handleDefineExpression,
      actionLabel: 'Evaluate → map',
    },
    truth: {
      label: `Type one output for each of the ${total} rows, in order from row 0 (e.g. 0 1 X 1 for 2 variables). X = don't-care.`,
      fields: [
        <input
          key="t"
          value={truthText}
          onChange={(e) => setTruthText(e.target.value)}
          placeholder={Array.from({ length: total }, () => '0').join(' ')}
          className={INPUT_CLS}
          aria-label="Truth table outputs"
        />,
      ],
      action: handleDefineTruth,
      actionLabel: 'Apply truth table',
    },
  }

  return (
    <div className="mt-8">
      <ExpandableSection title="Connect Representations: Define & Analyze" defaultExpanded={false}>
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-slate-300 text-sm">
              Define a function one way, see it on the K-map, and analyze its simplified solution.
            </p>
            <div className="inline-flex rounded bg-slate-700 p-0.5" role="group" aria-label="View level">
              {(['beginner', 'advanced'] as Level[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={`px-3 py-1 rounded text-sm capitalize transition-colors ${level === l ? 'bg-violet-600 text-white' : 'text-slate-300 hover:text-white'}`}
                  aria-pressed={level === l}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {level === 'advanced' && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
              {GLOSSARY.map((g) => <GlossaryTip key={g.term} word={g.term} />)}
            </div>
          )}

          <div>
            <NiceHeader title="Define the function" hint="Pick a representation. Whatever you set appears instantly on the K-map, and the map stays the source of truth." />
            <div className="flex flex-wrap gap-2 mb-3">
              {(Object.keys(METHOD_LABELS) as Method[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMethod(m); setError(null) }}
                  className={`px-3 py-1.5 rounded border text-sm transition-colors ${method === m ? 'border-violet-400 bg-violet-600/20 text-white' : 'border-slate-600 text-slate-300 hover:border-violet-400'}`}
                  aria-pressed={method === m}
                >
                  {METHOD_LABELS[m]}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-slate-400 text-sm">{methodInputs[method].label}</p>
              {methodInputs[method].fields}
              <button type="button" onClick={methodInputs[method].action} className="px-4 py-2 rounded bg-violet-600 hover:bg-violet-500 text-white text-sm">
                {methodInputs[method].actionLabel}
              </button>
            </div>
          </div>

          {error && <ErrorBox message={error} />}
          <Notice lines={notice} />

          {changedSinceDefine && (
            <div className="rounded bg-amber-950/60 border border-amber-700/60 px-3 py-2 text-amber-300 text-sm" role="note">
              The function has changed since you defined it (you painted cells directly on the K-map). The map is now the source of truth; the analysis below reflects the current map, not your last typed input.
            </div>
          )}

          {method === 'expression' && expressionText.trim() !== '' && (
            <ExprTermBreakdown variables={variables} expression={expressionText.trim()} />
          )}
          {method === 'expression' && expressionText.trim() !== '' && !error && (
            <ExpandableSection title="Expression → truth table (each row's output)">
              <ExpressionChainView variables={variables} expression={expressionText.trim()} on={onSet} />
            </ExpandableSection>
          )}

          {level === 'advanced' && (
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
                      onChange={(e) => setStudentExpr(e.target.value)}
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
          )}
        </div>
      </ExpandableSection>
    </div>
  )
}

const INPUT_CLS =
  'w-full rounded bg-slate-900 border border-slate-600 px-3 py-2 text-slate-100 text-sm font-mono focus:border-violet-400 focus:outline-none'

function dontCareLines(dc: readonly number[]): string[] {
  return [
    `You also marked cell(s) m${dc.join(', m')} as don't-care.`,
    'Don\'t-care cells may be used to build larger groups but are never required coverage.',
  ]
}

function ExpressionChainView({ variables, expression, on }: { variables: readonly string[]; expression: string; on: readonly number[] }) {
  const chain = useMemo(() => expressionChain(variables, expression), [variables, expression])
  const onSet = useMemo(() => new Set(on), [on])
  return (
    <div className="overflow-x-auto">
      <table className="text-xs text-slate-200 border-collapse">
        <thead>
          <tr>
            <th className="border border-slate-700 px-2 py-1 text-left text-slate-400">Row</th>
            <th className="border border-slate-700 px-2 py-1 text-left text-slate-400">Inputs</th>
            <th className="border border-slate-700 px-2 py-1 text-left text-slate-400">Output</th>
            <th className="border border-slate-700 px-2 py-1 text-left text-slate-400">On K-map?</th>
          </tr>
        </thead>
        <tbody>
          {chain.rows.map((r) => (
            <tr key={r.minterm}>
              <td className="border border-slate-700 px-2 py-1">m{r.minterm}</td>
              <td className="border border-slate-700 px-2 py-1 font-mono">{r.binary}</td>
              <td className="border border-slate-700 px-2 py-1">{r.output}</td>
              <td className="border border-slate-700 px-2 py-1">{onSet.has(r.minterm) ? '1' : '0'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}