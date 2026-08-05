import { useEffect } from 'react'
import { useConfiguratorStore } from '@/store/configuratorStore'

export function Toast() {
  const toast = useConfiguratorStore((s) => s.toast)
  const setToast = useConfiguratorStore((s) => s.setToast)

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(id)
  }, [toast, setToast])

  if (!toast) return null

  return (
    <div className="toast" role="status" aria-live="polite">
      {toast}
    </div>
  )
}

export function ErrorBanner() {
  const error = useConfiguratorStore((s) => s.error)
  const setError = useConfiguratorStore((s) => s.setError)

  if (!error) return null

  return (
    <div className="error-banner" role="alert">
      <p>{error}</p>
      <button
        type="button"
        className="icon-btn"
        aria-label="Закрыть сообщение об ошибке"
        onClick={() => setError(null)}
      >
        ×
      </button>
    </div>
  )
}
