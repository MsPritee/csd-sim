import { memo, useCallback, useMemo } from 'react'
import logo from '../assets/images/logo.png'
import Logo from './Logo'
import { useTheme } from '../contexts/ThemeContext'
import { MobileNav } from './ui/MobileNav'

type View = 'home' | 'kmap' | 'practice' | 'gates' | 'circuit' | 'numbersystems' | 'faq'

const ERP_URL = 'https://chalkandduster-kbb.web.app/labs'
const ERP_HOME = 'https://chalkandduster-kbb.web.app'

interface BrandHeaderProps {
  currentView?: View
  onViewChange?: React.Dispatch<React.SetStateAction<View>>
}

const BrandHeader = memo(function BrandHeader({ currentView = 'home', onViewChange }: BrandHeaderProps) {
  const { theme, toggleTheme } = useTheme()

  const navItems = useMemo(() => [
    { id: 'home', label: 'Home', onClick: () => onViewChange?.('home' as View), active: currentView === 'home' },
    { id: 'kmap', label: 'K-Map', onClick: () => onViewChange?.('kmap' as View), active: currentView === 'kmap' },
    { id: 'gates', label: 'Logic Gates', onClick: () => onViewChange?.('gates' as View), active: currentView === 'gates' },
    { id: 'circuit', label: 'Circuit Designer', onClick: () => onViewChange?.('circuit' as View), active: currentView === 'circuit' },
    { id: 'numbersystems', label: 'Number Systems', onClick: () => onViewChange?.('numbersystems' as View), active: currentView === 'numbersystems' },
    { id: 'faq', label: 'FAQ', onClick: () => onViewChange?.('faq' as View), active: currentView === 'faq' },
  ], [currentView, onViewChange])

  const handleThemeToggle = useCallback(() => {
    toggleTheme()
  }, [toggleTheme])

  return (
    <header className="brand-header sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="brand-header-inner mx-auto grid h-10 sm:h-12 lg:h-14 max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3 lg:gap-4 px-2 sm:px-4 lg:px-6">
        <div className="min-w-0 flex justify-start items-center gap-2">
          <a
            href={ERP_HOME}
            rel="noopener noreferrer"
            className="brand-header-logo flex min-w-0 items-center gap-2 rounded-lg px-1 py-0.5 transition-all-smooth hover:opacity-90"
            style={{ color: 'var(--text-primary)' }}
          >
            <Logo
              src={logo}
              alt="Chalk and Duster Logo"
              title="Chalk and Duster"
              subtitle="Learn With Fun"
              size="sm"
              neonBorder={true}
            />
          </a>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <span className="brand-header-title truncate whitespace-nowrap text-base font-bold tracking-tight sm:text-lg">
            DigiWorld
          </span>
        </div>

        <div className="min-w-0 flex items-center justify-end gap-1 sm:gap-2">
          {/* Mobile Navigation */}
          <div className="flex lg:hidden items-center">
            <MobileNav
              items={navItems}
              breakpoint="lg"
              className="mr-1"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 mr-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  item.active ? 'font-semibold' : ''
                }`}
                style={{
                  backgroundColor: item.active ? 'var(--accent-bg)' : 'transparent',
                  color: item.active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  border: item.active ? '1px solid var(--accent-primary)' : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.color = 'var(--text-primary)'
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!item.active) {
                    e.currentTarget.style.color = 'var(--text-secondary)'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={handleThemeToggle}
            className="brand-header-icon-btn shrink-0 rounded-xl border p-1.5 sm:p-2 transition-all-smooth active:scale-95"
            style={{
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-secondary)',
            }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <a
            href={ERP_URL}
            rel="noopener noreferrer"
            className="brand-header-cta shrink-0 rounded-xl border px-2 sm:px-3 py-1.5 text-xs font-semibold transition-all-smooth active:scale-95 hidden md:block"
          >
            Interactive Labs →
          </a>
        </div>
      </div>
    </header>
  )
})

export default BrandHeader
