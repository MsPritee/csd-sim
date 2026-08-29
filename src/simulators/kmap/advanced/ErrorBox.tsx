export default function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mt-2 rounded px-3 py-2 text-sm" style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }} role="alert">
      {message}
    </div>
  )
}
