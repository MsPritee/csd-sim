/**
 * NumberSystemEducation - Visual educational content for number systems
 * Shows minimal text with maximum visualization for easy understanding
 */

import { Card } from '../../components/ui/Card'

interface NumberSystemEducationProps {
  readonly system: 'decimal' | 'binary' | 'octal' | 'hexadecimal' | 'bcd' | 'excess3' | 'graycode'
}

export function NumberSystemEducation({ system }: NumberSystemEducationProps) {
  const renderDecimalEducation = () => (
    <div className="space-y-6">
      {/* Base Visualization */}
      <Card className="education-card">
        <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--accent-primary)' }}>
          Base 10 - Why 10?
        </h3>
        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <div
              key={num}
              className="w-12 h-12 flex items-center justify-center rounded-lg font-bold text-xl"
              style={{ 
                backgroundColor: 'var(--accent-primary)', 
                color: 'white' 
              }}
            >
              {num}
            </div>
          ))}
        </div>
        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          🖐️ We have 10 fingers, so we count in groups of 10!
        </p>
      </Card>

      {/* Position Values */}
      <Card className="education-card">
        <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--accent-primary)' }}>
          Position Values
        </h3>
        <div className="flex justify-center items-end gap-2 flex-wrap">
          {['1000', '100', '10', '1'].map((value, i) => (
            <div key={value} className="text-center">
              <div
                className="w-16 h-16 flex items-center justify-center rounded-lg font-bold mb-2"
                style={{ 
                  backgroundColor: `var(--accent-primary)`,
                  opacity: 1 - (i * 0.2),
                  color: 'white' 
                }}
              >
                {value}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                10<sup>{3-i}</sup>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
          Each position is 10× the value to its right
        </p>
      </Card>

      {/* Example */}
      <Card className="education-card">
        <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--accent-primary)' }}>
          Example: 345
        </h3>
        <div className="flex justify-center items-center gap-2 flex-wrap">
          <div className="text-center">
            <div className="w-14 h-14 flex items-center justify-center rounded-lg font-bold text-xl"
                 style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}>
              3
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>× 100</div>
          </div>
          <div className="text-xl" style={{ color: 'var(--text-secondary)' }}>+</div>
          <div className="text-center">
            <div className="w-14 h-14 flex items-center justify-center rounded-lg font-bold text-xl"
                 style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)' }}>
              4
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>× 10</div>
          </div>
          <div className="text-xl" style={{ color: 'var(--text-secondary)' }}>+</div>
          <div className="text-center">
            <div className="w-14 h-14 flex items-center justify-center rounded-lg font-bold text-xl"
                 style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-text)' }}>
              5
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>× 1</div>
          </div>
          <div className="text-xl" style={{ color: 'var(--text-secondary)' }}>=</div>
          <div className="text-center">
            <div className="w-16 h-14 flex items-center justify-center rounded-lg font-bold text-xl"
                 style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
              345
            </div>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderBinaryEducation = () => (
    <div className="space-y-6">
      {/* Base Visualization */}
      <Card className="education-card">
        <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--accent-primary)' }}>
          Base 2 - Why 2?
        </h3>
        <div className="flex justify-center gap-4 mb-4">
          <div className="text-center">
            <div
              className="w-20 h-20 flex items-center justify-center rounded-lg font-bold text-3xl mb-2"
              style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}
            >
              0
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>OFF</div>
          </div>
          <div className="text-center">
            <div
              className="w-20 h-20 flex items-center justify-center rounded-lg font-bold text-3xl mb-2"
              style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
            >
              1
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>ON</div>
          </div>
        </div>
        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          💡 Computers use ON/OFF switches, so only 2 digits!
        </p>
      </Card>

      {/* Position Values */}
      <Card className="education-card">
        <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--accent-primary)' }}>
          Position Values (Powers of 2)
        </h3>
        <div className="flex justify-center items-end gap-2 flex-wrap">
          {['128', '64', '32', '16', '8', '4', '2', '1'].map((value, i) => (
            <div key={value} className="text-center">
              <div
                className="w-12 h-12 flex items-center justify-center rounded-lg font-bold mb-2"
                style={{ 
                  backgroundColor: 'var(--accent-primary)',
                  opacity: 1 - (i * 0.1),
                  color: 'white' 
                }}
              >
                {value}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                2<sup>{7-i}</sup>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
          Each position is 2× the value to its right
        </p>
      </Card>

      {/* Example */}
      <Card className="education-card">
        <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--accent-primary)' }}>
          Example: 1011₂
        </h3>
        <div className="flex justify-center items-center gap-2 flex-wrap">
          {['1', '0', '1', '1'].map((bit, i) => {
            const weights = ['8', '4', '2', '1']
            const isActive = bit === '1'
            return (
              <div key={i} className="text-center">
                <div
                  className="w-14 h-14 flex items-center justify-center rounded-lg font-bold text-2xl mb-1"
                  style={{ 
                    backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    color: isActive ? 'white' : 'var(--text-secondary)' 
                  }}
                >
                  {bit}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>× {weights[i]}</div>
              </div>
            )
          })}
          <div className="text-2xl" style={{ color: 'var(--text-secondary)' }}>=</div>
          <div className="text-center">
            <div className="w-16 h-14 flex items-center justify-center rounded-lg font-bold text-2xl"
                 style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}>
              11
            </div>
          </div>
        </div>
        <p className="text-center text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
          8 + 0 + 2 + 1 = 11
        </p>
      </Card>
    </div>
  )

  const renderOctalEducation = () => (
    <div className="space-y-6">
      {/* Base Visualization */}
      <Card className="education-card">
        <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--accent-primary)' }}>
          Base 8 - Why 8?
        </h3>
        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
            <div
              key={num}
              className="w-12 h-12 flex items-center justify-center rounded-lg font-bold text-xl"
              style={{ 
                backgroundColor: 'var(--accent-primary)', 
                color: 'white' 
              }}
            >
              {num}
            </div>
          ))}
        </div>
        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          🎯 Groups of 3 bits = 8 possibilities (2³ = 8)
        </p>
      </Card>

      {/* Position Values */}
      <Card className="education-card">
        <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--accent-primary)' }}>
          Position Values
        </h3>
        <div className="flex justify-center items-end gap-2 flex-wrap">
          {['512', '64', '8', '1'].map((value, i) => (
            <div key={value} className="text-center">
              <div
                className="w-16 h-16 flex items-center justify-center rounded-lg font-bold mb-2"
                style={{ 
                  backgroundColor: 'var(--accent-primary)',
                  opacity: 1 - (i * 0.2),
                  color: 'white' 
                }}
              >
                {value}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                8<sup>{3-i}</sup>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
          Each position is 8× the value to its right
        </p>
      </Card>

      {/* Binary Grouping */}
      <Card className="education-card">
        <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--accent-primary)' }}>
          Binary to Octal Grouping
        </h3>
        <div className="flex justify-center items-center gap-2 flex-wrap">
          <div className="flex gap-1">
            {['1', '0', '1'].map((bit, i) => (
              <div
                key={i}
                className="w-10 h-10 flex items-center justify-center rounded font-bold"
                style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
              >
                {bit}
              </div>
            ))}
          </div>
          <div className="text-2xl" style={{ color: 'var(--text-secondary)' }}>=</div>
          <div
            className="w-12 h-12 flex items-center justify-center rounded-lg font-bold text-xl"
            style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}
          >
            5
          </div>
        </div>
        <p className="text-center text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
          101₂ = 5₈ (4 + 0 + 1 = 5)
        </p>
      </Card>
    </div>
  )

  const renderHexadecimalEducation = () => (
    <div className="space-y-6">
      {/* Base Visualization */}
      <Card className="education-card">
        <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--accent-primary)' }}>
          Base 16 - Why 16?
        </h3>
        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F'].map((num, i) => (
            <div
              key={i}
              className="w-10 h-10 flex items-center justify-center rounded-lg font-bold"
              style={{ 
                backgroundColor: i >= 10 ? 'var(--warning-bg)' : 'var(--accent-primary)',
                color: i >= 10 ? 'var(--warning-text)' : 'white'
              }}
            >
              {num}
            </div>
          ))}
        </div>
        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          🎨 Groups of 4 bits = 16 possibilities (2⁴ = 16)
        </p>
      </Card>

      {/* Letter Values */}
      <Card className="education-card">
        <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--accent-primary)' }}>
          Letter Values
        </h3>
        <div className="flex justify-center gap-2 flex-wrap">
          {['A=10', 'B=11', 'C=12', 'D=13', 'E=14', 'F=15'].map((item) => (
            <div key={item} className="text-center">
              <div
                className="w-12 h-12 flex items-center justify-center rounded-lg font-bold"
                style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)' }}
              >
                {item[0]}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {item.split('=')[1]}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Binary Grouping */}
      <Card className="education-card">
        <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--accent-primary)' }}>
          Binary to Hex Grouping
        </h3>
        <div className="flex justify-center items-center gap-2 flex-wrap">
          <div className="flex gap-1">
            {['1', '1', '1', '1'].map((bit, i) => (
              <div
                key={i}
                className="w-8 h-8 flex items-center justify-center rounded font-bold text-sm"
                style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
              >
                {bit}
              </div>
            ))}
          </div>
          <div className="text-2xl" style={{ color: 'var(--text-secondary)' }}>=</div>
          <div
            className="w-12 h-12 flex items-center justify-center rounded-lg font-bold text-xl"
            style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)' }}
          >
            F
          </div>
        </div>
        <p className="text-center text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
          1111₂ = F₁₆ (8 + 4 + 2 + 1 = 15)
        </p>
      </Card>
    </div>
  )

  const renderBCDEducation = () => (
    <div className="space-y-6">
      {/* What is BCD */}
      <Card className="education-card">
        <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--accent-primary)' }}>
          What is BCD?
        </h3>
        <div className="text-center mb-4">
          <div className="inline-block px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
              Binary Coded Decimal
            </span>
          </div>
        </div>
        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Each decimal digit gets its own 4-bit binary code
        </p>
      </Card>

      {/* Example */}
      <Card className="education-card">
        <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--accent-primary)' }}>
          Example: 45 in BCD
        </h3>
        <div className="flex justify-center items-center gap-4 flex-wrap">
          <div className="text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-lg font-bold text-2xl mb-2"
                 style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
              4
            </div>
            <div className="flex gap-1 justify-center">
              {['0', '1', '0', '0'].map((bit, i) => (
                <div
                  key={i}
                  className="w-8 h-8 flex items-center justify-center rounded font-bold text-sm"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  {bit}
                </div>
              ))}
            </div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-lg font-bold text-2xl mb-2"
                 style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
              5
            </div>
            <div className="flex gap-1 justify-center">
              {['0', '1', '0', '1'].map((bit, i) => (
                <div
                  key={i}
                  className="w-8 h-8 flex items-center justify-center rounded font-bold text-sm"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  {bit}
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-center text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
          4 → 0100, 5 → 0101, so 45 → 0100 0101
        </p>
      </Card>

      {/* Why BCD */}
      <Card className="education-card">
        <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--accent-primary)' }}>
          Why BCD?
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: 'var(--success-bg)' }}>
            <span>✓</span>
            <span className="text-sm" style={{ color: 'var(--success-text)' }}>
              Easy conversion to/from decimal
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: 'var(--warning-bg)' }}>
            <span>⚠️</span>
            <span className="text-sm" style={{ color: 'var(--warning-text)' }}>
              Uses more space than pure binary
            </span>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderExcess3Education = () => (
    <div className="space-y-6">
      {/* What is Excess-3 */}
      <Card className="education-card">
        <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--accent-primary)' }}>
          What is Excess-3?
        </h3>
        <div className="text-center mb-4">
          <div className="inline-block px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
              BCD + 3
            </span>
          </div>
        </div>
        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Add 3 to each decimal digit before converting to binary
        </p>
      </Card>

      {/* Example */}
      <Card className="education-card">
        <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--accent-primary)' }}>
          Example: 4 in Excess-3
        </h3>
        <div className="flex justify-center items-center gap-2 flex-wrap">
          <div className="text-center">
            <div className="w-14 h-14 flex items-center justify-center rounded-lg font-bold text-xl mb-2"
                 style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
              4
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Decimal</div>
          </div>
          <div className="text-xl" style={{ color: 'var(--text-secondary)' }}>+</div>
          <div className="text-center">
            <div className="w-14 h-14 flex items-center justify-center rounded-lg font-bold text-xl mb-2"
                 style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)' }}>
              3
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Add 3</div>
          </div>
          <div className="text-xl" style={{ color: 'var(--text-secondary)' }}>=</div>
          <div className="text-center">
            <div className="w-14 h-14 flex items-center justify-center rounded-lg font-bold text-xl mb-2"
                 style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}>
              7
            </div>
            <div className="flex gap-1 justify-center">
              {['0', '1', '1', '1'].map((bit, i) => (
                <div
                  key={i}
                  className="w-8 h-8 flex items-center justify-center rounded font-bold text-sm"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  {bit}
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-center text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
          4 + 3 = 7 → 0111
        </p>
      </Card>

      {/* Why Excess-3 */}
      <Card className="education-card">
        <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--accent-primary)' }}>
          Why Excess-3?
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: 'var(--success-bg)' }}>
            <span>✓</span>
            <span className="text-sm" style={{ color: 'var(--success-text)' }}>
              Self-complementing (9's complement)
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: 'var(--success-bg)' }}>
            <span>✓</span>
            <span className="text-sm" style={{ color: 'var(--success-text)' }}>
              No invalid states like BCD
            </span>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderGrayCodeEducation = () => (
    <div className="space-y-6">
      {/* What is Gray Code */}
      <Card className="education-card">
        <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--accent-primary)' }}>
          What is Gray Code?
        </h3>
        <div className="text-center mb-4">
          <div className="inline-block px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
              Only 1 bit changes at a time
            </span>
          </div>
        </div>
        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Also called "reflected binary code"
        </p>
      </Card>

      {/* Comparison */}
      <Card className="education-card">
        <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--accent-primary)' }}>
          Binary vs Gray Code
        </h3>
        <div className="space-y-2">
          {[
            { decimal: 0, binary: '000', gray: '000' },
            { decimal: 1, binary: '001', gray: '001' },
            { decimal: 2, binary: '010', gray: '011' },
            { decimal: 3, binary: '011', gray: '010' },
            { decimal: 4, binary: '100', gray: '110' },
          ].map((row, i) => (
            <div key={i} className="flex justify-center items-center gap-2 flex-wrap">
              <div className="w-8 text-center font-bold" style={{ color: 'var(--text-primary)' }}>
                {row.decimal}
              </div>
              <div className="flex gap-1">
                {row.binary.split('').map((bit, j) => (
                  <div
                    key={j}
                    className="w-8 h-8 flex items-center justify-center rounded font-bold text-sm"
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  >
                    {bit}
                  </div>
                ))}
              </div>
              <div className="text-xl" style={{ color: 'var(--text-secondary)' }}>→</div>
              <div className="flex gap-1">
                {row.gray.split('').map((bit, j) => (
                  <div
                    key={j}
                    className="w-8 h-8 flex items-center justify-center rounded font-bold text-sm"
                    style={{ 
                      backgroundColor: i > 0 && bit !== ['000', '001', '011', '010', '110'][i-1][j] 
                        ? 'var(--accent-primary)' 
                        : 'var(--bg-tertiary)',
                      color: i > 0 && bit !== ['000', '001', '011', '010', '110'][i-1][j] 
                        ? 'white' 
                        : 'var(--text-primary)' 
                    }}
                  >
                    {bit}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
          🔵 Highlighted bits change from previous number
        </p>
      </Card>

      {/* Why Gray Code */}
      <Card className="education-card">
        <h3 className="text-lg font-bold mb-4 text-center" style={{ color: 'var(--accent-primary)' }}>
          Why Gray Code?
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: 'var(--success-bg)' }}>
            <span>✓</span>
            <span className="text-sm" style={{ color: 'var(--success-text)' }}>
              Prevents errors in mechanical encoders
            </span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: 'var(--success-bg)' }}>
            <span>✓</span>
            <span className="text-sm" style={{ color: 'var(--success-text)' }}>
              Used in error correction systems
            </span>
          </div>
        </div>
      </Card>
    </div>
  )

  const contentMap = {
    decimal: renderDecimalEducation,
    binary: renderBinaryEducation,
    octal: renderOctalEducation,
    hexadecimal: renderHexadecimalEducation,
    bcd: renderBCDEducation,
    excess3: renderExcess3Education,
    graycode: renderGrayCodeEducation,
  }

  const renderContent = contentMap[system]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center" style={{ color: 'var(--text-primary)' }}>
          {system.replace('-', ' ').toUpperCase()}
        </h2>
      </div>
      {renderContent()}
    </div>
  )
}
