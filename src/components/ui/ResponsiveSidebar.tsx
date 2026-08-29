/**
 * ResponsiveSidebar - Collapsible sidebar with mobile support
 * Provides responsive sidebar that collapses on mobile and can be toggled
 */

import { useState } from 'react'
import type { ReactNode } from 'react'

interface SidebarItem {
  readonly id: string
  readonly label: string
  readonly icon?: ReactNode
  readonly onClick: () => void
  readonly active?: boolean
  readonly disabled?: boolean
}

interface ResponsiveSidebarProps {
  readonly items: SidebarItem[]
  readonly className?: string
  readonly position?: 'left' | 'right'
  readonly breakpoint?: 'sm' | 'md' | 'lg'
  readonly defaultOpen?: boolean
  readonly width?: 'sm' | 'md' | 'lg'
}

const widthStyles: Record<Exclude<ResponsiveSidebarProps['width'], undefined>, string> = {
  sm: 'w-64',
  md: 'w-80',
  lg: 'w-96',
}

export function ResponsiveSidebar({
  items,
  className = '',
  position = 'left',
  breakpoint = 'md',
  defaultOpen = true,
  width = 'md',
}: ResponsiveSidebarProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const widthClass = widthStyles[width]
  const positionClass = position === 'left' ? 'left-0' : 'right-0'

  const breakpointClasses = {
    sm: {
      desktop: 'hidden sm:flex',
      mobile: 'flex sm:hidden',
    },
    md: {
      desktop: 'hidden md:flex',
      mobile: 'flex md:hidden',
    },
    lg: {
      desktop: 'hidden lg:flex',
      mobile: 'flex lg:hidden',
    },
  }

  const classes = breakpointClasses[breakpoint]

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className={`${classes.mobile} fixed top-4 ${positionClass} z-50 p-2 rounded-md shadow-lg`}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle sidebar"
        style={{
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
        }}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMobileOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className={`${classes.mobile} fixed inset-0 bg-black bg-opacity-50 z-40`}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`${classes.mobile} fixed ${positionClass} top-0 bottom-0 ${widthClass} z-50 transform transition-transform duration-300 ease-in-out`}
        style={{
          backgroundColor: 'var(--bg-card)',
          border: position === 'left' ? '1px solid var(--border-color)' : '1px solid var(--border-color)',
          transform: isMobileOpen ? 'translateX(0)' : position === 'left' ? 'translateX(-100%)' : 'translateX(100%)',
        }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Menu
            </h2>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1 rounded"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick()
                      setIsMobileOpen(false)
                    }
                  }}
                  disabled={item.disabled}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                    item.active ? 'font-semibold' : ''
                  } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{
                    backgroundColor: item.active
                      ? 'var(--accent-bg)'
                      : 'transparent',
                    color: item.active
                      ? 'var(--accent-primary)'
                      : 'var(--text-primary)',
                    border: item.active
                      ? `1px solid var(--accent-primary)`
                      : '1px solid transparent',
                  }}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={`${classes.desktop} ${widthClass} ${positionClass} top-0 bottom-0 transition-all duration-300 ease-in-out ${className}`}
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          transform: isOpen ? 'translateX(0)' : position === 'left' ? 'translateX(-100%)' : 'translateX(100%)',
        }}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Menu
            </h2>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 rounded"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg
                className="w-5 h-5 transition-transform"
                style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </div>
          {isOpen && (
            <ul className="space-y-1 flex-1">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={item.onClick}
                    disabled={item.disabled}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                      item.active ? 'font-semibold' : ''
                    } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{
                      backgroundColor: item.active
                        ? 'var(--accent-bg)'
                        : 'transparent',
                      color: item.active
                        ? 'var(--accent-primary)'
                        : 'var(--text-primary)',
                      border: item.active
                        ? `1px solid var(--accent-primary)`
                        : '1px solid transparent',
                    }}
                  >
                    {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}
