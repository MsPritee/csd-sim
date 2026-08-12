/** Minimal telemetry hook. Logs locally; forwards to a reporter only when wired up. */
export function reportError(
  scope: string,
  error: Error,
  info?: { componentStack?: string | null },
): void {
  console.error(`[${scope}]`, error)
  if (info?.componentStack) console.error(`[${scope}] componentStack:\n${info.componentStack}`)

  const endpoint = (import.meta.env.VITE_ERROR_ENDPOINT as string | undefined)?.trim()
  if (!endpoint) return

  try {
    void fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scope,
        message: error.message,
        stack: error.stack,
        componentStack: info?.componentStack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      }),
      keepalive: true,
    })
  } catch {
    /* telemetry must never break the app */
  }
}