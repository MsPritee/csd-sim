const ERP_HOME = "https://chalkandduster-kbb.web.app"

export default function BrandFooter() {
  return (
    <footer className="border-t px-4 py-2 text-center text-xs" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
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
    </footer>
  )
}