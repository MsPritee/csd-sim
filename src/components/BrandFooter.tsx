const ERP_HOME = "https://chalkandduster-kbb.web.app"

interface BrandFooterProps {
  readonly className?: string
}

export default function BrandFooter({ className = '' }: BrandFooterProps) {
  return (
    <footer className={`border-t px-3 sm:px-4 lg:px-6 z-80 py-0.5 text-center text-xs sm:text-sm w-full ${className}`} style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
      <div className="mx-auto max-w-7xl">
        Made with <span aria-label="love">❤</span> by the{" "}
        <a
          href={ERP_HOME}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline transition-colors"
          style={{ color: 'var(--accent-primary)' }}
        >
          Chalk and Duster Team
        </a>{" "}
        · © {new Date().getFullYear()} All Rights Reserved
      </div>
    </footer>
  )
}