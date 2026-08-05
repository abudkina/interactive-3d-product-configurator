import type { ColorSwatch, ClosestColorResult } from '@/types'
import { logger } from '@/lib/logger'
import { findClosestColor } from '@/lib/colors'

/** Поиск ближайшего цвета через Web Worker с запасным вариантом на главном потоке */
export async function findClosestColorAsync(
  hex: string,
  palette: ColorSwatch[],
): Promise<ClosestColorResult | null> {
  if (!palette.length) return null

  if (typeof Worker === 'undefined') {
    return findClosestColor(hex, palette)
  }

  try {
    const worker = new Worker(
      new URL('../workers/colorWorker.ts', import.meta.url),
      { type: 'module' },
    )

    const result = await new Promise<ClosestColorResult | null>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        worker.terminate()
        reject(new Error('Поиск цвета превысил время ожидания.'))
      }, 10_000)

      worker.onmessage = (
        event: MessageEvent<{
          ok: boolean
          result?: ClosestColorResult | null
          error?: string
        }>,
      ) => {
        window.clearTimeout(timeout)
        worker.terminate()
        if (!event.data.ok) {
          reject(new Error(event.data.error ?? 'Ошибка воркера цветов.'))
          return
        }
        resolve(event.data.result ?? null)
      }

      worker.onerror = () => {
        window.clearTimeout(timeout)
        worker.terminate()
        reject(new Error('Сбой воркера цветов.'))
      }

      worker.postMessage({
        type: 'closest',
        hex: hex.replace('#', ''),
        palette: palette.map((s) => ({
          code: s.code,
          name: s.name,
          hex: s.hex.replace('#', ''),
          source: s.source,
        })),
      })
    })

    return result
  } catch (error) {
    logger.warn('Воркер цветов недоступен, считаем на главном потоке', error)
    return findClosestColor(hex, palette)
  }
}
