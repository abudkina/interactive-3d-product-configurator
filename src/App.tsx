import { lazy, Suspense, useEffect } from 'react'
import { MaterialPanel } from '@/components/controls/MaterialPanel'
import { ModelLoader } from '@/components/controls/ModelLoader'
import { ScreenshotButton } from '@/components/controls/ScreenshotButton'
import { ErrorBanner, Toast } from '@/components/ui/Feedback'
import { useConfiguratorStore } from '@/store/configuratorStore'

const ProductScene = lazy(() =>
  import('@/components/scene/ProductScene').then((m) => ({
    default: m.ProductScene,
  })),
)

export default function App() {
  const initFromPersistence = useConfiguratorStore((s) => s.initFromPersistence)
  const panelOpen = useConfiguratorStore((s) => s.panelOpen)
  const setPanelOpen = useConfiguratorStore((s) => s.setPanelOpen)

  useEffect(() => {
    initFromPersistence()
  }, [initFromPersistence])

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        Перейти к содержимому
      </a>

      <header className="topbar">
        <div className="brand-block">
          <p className="brand">Конфигуратор 3D</p>
          <p className="tagline">Крутите. Красьте. Сохраняйте.</p>
        </div>
        <div className="topbar-actions">
          <ScreenshotButton />
          <button
            type="button"
            className="btn btn-ghost panel-toggle"
            aria-expanded={panelOpen}
            aria-controls="side-panel"
            aria-label={panelOpen ? 'Скрыть панель настройки' : 'Открыть панель настройки'}
            onClick={() => setPanelOpen(!panelOpen)}
          >
            {panelOpen ? 'Скрыть панель' : 'Настройка'}
          </button>
        </div>
      </header>

      <ErrorBanner />

      <main id="main-content" className="layout">
        <Suspense
          fallback={
            <div className="scene-wrap scene-loading" role="status" aria-live="polite">
              Загрузка сцены…
            </div>
          }
        >
          <ProductScene />
        </Suspense>

        <aside
          id="side-panel"
          className={`side-panel${panelOpen ? ' is-open' : ''}`}
          aria-label="Панель настройки"
        >
          <ModelLoader />
          <MaterialPanel />
          <section className="panel-section" aria-labelledby="help-title">
            <h2 id="help-title">Управление</h2>
            <ul className="help-list">
              <li>ЛКМ — вращение</li>
              <li>ПКМ / два пальца — перемещение</li>
              <li>Колесо / щипок — масштаб</li>
            </ul>
          </section>
        </aside>
      </main>

      <Toast />
    </div>
  )
}
