import { memo, useCallback, useMemo } from 'react'
import logo from '../assets/images/logo.png'
import Logo from './Logo'
import { useTheme } from '../contexts/ThemeContext'
import { MobileNav } from './ui/MobileNav'

type View = 'home' | 'kmap' | 'practice' | 'gates' | 'circuit' | 'numbersystems' | 'faq'

const ERP_URL = 'https://chalkandduster-kbb.web.app/labs'
const ERP_HOME = 'https://chalkandduster-kbb.web.app'

const navIcons = {
  home: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  kmap: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 3v18" />
    </svg>
  ),
  gates: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h8M12 12h8" />
      <ellipse cx="12" cy="12" rx="3" ry="6" />
    </svg>
  ),
  circuit: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <path d="M6 12h4M14 12h4M10 8v8" />
      <circle cx="10" cy="12" r="2" />
    </svg>
  ),
  numbersystems: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h8M12 12h8M12 8v8" />
      <circle cx="8" cy="12" r="2" />
      <circle cx="16" cy="12" r="2" />
    </svg>
  ),
  faq: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
}

interface BrandHeaderProps {
  currentView?: View
  onViewChange?: React.Dispatch<React.SetStateAction<View>>
}

const BrandHeader = memo(function BrandHeader({ currentView = 'home', onViewChange }: BrandHeaderProps) {
  const { theme, toggleTheme } = useTheme()

  const navItems = useMemo(() => [
    { id: 'home', label: 'Home', icon: navIcons.home, onClick: () => onViewChange?.('home' as View), active: currentView === 'home' },
    { 
      id: 'kmap', 
      label: 'K-Map', 
      icon: navIcons.kmap, 
      onClick: () => onViewChange?.('kmap' as View), 
      active: currentView === 'kmap' || currentView === 'practice',
      children: [
        { id: 'kmap-main', label: 'K-Map Simulator', onClick: () => onViewChange?.('kmap' as View), active: currentView === 'kmap' },
        { id: 'kmap-practice', label: 'Practice Mode', onClick: () => onViewChange?.('practice' as View), active: currentView === 'practice' },
      ]
    },
    { id: 'gates', label: 'Logic Gates', icon: navIcons.gates, onClick: () => onViewChange?.('gates' as View), active: currentView === 'gates' },
    { id: 'circuit', label: 'Circuit Designer', icon: navIcons.circuit, onClick: () => onViewChange?.('circuit' as View), active: currentView === 'circuit' },
    { id: 'numbersystems', label: 'Number Systems', icon: navIcons.numbersystems, onClick: () => onViewChange?.('numbersystems' as View), active: currentView === 'numbersystems' },
    { id: 'faq', label: 'FAQ', icon: navIcons.faq, onClick: () => onViewChange?.('faq' as View), active: currentView === 'faq' },
  ], [currentView, onViewChange])

  const handleThemeToggle = useCallback(() => {
    toggleTheme()
  }, [toggleTheme])

  const goHome = useCallback(() => {
    onViewChange?.('home' as View)
  }, [onViewChange])

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
          <button
            type="button"
            onClick={goHome}
            aria-label="DigiWorld - go to home page"
            title="Go to Home"
            className="brand-header-title truncate whitespace-nowrap text-base font-bold tracking-tight transition-transform sm:text-lg hover:scale-[1.03] active:scale-95"
          >
            DigiWorld
          </button>
        </div>

        <div className="min-w-0 flex items-center justify-end gap-1 sm:gap-2">
          {/* Mobile Navigation */}
          <MobileNav
            items={navItems}
            className="mr-1"
          />

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
