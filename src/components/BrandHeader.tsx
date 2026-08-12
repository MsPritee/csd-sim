import logo from '../assets/images/logo.png';
import Logo from './Logo';
import { useTheme } from '../contexts/ThemeContext';

const ERP_URL = "https://chalkandduster-kbb.web.app/labs"
const ERP_HOME = "https://chalkandduster-kbb.web.app"

export default function BrandHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 flex h-12 items-center justify-between gap-3 border-b px-4 backdrop-blur" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
      <a
        href={ERP_HOME}
        // target="_blank"
        rel="noopener noreferrer"
        className="flex min-w-0 items-center gap-2 hover:opacity-80 transition-opacity"
        style={{ color: 'var(--text-primary)' }}
      >
        <Logo 
              src={logo}
              alt="Chalk and Duster Logo"
              title="Chalk and Duster"
              subtitle="Learn With Fun"
              neonBorder={true}
            />
        {/* <img
          src={logo}
          alt="Chalk and Duster logo"
          className="h-7 w-7 shrink-0 rounded-md object-cover"
        /> */}
        {/* <span className="truncate text-sm font-semibold tracking-tight">Chalk &amp; Duster</span> */}
      </a>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="shrink-0 rounded-md p-2 transition-colors"
          style={{ color: 'var(--text-primary)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
        <a
          href={ERP_URL}
          // target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-md border px-3 py-1 text-xs transition-colors"
          style={{
            borderColor: 'var(--accent-primary)',
            color: 'var(--accent-primary)',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-bg)';
            e.currentTarget.style.color = 'var(--accent-primary-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--accent-primary)';
          }}
        >
          Interactive Labs →
        </a>
      </div>
    </header>
  )
}