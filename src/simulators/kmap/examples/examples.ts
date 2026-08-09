import type { CellValue } from '../../../core/kmap'

export interface KMapExample {
  id: string
  name: string
  description: string
  variables: string[]
  values: CellValue[]
  explanation: string
}

export const EXAMPLES: KMapExample[] = [
  {
    id: 'majority-3',
    name: 'Majority Function (3 variables)',
    description: 'Output is 1 when at least 2 of 3 inputs are 1',
    variables: ['A', 'B', 'C'],
    values: [0, 0, 0, 1, 0, 1, 1, 1], // m0-m7: 000,001,010,011,100,101,110,111
    explanation: 'Majority function: F = AB + AC + BC. Cells m3(011), m5(101), m6(110), m7(111) are 1.'
  },
  {
    id: 'xor-2',
    name: 'XOR Function (2 variables)',
    description: 'Output is 1 when inputs are different',
    variables: ['A', 'B'],
    values: [0, 1, 1, 0], // m0-m3: 00,01,10,11
    explanation: 'XOR function: F = A\'B + AB\'. Cells m1(01) and m2(10) are 1. Cannot be simplified further.'
  },
  {
    id: 'parity-3',
    name: 'Odd Parity (3 variables)',
    description: 'Output is 1 when odd number of inputs are 1',
    variables: ['A', 'B', 'C'],
    values: [0, 1, 1, 0, 1, 0, 0, 1], // m0-m7
    explanation: 'Odd parity: F = A\'B\'C + A\'BC\' + AB\'C\' + ABC. Every other cell is 1 in checkerboard pattern.'
  },
  {
    id: 'and-3',
    name: 'AND Function (3 variables)',
    description: 'Output is 1 only when all inputs are 1',
    variables: ['A', 'B', 'C'],
    values: [0, 0, 0, 0, 0, 0, 0, 1], // Only m7(111) is 1
    explanation: 'AND function: F = ABC. Only cell m7(111) is 1. Simplest possible function.'
  },
  {
    id: 'or-3',
    name: 'OR Function (3 variables)',
    description: 'Output is 1 when at least one input is 1',
    variables: ['A', 'B', 'C'],
    values: [0, 1, 1, 1, 1, 1, 1, 1], // Only m0(000) is 0
    explanation: 'OR function: F = A + B + C. Only cell m0(000) is 0. Complement of AND function.'
  },
  {
    id: 'half-adder-sum',
    name: 'Half Adder Sum',
    description: 'Sum bit of half adder (XOR of inputs)',
    variables: ['A', 'B'],
    values: [0, 1, 1, 0], // Same as XOR
    explanation: 'Half adder sum: F = A ⊕ B = A\'B + AB\'. Used in binary addition.'
  },
  {
    id: 'half-adder-carry',
    name: 'Half Adder Carry',
    description: 'Carry bit of half adder (AND of inputs)',
    variables: ['A', 'B'],
    values: [0, 0, 0, 1], // Same as AND
    explanation: 'Half adder carry: F = AB. Generated when both inputs are 1.'
  },
  {
    id: 'adjacent-pair',
    name: 'Adjacent Pair Example',
    description: 'Simple example showing adjacent cell grouping',
    variables: ['A', 'B', 'C'],
    values: [0, 1, 1, 0, 0, 0, 0, 0], // m1(001) and m2(010) are 1
    explanation: 'Two adjacent 1s: F = A\'BC + AB\'C = A\'C. Shows how grouping eliminates variable B.'
  },
  {
    id: 'four-corner',
    name: 'Four-Corner Group',
    description: 'Example of wrap-around grouping in 4-variable K-map',
    variables: ['A', 'B', 'C', 'D'],
    values: [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0], // Corners m0,m3,m12,m15 are 1
    explanation: 'Four corners are adjacent in K-map: F = B\'D\'. Shows wrap-around adjacency.'
  },
]

export function getExampleById(id: string): KMapExample | undefined {
  return EXAMPLES.find(ex => ex.id === id)
}
