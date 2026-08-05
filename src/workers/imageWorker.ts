/**
 * Воркер: масштабирование снимка через OffscreenCanvas
 */

export interface ImageWorkerRequest {
  bitmap: ImageBitmap
  width: number
  height: number
  mimeType: string
  quality: number
}

self.onmessage = async (event: MessageEvent<ImageWorkerRequest>) => {
  const { bitmap, width, height, mimeType, quality } = event.data

  try {
    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      self.postMessage({
        ok: false,
        error: 'OffscreenCanvas недоступен в этом браузере.',
      })
      return
    }

    ctx.fillStyle = '#E8ECF0'
    ctx.fillRect(0, 0, width, height)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await canvas.convertToBlob({
      type: mimeType,
      quality,
    })

    self.postMessage({ ok: true, blob })
  } catch (error) {
    self.postMessage({
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : 'Неизвестная ошибка обработки изображения.',
    })
  }
}
