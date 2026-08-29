/**
 * MobileBottomNav - Bottom tab bar for mobile navigation
 * Provides quick access to simulators with touch-optimized targets
 */

import { useState, useEffect } from 'react'

interface NavItem {
  readonly id: string
  readonly label: string
  readonly icon: React.ReactNode
  readonly onClick: () => void
  readonly active?: boolean
}

interface MobileBottomNavProps {
  readonly items: NavItem[]
  readonly className?: string
  readonly breakpoint?: 'sm' | 'md' | 'lg' | 'xl'
}

export function MobileBottomNav({
  items,
  className = '',
  breakpoint = 'md',
}: MobileBottomNavProps) {
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

  if (!isMobile) return null

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-md transition-transform duration-300 ${className}`}
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] rounded-lg transition-all active:scale-95"
            style={{
              backgroundColor: item.active ? 'var(--accent-bg)' : 'transparent',
              color: item.active ? 'var(--accent-primary)' : 'var(--text-secondary)',
            }}
            aria-label={item.label}
            aria-current={item.active ? 'page' : undefined}
          >
            <div className="mb-1">
              {item.icon}
            </div>
            <span className="text-xs font-medium whitespace-nowrap">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}
