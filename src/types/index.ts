/** Типы конфигуратора 3D-товара */

export type PaletteSource = 'pantone' | 'ral'

export interface ColorSwatch {
  /** Код цвета в системе Pantone/RAL */
  code: string
  /** Человекочитаемое название на русском */
  name: string
  /** HEX без # */
  hex: string
  source: PaletteSource
}

export type MaterialSlotId =
  | 'body'
  | 'sole'
  | 'laces'
  | 'accent'
  | 'logo'

export interface MaterialSlot {
  id: MaterialSlotId
  /** Подпись для UI на русском */
  label: string
  /** Ключ материала в сцене */
  meshNames: string[]
}

export interface MaterialColorMap {
  body: string
  sole: string
  laces: string
  accent: string
  logo: string
}

export interface ConfiguratorState {
  colors: MaterialColorMap
  activeSlot: MaterialSlotId
  paletteSource: PaletteSource
  modelUrl: string | null
  modelName: string | null
  isUnboxing: boolean
  hasUnboxed: boolean
  error: string | null
  toast: string | null
}

export interface ValidationResult {
  ok: boolean
  error?: string
}

export interface ScreenshotOptions {
  width: number
  height: number
  mimeType: 'image/png' | 'image/jpeg'
  quality?: number
}

export interface ClosestColorResult {
  swatch: ColorSwatch
  distance: number
}
