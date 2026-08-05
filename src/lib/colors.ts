import type { ColorSwatch, ClosestColorResult } from '@/types'
import { normalizeHex, validateHexColor } from '@/lib/validation'

export interface Rgb {
  r: number
  g: number
  b: number
}

/** HEX → RGB */
export function hexToRgb(hex: string): Rgb {
  const result = validateHexColor(hex)
  if (!result.ok) {
    throw new Error(result.error)
  }

  const normalized = normalizeHex(hex).slice(1)
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  }
}

/** RGB → HEX */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  const to = (v: number) => clamp(v).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase()
}

/** Евклидово расстояние в RGB-пространстве */
export function colorDistance(a: Rgb, b: Rgb): number {
  const dr = a.r - b.r
  const dg = a.g - b.g
  const db = a.b - b.b
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

/** Поиск ближайшего цвета в палитре */
export function findClosestColor(
  hex: string,
  palette: ColorSwatch[],
): ClosestColorResult | null {
  if (!palette.length) return null

  const target = hexToRgb(hex.startsWith('#') ? hex : `#${hex}`)
  let best: ClosestColorResult | null = null

  for (const swatch of palette) {
    const rgb = hexToRgb(`#${swatch.hex.replace('#', '')}`)
    const distance = colorDistance(target, rgb)
    if (!best || distance < best.distance) {
      best = { swatch, distance }
    }
  }

  return best
}

/** Контрастный цвет текста на фоне */
export function contrastTextColor(hex: string): '#0A0A0A' | '#FFFFFF' {
  const { r, g, b } = hexToRgb(hex.startsWith('#') ? hex : `#${hex}`)
  // Относительная яркость по WCAG
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return luminance > 0.55 ? '#0A0A0A' : '#FFFFFF'
}

/** Форматирование кода для UI */
export function formatSwatchLabel(swatch: ColorSwatch): string {
  return `${swatch.code} — ${swatch.name}`
}
