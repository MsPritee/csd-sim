/**
 * AdvancedVisualization - Advanced visualizations for number systems
 * Includes bit grouping, nibble analysis, and pattern visualization
 */

import type { BitGroupingResult } from '../../core/numbersystems/types'
import { Card } from '../../components/ui'
import { Alert } from '../../components/ui'

interface AdvancedVisualizationProps {
  readonly binary: string
  readonly hexadecimal: string
  readonly octal: string
  readonly bitGrouping: BitGroupingResult
  readonly bitAnalysis: {
    bitCount: number
    onesCount: number
    zerosCount: number
    isPowerOfTwo: boolean
  }
}

export function AdvancedVisualization({
  binary,
  hexadecimal,
  octal,
  bitGrouping,
  bitAnalysis,
}: AdvancedVisualizationProps) {
  return (
    <div className="space-y-6">
      {/* Bit Grouping Visualization */}
      <Card title="Bit Grouping Analysis">
        {bitGrouping.success ? (
          <div className="space-y-4">
            {/* Binary with nibble grouping */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Binary (grouped by nibbles for hex)
              </label>
              <div className="flex flex-wrap gap-2">
                {bitGrouping.nibbles.map((nibble, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 rounded-md border"
                    style={{ backgroundColor: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}
                  >
                    <div className="font-mono text-sm" style={{ color: 'var(--accent-text)' }}>
                      {nibble.bits.join('')}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--accent-primary)' }}>
                      {nibble.hexDigit} ({nibble.decimalValue})
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Binary with octal grouping */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Binary (grouped by 3 bits for octal)
              </label>
              <div className="flex flex-wrap gap-2">
                {bitGrouping.octalGroups.map((group, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 rounded-md border"
                    style={{ backgroundColor: 'var(--warning-bg)', borderColor: 'var(--warning-border)' }}
                  >
                    <div className="font-mono text-sm" style={{ color: 'var(--warning-text)' }}>{group}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grouped binary string */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Grouped Binary String
              </label>
              <div
                className="font-mono text-sm p-3 rounded-md border"
                style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
              >
                {bitGrouping.groupedBinary}
              </div>
            </div>
          </div>
        ) : (
          <Alert variant="error">
            Unable to display bit grouping: {bitGrouping.error}
          </Alert>
        )}
      </Card>

      {/* Bit Pattern Analysis */}
      <Card title="Bit Pattern Analysis">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            className="p-4 rounded-md border"
            style={{ backgroundColor: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}
          >
            <div className="text-sm mb-1" style={{ color: 'var(--accent-primary)' }}>Total Bits</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--accent-text)' }}>{bitAnalysis.bitCount}</div>
          </div>

          <div
            className="p-4 rounded-md border"
            style={{ backgroundColor: 'var(--success-bg)', borderColor: 'var(--success-border)' }}
          >
            <div className="text-sm mb-1" style={{ color: 'var(--success-primary)' }}>Ones (1)</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--success-text)' }}>{bitAnalysis.onesCount}</div>
          </div>

          <div
            className="p-4 rounded-md border"
            style={{ backgroundColor: 'var(--error-bg)', borderColor: 'var(--error-border)' }}
          >
            <div className="text-sm mb-1" style={{ color: 'var(--error-primary)' }}>Zeros (0)</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--error-text)' }}>{bitAnalysis.zerosCount}</div>
          </div>

          <div
            className="p-4 rounded-md border"
            style={{ backgroundColor: 'var(--warning-bg)', borderColor: 'var(--warning-border)' }}
          >
            <div className="text-sm mb-1" style={{ color: 'var(--warning-primary)' }}>Power of 2</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--warning-text)' }}>
              {bitAnalysis.isPowerOfTwo ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {bitAnalysis.isPowerOfTwo && (
          <Alert variant="warning" className="mt-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm">
              This number is a power of 2 (has exactly one bit set to 1)
            </span>
          </Alert>
        )}
      </Card>

      {/* System Equivalents */}
      <Card title="System Equivalents">
        <div className="space-y-3">
          <div
            className="flex items-center justify-between p-3 rounded-md"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Decimal</span>
            <span className="font-mono text-lg" style={{ color: 'var(--text-primary)' }}>{parseInt(binary, 2)}</span>
          </div>

          <div
            className="flex items-center justify-between p-3 rounded-md"
            style={{ backgroundColor: 'var(--accent-bg)' }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>Binary</span>
            <span className="font-mono text-lg" style={{ color: 'var(--accent-text)' }}>{binary}</span>
          </div>

          <div
            className="flex items-center justify-between p-3 rounded-md"
            style={{ backgroundColor: 'var(--warning-bg)' }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--warning-primary)' }}>Hexadecimal</span>
            <span className="font-mono text-lg" style={{ color: 'var(--warning-text)' }}>{hexadecimal}</span>
          </div>

          <div
            className="flex items-center justify-between p-3 rounded-md"
            style={{ backgroundColor: 'var(--error-bg)' }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--error-primary)' }}>Octal</span>
            <span className="font-mono text-lg" style={{ color: 'var(--error-text)' }}>{octal}</span>
          </div>
        </div>
      </Card>

      {/* Visual Bit Representation */}
      <Card title="Visual Bit Representation">
        <div className="flex flex-wrap gap-1 justify-center">
          {binary.split('').map((bit, index) => (
            <div
              key={index}
              className="w-8 h-8 flex items-center justify-center rounded-md font-mono text-sm font-bold"
              style={{
                backgroundColor: bit === '1' ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                color: bit === '1' ? 'var(--success-text)' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
              }}
              title={`Position ${binary.length - 1 - index} (2^${binary.length - 1 - index})`}
            >
              {bit}
            </div>
          ))}
        </div>

        <div className="mt-4 text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
          Click on bits to see their position values
        </div>
      </Card>
    </div>
  )
}
