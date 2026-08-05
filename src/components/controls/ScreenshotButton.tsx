import { useState } from 'react'
import { captureCanvasScreenshot, downloadBlob } from '@/lib/screenshot'
import { saveSnapshot } from '@/lib/storage'
import { useConfiguratorStore } from '@/store/configuratorStore'
import { logger } from '@/lib/logger'
import { SCREENSHOT_DEFAULT } from '@/lib/constants'

/**
 * Кнопка скриншота: канвас берём из DOM (preserveDrawingBuffer включён).
 */
export function ScreenshotButton() {
  const [busy, setBusy] = useState(false)
  const setError = useConfiguratorStore((s) => s.setError)
  const setToast = useConfiguratorStore((s) => s.setToast)

  const takeShot = async () => {
    setBusy(true)
    setError(null)

    try {
      const canvas = document.querySelector(
        '.scene-wrap canvas',
      ) as HTMLCanvasElement | null

      if (!canvas) {
        throw new Error('Холст сцены не найден. Обновите страницу.')
      }

      const blob = await captureCanvasScreenshot(canvas, {
        ...SCREENSHOT_DEFAULT,
      })

      const stamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, 19)
      const fileName = `конфигуратор-${stamp}.png`

      await saveSnapshot(blob, fileName)
      downloadBlob(blob, fileName)
      setToast('Снимок сохранён в высоком разрешении (1920×1080).')
    } catch (error) {
      logger.error('Ошибка скриншота', error)
      setError(
        error instanceof Error
          ? error.message
          : 'Не удалось сделать снимок сцены.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      className="btn btn-primary"
      disabled={busy}
      aria-label="Сделать скриншот в высоком разрешении"
      onClick={() => void takeShot()}
    >
      {busy ? 'Сохранение…' : 'Сделать скриншот'}
    </button>
  )
}
