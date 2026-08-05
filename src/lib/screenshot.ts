import type { ScreenshotOptions } from '@/types'
import { SCREENSHOT_DEFAULT } from '@/lib/constants'
import { logger } from '@/lib/logger'

/**
 * Высококачественный скриншот WebGL-канваса.
 * Тяжёлая постобработка уходит в воркер с OffscreenCanvas.
 */
export async function captureCanvasScreenshot(
  canvas: HTMLCanvasElement,
  options: Partial<ScreenshotOptions> = {},
): Promise<Blob> {
  const width = options.width ?? SCREENSHOT_DEFAULT.width
  const height = options.height ?? SCREENSHOT_DEFAULT.height
  const mimeType = options.mimeType ?? SCREENSHOT_DEFAULT.mimeType
  const quality = options.quality ?? 0.95

  if (!canvas.width || !canvas.height) {
    throw new Error('Сцена ещё не готова для снимка. Подождите загрузки модели.')
  }

  // Читаем пиксели с текущего канваса (с учётом preserveDrawingBuffer)
  const sourceBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Не удалось создать снимок сцены.'))
          return
        }
        resolve(blob)
      },
      'image/png',
    )
  })

  const bitmap = await createImageBitmap(sourceBlob)

  try {
    if (typeof OffscreenCanvas !== 'undefined' && typeof Worker !== 'undefined') {
      return await processInWorker(bitmap, width, height, mimeType, quality)
    }
    return await processOnMainThread(bitmap, width, height, mimeType, quality)
  } finally {
    bitmap.close()
  }
}

async function processInWorker(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  const worker = new Worker(
    new URL('../workers/imageWorker.ts', import.meta.url),
    { type: 'module' },
  )

  return new Promise<Blob>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      worker.terminate()
      reject(new Error('Обработка снимка заняла слишком много времени.'))
    }, 30_000)

    worker.onmessage = (event: MessageEvent<{ ok: boolean; blob?: Blob; error?: string }>) => {
      window.clearTimeout(timeout)
      worker.terminate()
      if (event.data.ok && event.data.blob) {
        resolve(event.data.blob)
        return
      }
      reject(new Error(event.data.error ?? 'Ошибка обработки снимка.'))
    }

    worker.onerror = () => {
      window.clearTimeout(timeout)
      worker.terminate()
      logger.error('Сбой воркера обработки изображений')
      reject(new Error('Сбой фоновой обработки снимка.'))
    }

    worker.postMessage(
      { bitmap, width, height, mimeType, quality },
      [bitmap],
    )
  })
}

async function processOnMainThread(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Не удалось создать контекст для снимка.')
  }

  ctx.fillStyle = '#E8ECF0'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(bitmap, 0, 0, width, height)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Не удалось сохранить снимок.'))
          return
        }
        resolve(blob)
      },
      mimeType,
      quality,
    )
  })
}

/** Скачивание Blob как файла */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
