import { expressionTermsWithCells } from '../../../education/advanced'
import ExpandableSection from '../components/ExpandableSection'
import Pills from './Pills'

export default function ExprTermBreakdown({ variables, expression }: { variables: readonly string[]; expression: string }) {
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