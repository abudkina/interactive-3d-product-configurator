/**
 * Воркер: поиск ближайшего цвета в палитре (тяжёлые вычисления)
 */

export interface Rgb {
  r: number
  g: number
  b: number
}

export interface WorkerSwatch {
  code: string
  name: string
  hex: string
  source: 'pantone' | 'ral'
}

export interface ColorWorkerRequest {
  type: 'closest'
  hex: string
  palette: WorkerSwatch[]
}

function hexToRgb(hex: string): Rgb {
  const cleaned = hex.replace('#', '')
  return {
    r: Number.parseInt(cleaned.slice(0, 2), 16),
    g: Number.parseInt(cleaned.slice(2, 4), 16),
    b: Number.parseInt(cleaned.slice(4, 6), 16),
  }
}

function distance(a: Rgb, b: Rgb): number {
  const dr = a.r - b.r
  const dg = a.g - b.g
  const db = a.b - b.b
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

self.onmessage = (event: MessageEvent<ColorWorkerRequest>) => {
  const { type, hex, palette } = event.data

  if (type !== 'closest') {
    self.postMessage({ ok: false, error: 'Неизвестная операция воркера.' })
    return
  }

  try {
    const target = hexToRgb(hex)
    let best: { swatch: WorkerSwatch; distance: number } | null = null

    for (const swatch of palette) {
      const rgb = hexToRgb(swatch.hex)
      const d = distance(target, rgb)
      if (!best || d < best.distance) {
        best = { swatch, distance: d }
      }
    }

    self.postMessage({ ok: true, result: best })
  } catch (error) {
    self.postMessage({
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : 'Ошибка поиска цвета в палитре.',
    })
  }
}
