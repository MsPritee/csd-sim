/**
 * NumberSystemsSidebar - Main sidebar for number systems education
 * Features collapsible sections for number systems and conversion systems
 */

import { useState } from 'react'

type SectionType = 'number-systems' | 'conversion-systems' | null
type NumberSystemType = 'decimal' | 'binary' | 'octal' | 'hexadecimal' | 'bcd' | 'excess3' | 'graycode' | null
type ConversionType = 'decimal-to-binary' | 'binary-to-decimal' | 'decimal-to-octal' | 'octal-to-decimal' | 'decimal-to-hex' | 'hex-to-decimal' | null
type DecimalSubType = 'education' | 'learn' | null
type BinarySubType = 'education' | 'learn' | null
type OctalSubType = 'education' | 'learn' | null
type HexadecimalSubType = 'education' | 'learn' | null

interface NumberSystemsSidebarProps {
  readonly onNumberSystemSelect: (system: NumberSystemType) => void
  readonly onConversionSelect: (conversion: ConversionType) => void
  readonly onDecimalSubSelect: (subtype: DecimalSubType) => void
  readonly onBinarySubSelect: (subtype: BinarySubType) => void
  readonly onOctalSubSelect: (subtype: OctalSubType) => void
  readonly onHexadecimalSubSelect: (subtype: HexadecimalSubType) => void
  readonly selectedNumberSystem: NumberSystemType
  readonly selectedConversion: ConversionType
  readonly selectedDecimalSub: DecimalSubType
  readonly selectedBinarySub: BinarySubType
  readonly selectedOctalSub: OctalSubType
  readonly selectedHexadecimalSub: HexadecimalSubType
  readonly isSidebarCollapsed: boolean
  readonly setIsSidebarCollapsed: (collapsed: boolean) => void
  readonly isMobile?: boolean
}

function ChevronIcon({ expanded }: { readonly expanded: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 transition-transform duration-200"
      style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function NumberSystemsSidebar({
  onNumberSystemSelect,
  onConversionSelect,
  onDecimalSubSelect,
  onBinarySubSelect,
  onOctalSubSelect,
  onHexadecimalSubSelect,
  selectedNumberSystem,
  selectedConversion,
  selectedDecimalSub,
  selectedBinarySub,
  selectedOctalSub,
  selectedHexadecimalSub,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isMobile = false,
}: NumberSystemsSidebarProps) {
  const [expandedSection, setExpandedSection] = useState<SectionType>('number-systems')
  const [expandedDecimal, setExpandedDecimal] = useState(false)
  const [expandedBinary, setExpandedBinary] = useState(false)
  const [expandedOctal, setExpandedOctal] = useState(false)
  const [expandedHexadecimal, setExpandedHexadecimal] = useState(false)

  const toggleSection = (section: SectionType) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const numberSystems = [
    { id: 'decimal' as const, name: 'Decimal', base: 10, icon: '🔢' },
    { id: 'binary' as const, name: 'Binary', base: 2, icon: '💻' },
    { id: 'octal' as const, name: 'Octal', base: 8, icon: '🎱' },
    { id: 'hexadecimal' as const, name: 'Hexadecimal', base: 16, icon: '🎨' },
    { id: 'bcd' as const, name: 'BCD', base: 'special', icon: '🔘' },
    { id: 'excess3' as const, name: 'Excess-3', base: 'special', icon: '➕' },
    { id: 'graycode' as const, name: 'Gray Code', base: 'special', icon: '🔄' },
  ]

  const conversionSystems = [
    { id: 'decimal-to-binary' as const, name: 'Decimal → Binary', icon: '⬇️' },
    { id: 'binary-to-decimal' as const, name: 'Binary → Decimal', icon: '⬆️' },
    { id: 'decimal-to-octal' as const, name: 'Decimal → Octal', icon: '⬇️' },
    { id: 'octal-to-decimal' as const, name: 'Octal → Decimal', icon: '⬆️' },
    { id: 'decimal-to-hex' as const, name: 'Decimal → Hex', icon: '⬇️' },
    { id: 'hex-to-decimal' as const, name: 'Hex → Decimal', icon: '⬆️' },
  ]

  const decimalSubOptions = [
    { id: 'education' as const, name: 'About Decimal', icon: '📖' },
    { id: 'learn' as const, name: 'Learn Decimal', icon: '🎓' },
  ]

  const binarySubOptions = [
    { id: 'education' as const, name: 'About Binary', icon: '📖' },
    { id: 'learn' as const, name: 'Learn Binary', icon: '🎓' },
  ]

  const octalSubOptions = [
    { id: 'education' as const, name: 'About Octal', icon: '📖' },
    { id: 'learn' as const, name: 'Learn Octal', icon: '🎓' },
  ]

  const hexadecimalSubOptions = [
    { id: 'education' as const, name: 'About Hexadecimal', icon: '📖' },
    { id: 'learn' as const, name: 'Learn Hexadecimal', icon: '🎓' },
  ]

  if (isSidebarCollapsed) {
    return (
      <div className="ns-sidebar-edge-zone" aria-label="Hover left edge to open sidebar">
        <div className="ns-sidebar-edge-hint" aria-hidden="true" />
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="ns-sidebar-expand-btn"
          title="Open Sidebar"
          aria-label="Open sidebar"
        >
          <span className="ns-sidebar-expand-btn-glow" aria-hidden="true" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ns-sidebar-expand-icon shrink-0"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18" />
            <path d="m14 9 3 3-3 3" />
          </svg>
          <span className="ns-sidebar-expand-text">Open Sidebar</span>
        </button>
      </div>
    )
  }

  return (
    <aside className={`ns-sidebar fixed left-0 top-0 z-40 flex flex-col border-r shadow-xl transition-transform duration-300 ${
      isMobile 
        ? 'inset-y-0 w-80 transform translate-x-0' 
        : 'mt-14 h-[calc(100vh-3.5rem)] w-80 pb-20 md:mt-14 md:pb-20'
    }`}
    style={{ 
      backgroundColor: 'var(--bg-card)', 
      borderColor: 'var(--border-color)' 
    }}
    >
      <div className="sidebar-scroll flex-1 overflow-y-auto p-4 md:p-4">
        <div className="ns-sidebar-header mb-5 flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="ns-sidebar-header-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base">
              🔢
            </span>
            <h2
              className="truncate text-base font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Number Systems
            </h2>
          </div>
          <button
            onClick={() => setIsSidebarCollapsed(true)}
            className="ns-sidebar-collapse-btn group shrink-0 flex items-center gap-1.5 rounded-xl border px-2 py-1.5 transition-all-smooth active:scale-95"
            title="Collapse Sidebar"
            aria-label="Collapse sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className="ns-sidebar-collapse-label hidden text-xs font-semibold uppercase tracking-wide sm:inline">
              Hide
            </span>
          </button>
        </div>

        <div className="space-y-3">
          {/* Number Systems Section */}
          <div className="ns-sidebar-section rounded-xl border overflow-hidden">
            <button
              onClick={() => toggleSection('number-systems')}
              className="ns-sidebar-section-toggle w-full flex items-center justify-between px-3 py-3 text-left transition-colors-smooth"
              aria-expanded={expandedSection === 'number-systems'}
            >
              <span className="flex items-center gap-2.5 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                <span className="ns-sidebar-section-badge flex h-7 w-7 items-center justify-center rounded-lg text-sm">📚</span>
                <span>Number Systems</span>
              </span>
              <ChevronIcon expanded={expandedSection === 'number-systems'} />
            </button>

            {expandedSection === 'number-systems' && (
              <div className="px-2 pb-2 space-y-1">
                {numberSystems.map((system) => {
                  const isSelected = selectedNumberSystem === system.id || 
                    (system.id === 'decimal' && selectedDecimalSub !== null) ||
                    (system.id === 'binary' && selectedBinarySub !== null) ||
                    (system.id === 'octal' && selectedOctalSub !== null) ||
                    (system.id === 'hexadecimal' && selectedHexadecimalSub !== null)

                  return (
                    <div key={system.id}>
                      <button
                        onClick={() => {
                          if (system.id === 'decimal') {
                            setExpandedDecimal(!expandedDecimal)
                            onConversionSelect(null)
                            // Don't reset decimal sub-selection when clicking on decimal
                            onBinarySubSelect(null)
                            onOctalSubSelect(null)
                            onHexadecimalSubSelect(null)
                            onNumberSystemSelect('decimal')
                          } else if (system.id === 'binary') {
                            setExpandedBinary(!expandedBinary)
                            onConversionSelect(null)
                            onDecimalSubSelect(null)
                            // Don't reset binary sub-selection when clicking on binary
                            onOctalSubSelect(null)
                            onHexadecimalSubSelect(null)
                            onNumberSystemSelect('binary')
                          } else if (system.id === 'octal') {
                            setExpandedOctal(!expandedOctal)
                            onConversionSelect(null)
                            onDecimalSubSelect(null)
                            onBinarySubSelect(null)
                            // Don't reset octal sub-selection when clicking on octal
                            onHexadecimalSubSelect(null)
                            onNumberSystemSelect('octal')
                          } else if (system.id === 'hexadecimal') {
                            setExpandedHexadecimal(!expandedHexadecimal)
                            onConversionSelect(null)
                            onDecimalSubSelect(null)
                            onBinarySubSelect(null)
                            onOctalSubSelect(null)
                            // Don't reset hexadecimal sub-selection when clicking on hexadecimal
                            onNumberSystemSelect('hexadecimal')
                          } else {
                            onConversionSelect(null)
                            onDecimalSubSelect(null)
                            onBinarySubSelect(null)
                            onOctalSubSelect(null)
                            onHexadecimalSubSelect(null)
                            onNumberSystemSelect(system.id)
                          }
                        }}
                        className={`ns-sidebar-nav-item w-full flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-all-smooth ${
                          isSelected ? 'ns-sidebar-nav-item-active' : ''
                        }`}
                      >
                        <span className="ns-sidebar-nav-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base">
                          {system.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm leading-tight">{system.name}</div>
                          <div className="text-xs opacity-75 mt-0.5">
                            {typeof system.base === 'number' ? `Base ${system.base}` : 'Special Code'}
                          </div>
                        </div>
                        {(system.id === 'decimal' || system.id === 'binary' || system.id === 'octal' || system.id === 'hexadecimal') && (
                          <ChevronIcon expanded={
                            system.id === 'decimal' ? expandedDecimal :
                            system.id === 'binary' ? expandedBinary :
                            system.id === 'octal' ? expandedOctal :
                            expandedHexadecimal
                          } />
                        )}
                      </button>

                      {system.id === 'decimal' && expandedDecimal && (
                        <div className="ns-sidebar-subnav ml-5 mt-1 space-y-0.5 border-l-2 pl-3" onClick={(e) => e.stopPropagation()}>
                          {decimalSubOptions.map((sub) => {
                            const isSubSelected = selectedDecimalSub === sub.id

                            return (
                              <button
                                key={sub.id}
                                onClick={() => {
                                  onConversionSelect(null)
                                  onBinarySubSelect(null)
                                  onOctalSubSelect(null)
                                  onHexadecimalSubSelect(null)
                                  onDecimalSubSelect(sub.id)
                                }}
                                className={`ns-sidebar-subnav-item w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-all-smooth ${
                                  isSubSelected ? 'ns-sidebar-subnav-item-active' : ''
                                }`}
                              >
                                <span>{sub.icon}</span>
                                <span className="font-medium">{sub.name}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}

                      {system.id === 'binary' && expandedBinary && (
                        <div className="ns-sidebar-subnav ml-5 mt-1 space-y-0.5 border-l-2 pl-3" onClick={(e) => e.stopPropagation()}>
                          {binarySubOptions.map((sub) => {
                            const isSubSelected = selectedBinarySub === sub.id

                            return (
                              <button
                                key={sub.id}
                                onClick={() => {
                                  onConversionSelect(null)
                                  onDecimalSubSelect(null)
                                  onOctalSubSelect(null)
                                  onHexadecimalSubSelect(null)
                                  onBinarySubSelect(sub.id)
                                }}
                                className={`ns-sidebar-subnav-item w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-all-smooth ${
                                  isSubSelected ? 'ns-sidebar-subnav-item-active' : ''
                                }`}
                              >
                                <span>{sub.icon}</span>
                                <span className="font-medium">{sub.name}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}

                      {system.id === 'octal' && expandedOctal && (
                        <div className="ns-sidebar-subnav ml-5 mt-1 space-y-0.5 border-l-2 pl-3" onClick={(e) => e.stopPropagation()}>
                          {octalSubOptions.map((sub) => {
                            const isSubSelected = selectedOctalSub === sub.id

                            return (
                              <button
                                key={sub.id}
                                onClick={() => {
                                  onConversionSelect(null)
                                  onDecimalSubSelect(null)
                                  onBinarySubSelect(null)
                                  onOctalSubSelect(sub.id)
                                  onHexadecimalSubSelect(null)
                                }}
                                className={`ns-sidebar-subnav-item w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-all-smooth ${
                                  isSubSelected ? 'ns-sidebar-subnav-item-active' : ''
                                }`}
                              >
                                <span>{sub.icon}</span>
                                <span className="font-medium">{sub.name}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}

                      {system.id === 'hexadecimal' && expandedHexadecimal && (
                        <div className="ns-sidebar-subnav ml-5 mt-1 space-y-0.5 border-l-2 pl-3" onClick={(e) => e.stopPropagation()}>
                          {hexadecimalSubOptions.map((sub) => {
                            const isSubSelected = selectedHexadecimalSub === sub.id

                            return (
                              <button
                                key={sub.id}
                                onClick={() => {
                                  onConversionSelect(null)
                                  onDecimalSubSelect(null)
                                  onBinarySubSelect(null)
                                  onOctalSubSelect(null)
                                  onHexadecimalSubSelect(sub.id)
                                }}
                                className={`ns-sidebar-subnav-item w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-all-smooth ${
                                  isSubSelected ? 'ns-sidebar-subnav-item-active' : ''
                                }`}
                              >
                                <span>{sub.icon}</span>
                                <span className="font-medium">{sub.name}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Conversion Systems Section */}
          <div className="ns-sidebar-section rounded-xl border overflow-hidden">
            <button
              onClick={() => toggleSection('conversion-systems')}
              className="ns-sidebar-section-toggle w-full flex items-center justify-between px-3 py-3 text-left transition-colors-smooth"
              aria-expanded={expandedSection === 'conversion-systems'}
            >
              <span className="flex items-center gap-2.5 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                <span className="ns-sidebar-section-badge flex h-7 w-7 items-center justify-center rounded-lg text-sm">🔄</span>
                <span>Conversions</span>
              </span>
              <ChevronIcon expanded={expandedSection === 'conversion-systems'} />
            </button>

            {expandedSection === 'conversion-systems' && (
              <div className="px-2 pb-2 space-y-1">
                {conversionSystems.map((conversion) => {
                  const isSelected = selectedConversion === conversion.id

                  return (
                    <button
                      key={conversion.id}
                      onClick={() => {
                        onConversionSelect(conversion.id)
                        onNumberSystemSelect(null)
                        onDecimalSubSelect(null)
                        onBinarySubSelect(null)
                        onOctalSubSelect(null)
                        onHexadecimalSubSelect(null)
                      }}
                      className={`ns-sidebar-nav-item w-full flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-all-smooth ${
                        isSelected ? 'ns-sidebar-nav-item-active' : ''
                      }`}
                    >
                      <span className="ns-sidebar-nav-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base">
                        {conversion.icon}
                      </span>
                      <div className="min-w-0 flex-1 font-medium text-sm leading-tight">{conversion.name}</div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
