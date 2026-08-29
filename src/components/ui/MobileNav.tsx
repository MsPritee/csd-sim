/**
 * MobileNav - Mobile navigation component with hamburger menu
 * Provides responsive navigation that collapses to hamburger menu on mobile
 */

import { useState, useEffect } from 'react'

interface NavItem {
  readonly id: string
  readonly label: string
  readonly onClick: () => void
  readonly active?: boolean
}

interface MobileNavProps {
  readonly items: NavItem[]
  readonly className?: string
  readonly breakpoint?: 'sm' | 'md' | 'lg' | 'xl'
}

export function MobileNav({
  items,
  className = '',
  breakpoint = 'md',
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const breakpointSizes = { sm: 640, md: 768, lg: 1024, xl: 1280 }
      setIsMobile(window.innerWidth < breakpointSizes[breakpoint])
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoint])

  // Close menu when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false)
    }
  }, [isMobile])

  const breakpointClasses = {
    sm: { mobile: 'flex sm:hidden', desktop: 'hidden sm:flex' },
    md: { mobile: 'flex md:hidden', desktop: 'hidden md:flex' },
    lg: { mobile: 'flex lg:hidden', desktop: 'hidden lg:flex' },
    xl: { mobile: 'flex xl:hidden', desktop: 'hidden xl:flex' },
  }

  const classes = breakpointClasses[breakpoint]

  return (
    <nav className={`relative ${className}`}>
      {/* Mobile Menu Button */}
      <button
        className={`${classes.mobile} flex flex-col items-center justify-center min-w-[44px] min-h-[44px] rounded-md`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
        }}
      >
        <span
          className="block w-6 h-0.5 mb-1.5 transition-transform duration-300"
          style={{
            backgroundColor: 'var(--text-primary)',
            transform: isOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none',
          }}
        />
        <span
          className="block w-6 h-0.5 mb-1.5 transition-opacity duration-300"
          style={{
            backgroundColor: 'var(--text-primary)',
            opacity: isOpen ? '0' : '1',
          }}
        />
        <span
          className="block w-6 h-0.5 transition-transform duration-300"
          style={{
            backgroundColor: 'var(--text-primary)',
            transform: isOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
          }}
        />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className={`${classes.mobile} absolute top-full left-0 right-0 mt-2 p-3 sm:p-4 rounded-lg shadow-lg z-50 transition-all duration-300`}
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
          }}
        >
          <ul className="flex flex-col space-y-1 sm:space-y-2">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    item.onClick()
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-3 sm:px-4 py-3 sm:py-3 rounded-md transition-colors text-sm sm:text-base min-h-[44px] flex items-center ${
                    item.active ? 'font-semibold' : ''
                  }`}
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
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Desktop Navigation */}
      <ul className={`${classes.desktop} items-center space-x-2 sm:space-x-3 lg:space-x-4`}>
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={item.onClick}
              className={`px-3 sm:px-4 py-2 rounded-md transition-colors text-sm sm:text-base ${
                item.active ? 'font-semibold' : ''
              }`}
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
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
