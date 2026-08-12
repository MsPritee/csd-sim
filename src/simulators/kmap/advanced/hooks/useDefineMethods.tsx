import { useState } from 'react'
import type { KMapModel } from '../../../../core/kmap'
import {
  definitionToKMap,
  expressionToDefinition,
  outputsToDefinition,
  parseValidatedIndices,
  defineFunction,
  DefinitionError,
  type FunctionDefinition,
} from '../../../../core/kmap/definition'
import {
  costOfSimplification,
  recordHistory,
  type HistoryEntry,
} from '../../../../core/kmap/solutions'
import { mintermExplanation, maxtermExplanation } from '../../../../education/advanced'
import { INPUT_CLS } from '../inputClass'
import type { Method, MethodInputs } from '../DefineFunctionPanel'

interface UseDefineMethodsOptions {
  variables: readonly string[]
  onSet: readonly number[]
  simplified: { sop: string; pos: string }
  setModel: (model: KMapModel) => void
  setShowSOP: (showSOP: boolean) => void
}

export function useDefineMethods({
  variables,
  onSet,
  simplified,
  setModel,
  setShowSOP,
}: UseDefineMethodsOptions) {
  const total = 2 ** variables.length

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

  const changedSinceDefine =
    lastDefined !== null &&
    (onSet.length !== lastDefined.length ||
      onSet.some((m) => !lastDefined?.includes(m)) ||
      lastDefined.some((m) => !onSet.includes(m)))

  function selectMethod(m: Method) {
    setMethod(m)
    setError(null)
  }

  function applyDefinition(def: FunctionDefinition, explain: string[]) {
    setModel(definitionToKMap(def))
    setShowSOP(def.minterms.length > 0)
    setLastDefined([...def.minterms])
    setNotice(explain)
    setError(null)
    const mode = def.minterms.length > 0 ? 'sop' : 'pos'
    const cost = costOfSimplification(
      variables,
      mode,
      new Set(def.minterms),
      new Set(def.maxterms),
      new Set(def.dontCares),
    )
    setHistory((prev) =>
      recordHistory(prev, {
        id: prev.length + 1,
        expression: mode === 'sop' && simplified.sop ? simplified.sop : simplified.pos,
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

  const methodInputs: MethodInputs = {
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

  return {
    method,
    selectMethod,
    error,
    notice,
    changedSinceDefine,
    expressionText,
    methodInputs,
    history,
  }
}

function dontCareLines(dc: readonly number[]): string[] {
  return [
    `You also marked cell(s) m${dc.join(', m')} as don't-care.`,
    'Don\'t-care cells may be used to build larger groups but are never required coverage.',
  ]
}