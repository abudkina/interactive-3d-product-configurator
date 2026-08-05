import type { MaterialSlot, MaterialColorMap } from '@/types'

/** Слоты материалов кроссовка по умолчанию */
export const MATERIAL_SLOTS: MaterialSlot[] = [
  { id: 'body', label: 'Корпус', meshNames: ['body'] },
  { id: 'sole', label: 'Подошва', meshNames: ['sole', 'midsole'] },
  { id: 'laces', label: 'Шнурки', meshNames: ['laces'] },
  { id: 'accent', label: 'Акцент', meshNames: ['accent', 'stripe'] },
  { id: 'logo', label: 'Логотип', meshNames: ['logo'] },
]

export const DEFAULT_COLORS: MaterialColorMap = {
  body: '#2A5A8C',
  sole: '#F5F5F0',
  laces: '#E8E8E8',
  accent: '#E15501',
  logo: '#0A0A0A',
}

/** Максимальный размер загружаемой модели (50 МБ) */
export const MAX_MODEL_BYTES = 50 * 1024 * 1024

/** Допустимые расширения glTF */
export const ALLOWED_MODEL_EXTENSIONS = ['.glb', '.gltf'] as const

export const ALLOWED_MODEL_MIME = [
  'model/gltf-binary',
  'model/gltf+json',
  'application/octet-stream',
  '',
] as const

export const SCREENSHOT_DEFAULT = {
  width: 1920,
  height: 1080,
  mimeType: 'image/png' as const,
}

export const STORAGE_KEYS = {
  config: 'configurator:v1:config',
  history: 'configurator:v1:history',
} as const
