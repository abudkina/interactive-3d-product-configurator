import type { MaterialColorMap, PaletteSource } from '@/types'
import { validateHexColor, normalizeHex } from '@/lib/validation'
import presetsData from '@/data/presets.json'

export interface ColorPreset {
  id: string
  name: string
  description: string
  paletteSource: PaletteSource
  colors: MaterialColorMap
}

export function getPresets(): ColorPreset[] {
  return presetsData as ColorPreset[]
}

export function findPresetById(id: string): ColorPreset | null {
  return getPresets().find((p) => p.id === id) ?? null
}

/** Проверка целостности пресета */
export function validatePreset(preset: unknown): preset is ColorPreset {
  if (!preset || typeof preset !== 'object') return false
  const p = preset as Partial<ColorPreset>
  if (typeof p.id !== 'string' || !p.id.trim()) return false
  if (typeof p.name !== 'string' || !p.name.trim()) return false
  if (typeof p.description !== 'string') return false
  if (p.paletteSource !== 'pantone' && p.paletteSource !== 'ral') return false
  if (!p.colors || typeof p.colors !== 'object') return false

  const keys: (keyof MaterialColorMap)[] = [
    'body',
    'sole',
    'laces',
    'accent',
    'logo',
  ]
  return keys.every((key) => {
    const hex = p.colors?.[key]
    return typeof hex === 'string' && validateHexColor(hex).ok
  })
}

/** Нормализация цветов пресета */
export function normalizePresetColors(colors: MaterialColorMap): MaterialColorMap {
  return {
    body: normalizeHex(colors.body),
    sole: normalizeHex(colors.sole),
    laces: normalizeHex(colors.laces),
    accent: normalizeHex(colors.accent),
    logo: normalizeHex(colors.logo),
  }
}
