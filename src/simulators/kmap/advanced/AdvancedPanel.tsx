import { useMemo, useState } from 'react'
import { useKMapStore } from '../../../stores/kmapStore'
import { minterms, maxterms, dontCares } from '../../../core/kmap'
import { performSimplification } from '../../../application/kmap'
import { kmapToDefinition } from '../../../core/kmap/definition'
import {
  computePrimeImplicants,
  coverageMatrix,
} from '../../../core/kmap/prime-implicants'
import {
  canonicalForms,
  compareSolutions,
  costOfSimplification,
} from '../../../core/kmap/solutions'
import {
  groupingStrategy,
  implicantProgression,
  GLOSSARY,
} from '../../../education/advanced'
import ExpandableSection from '../components/ExpandableSection'
import type { Analysis } from './analysis'
import DefineFunctionPanel from './DefineFunctionPanel'
import SolutionAnalysisPanel from './SolutionAnalysisPanel'
import GlossaryTip from './GlossaryTip'
import { useDefineMethods } from './hooks/useDefineMethods'

type Level = 'beginner' | 'advanced'

export default function AdvancedPanel() {
  const { variables, model: kmap, setModel, setShowSOP, selectedCells } = useKMapStore()

  const [level, setLevel] = useState<Level>('beginner')
  const [studentExpr, setStudentExpr] = useState('')

  const explicitDef = useMemo(() => kmapToDefinition(kmap), [kmap])
  const onSet = explicitDef.minterms

  const analysis: Analysis = useMemo(() => {
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

  const {
    method,
    selectMethod,
    error,
    notice,
    changedSinceDefine,
    expressionText,
    methodInputs,
    history,
  } = useDefineMethods({
    variables,
    onSet,
    simplified: analysis.simp,
    setModel,
    setShowSOP,
  })

  const eof = {
    minterms: explicitDef.minterms,
    maxterms: explicitDef.maxterms,
    dontCares: explicitDef.dontCares,
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

  return (
    <div className="mt-8">
      <ExpandableSection title="Connect Representations: Define & Analyze" defaultExpanded={false}>
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
              Define a function one way, see it on the K-map, and analyze its simplified solution.
            </p>
            <div className="inline-flex rounded p-0.5" style={{ background: 'var(--border-light)' }} role="group" aria-label="View level">
              {(['beginner', 'advanced'] as Level[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={`px-3 py-1 rounded text-sm capitalize transition-colors`}
                  style={{
                    ...(level === l
                      ? { background: 'var(--accent-primary)', color: 'var(--text-primary)' }
                      : { color: 'var(--text-primary)' }),
                  }}
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

          <DefineFunctionPanel
            method={method}
            onSelectMethod={selectMethod}
            error={error}
            notice={notice}
            changedSinceDefine={changedSinceDefine}
            variables={variables}
            expressionText={expressionText}
            onSet={onSet}
            methodInputs={methodInputs}
          />

          {level === 'advanced' && (
            <SolutionAnalysisPanel
              analysis={analysis}
              kmap={kmap}
              progression={progression}
              strategy={strategy}
              history={history}
              studentExpr={studentExpr}
              onStudentExprChange={setStudentExpr}
              eof={eof}
            />
          )}
        </div>
      </ExpandableSection>
    </div>
  )
}
