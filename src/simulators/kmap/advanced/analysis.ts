import { performSimplification } from '../../../application/kmap'
import { computePrimeImplicants, coverageMatrix } from '../../../core/kmap/prime-implicants'
import { canonicalForms, compareSolutions, costOfSimplification } from '../../../core/kmap/solutions'

export type Analysis = {
  prime: ReturnType<typeof computePrimeImplicants>
  matrix: ReturnType<typeof coverageMatrix>
  simp: ReturnType<typeof performSimplification>
  canon: ReturnType<typeof canonicalForms>
  costSop: ReturnType<typeof costOfSimplification>
  costPos: ReturnType<typeof costOfSimplification>
  modeEngine: 'sop' | 'pos'
  primary: string
  comparison: ReturnType<typeof compareSolutions>
}