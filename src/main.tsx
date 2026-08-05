import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import App from '@/App'
import '@/index.css'

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Корневой элемент #root не найден.')
}

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
