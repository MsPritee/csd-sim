/**
 * MobileNav - Unified navigation system with elegant sidebar
 * Features:
 * - Fixed right-edge sidebar with smooth slide-in animation
 * - Compact single-column layout
 * - Prominent close button at top-right
 * - Hamburger button toggles sidebar open/close
 * - Modular, cute, and professional aesthetic
 * - Touch-friendly with proper accessibility
 * - Submenu support for nested navigation
 * - Consistent across all screen sizes
 */

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

interface NavItem {
  readonly id: string
  readonly label: string
  readonly onClick?: () => void
  readonly active?: boolean
  readonly icon?: ReactNode
  readonly children?: readonly NavItem[]
}

interface MobileNavProps {
  readonly items: NavItem[]
  readonly className?: string
}

export function MobileNav({
  items,
  className = '',
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  // Close menu on Escape for accessibility
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen])

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  return (
    <nav className={`relative ${className}`} aria-label="Mobile navigation">
      {/* Menu toggle button */}
      <button
        className="flex shrink-0 items-center justify-center rounded-xl border p-2 transition-all-smooth active:scale-95"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        style={{
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <span className="relative flex h-[20px] w-[20px] items-center justify-center">
          <span
            className="absolute block h-0.5 transition-all duration-300 ease-in-out"
            style={{
              backgroundColor: 'currentColor',
              width: '18px',
              transform: isOpen ? 'rotate(45deg) translate(0, 0)' : 'translateY(-5px)',
            }}
          />
          <span
            className="absolute block h-0.5 transition-opacity duration-300 ease-in-out"
            style={{
              backgroundColor: 'currentColor',
              width: '18px',
              opacity: isOpen ? '0' : '1',
            }}
          />
          <span
            className="absolute block h-0.5 transition-all duration-300 ease-in-out"
            style={{
              backgroundColor: 'currentColor',
              width: '18px',
              transform: isOpen ? 'rotate(-45deg) translate(0, 0)' : 'translateY(5px)',
            }}
          />
        </span>
      </button>

      {/* Backdrop overlay */}
      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-[95] transition-opacity duration-300"
          style={{
            backgroundColor: 'rgba(2, 6, 23, 0.6)',
            opacity: isOpen ? '1' : '0',
          }}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />,
        document.body
      )}

      {/* Fixed Right Sidebar */}
      {isOpen && createPortal(
        <div
          role="menu"
          className="fixed top-0 right-0 h-screen w-72 sm:w-64 z-[100] flex flex-col overflow-hidden shadow-2xl"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            backdropFilter: 'blur(20px)',
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Top decorative gradient line */}
          <div
            className="h-1.5 w-full shrink-0"
            style={{
              background: 'linear-gradient(90deg, var(--accent-primary), #ec4899, #f59e0b, var(--accent-primary))',
            }}
          />

          {/* Header with close button */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4 shrink-0">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl text-xs font-bold"
                style={{
                  background: 'var(--accent-bg)',
                  color: 'var(--accent-primary)',
                  border: '1.5px solid var(--accent-primary)',
                }}
              >
                DW
              </span>
              <span
                className="text-xs sm:text-sm font-bold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                DigiWorld
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl transition-all-smooth hover:scale-105 active:scale-95"
              style={{ 
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-tertiary)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Decorative divider */}
          <div 
            className="mx-4 h-px shrink-0"
            style={{ backgroundColor: 'var(--border-color)' }}
          />

          {/* Navigation items */}
          <ul className="flex flex-col gap-1.5 p-2.5 sm:p-3 flex-1">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  role="menuitem"
                  onClick={() => {
                    if (item.children) {
                      setExpandedItem(expandedItem === item.id ? null : item.id)
                    } else if (item.onClick) {
                      item.onClick()
                      setIsOpen(false)
                    }
                  }}
                  className={`group flex w-full items-center gap-1.5 sm:gap-2 rounded-xl px-2 sm:px-2.5 py-1.5 sm:py-2 text-left text-xs sm:text-sm font-medium transition-all-smooth active:scale-[0.98] ${
                    item.active ? 'font-semibold' : ''
                  }`}
                  style={{
                    backgroundColor: item.active ? 'var(--accent-bg)' : 'transparent',
                    color: item.active ? 'var(--accent-primary)' : 'var(--text-primary)',
                    border: item.active
                      ? '1.5px solid var(--accent-primary)'
                      : '1.5px solid transparent',
                  }}
                >
                  {item.icon && (
                    <span
                      className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-xl transition-colors"
                      style={{
                        backgroundColor: item.active
                          ? 'var(--accent-primary)'
                          : 'var(--bg-tertiary)',
                        color: item.active
                          ? '#fff'
                          : 'var(--text-secondary)',
                      }}
                    >
                      {item.icon}
                    </span>
                  )}
                  <span className="flex-1">{item.label}</span>
                  {item.children ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12" height="12" className={`sm:w-[14px] sm:h-[14px] transition-transform duration-200 ${expandedItem === item.id ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  ) : item.active ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14" height="14" className="sm:w-[16px] sm:h-[16px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : null}
                </button>
                
                {/* Submenu */}
                {item.children && expandedItem === item.id && (
                  <ul className="flex flex-col gap-1 mt-1.5 ml-2 pl-2 border-l-2" style={{ borderColor: 'var(--border-color)' }}>
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <button
                          role="menuitem"
                          onClick={() => {
                            child.onClick?.()
                            setIsOpen(false)
                          }}
                          className={`group flex w-full items-center gap-1.5 rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 text-left text-xs sm:text-sm font-medium transition-all-smooth active:scale-[0.98] ${
                            child.active ? 'font-semibold' : ''
                          }`}
                          style={{
                            backgroundColor: child.active ? 'var(--accent-bg)' : 'transparent',
                            color: child.active ? 'var(--accent-primary)' : 'var(--text-primary)',
                            border: child.active
                              ? '1px solid var(--accent-primary)'
                              : '1px solid transparent',
                          }}
                        >
                          <span className="flex-1">{child.label}</span>
                          {child.active && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12" height="12" className="sm:w-[14px] sm:h-[14px]"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{ color: 'var(--accent-primary)' }}
                            >
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          {/* Bottom decorative element */}
          <div className="px-3 sm:px-4 py-3 sm:py-4 shrink-0">
            <div
              className="h-1.5 w-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, var(--accent-primary), #ec4899, #f59e0b, var(--accent-primary))',
              }}
            />
          </div>
        </div>,
        document.body
      )}
    </nav>
  )
}