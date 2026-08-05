import type { ValidationResult } from '@/types'
import {
  ALLOWED_MODEL_EXTENSIONS,
  MAX_MODEL_BYTES,
} from '@/lib/constants'

/** Проверка HEX-цвета (#RGB или #RRGGBB) */
export function validateHexColor(value: string): ValidationResult {
  if (typeof value !== 'string' || value.trim() === '') {
    return { ok: false, error: 'Цвет не указан.' }
  }

  const normalized = value.trim()
  if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(normalized)) {
    return {
      ok: false,
      error: 'Неверный формат цвета. Ожидается #RGB или #RRGGBB.',
    }
  }

  return { ok: true }
}

/** Нормализация HEX к виду #RRGGBB в верхнем регистре */
export function normalizeHex(value: string): string {
  const trimmed = value.trim()
  if (!trimmed.startsWith('#')) {
    return `#${trimmed}`.toUpperCase()
  }
  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase()
  }
  return trimmed.toUpperCase()
}

/** Проверка URL модели */
export function validateModelUrl(url: string): ValidationResult {
  if (typeof url !== 'string' || url.trim() === '') {
    return { ok: false, error: 'Адрес модели не указан.' }
  }

  const trimmed = url.trim()

  try {
    const parsed = new URL(trimmed, window.location.origin)
    if (!['http:', 'https:', 'blob:', 'data:'].includes(parsed.protocol)) {
      return {
        ok: false,
        error: 'Поддерживаются только адреса http, https, blob или data.',
      }
    }
  } catch {
    return { ok: false, error: 'Адрес модели имеет неверный формат.' }
  }

  const lower = trimmed.toLowerCase()
  const hasAllowedExt = ALLOWED_MODEL_EXTENSIONS.some((ext) =>
    lower.includes(ext),
  )
  const isBlobOrData =
    lower.startsWith('blob:') || lower.startsWith('data:')

  if (!hasAllowedExt && !isBlobOrData) {
    return {
      ok: false,
      error: 'Модель должна быть в формате .glb или .gltf.',
    }
  }

  return { ok: true }
}

/** Проверка загружаемого файла модели */
export function validateModelFile(file: File): ValidationResult {
  if (!(file instanceof File)) {
    return { ok: false, error: 'Файл не выбран.' }
  }

  if (file.size === 0) {
    return { ok: false, error: 'Файл пустой. Выберите корректную модель.' }
  }

  if (file.size > MAX_MODEL_BYTES) {
    return {
      ok: false,
      error: `Файл слишком большой. Максимум ${Math.round(MAX_MODEL_BYTES / (1024 * 1024))} МБ.`,
    }
  }

  const name = file.name.toLowerCase()
  const okExt = ALLOWED_MODEL_EXTENSIONS.some((ext) => name.endsWith(ext))
  if (!okExt) {
    return {
      ok: false,
      error: 'Неподдерживаемый формат. Загрузите файл .glb или .gltf.',
    }
  }

  return { ok: true }
}

/** Базовая проверка целостности ArrayBuffer glTF/GLB */
export async function validateModelBuffer(
  buffer: ArrayBuffer,
  fileName: string,
): Promise<ValidationResult> {
  if (!buffer || buffer.byteLength < 12) {
    return { ok: false, error: 'Файл повреждён или слишком короткий.' }
  }

  const lower = fileName.toLowerCase()

  if (lower.endsWith('.glb')) {
    const view = new DataView(buffer)
    const magic = view.getUint32(0, true)
    // glTF binary magic: 'glTF' = 0x46546C67
    if (magic !== 0x46546c67) {
      return {
        ok: false,
        error: 'Файл .glb повреждён: неверная сигнатура.',
      }
    }
    const version = view.getUint32(4, true)
    if (version !== 2) {
      return {
        ok: false,
        error: 'Поддерживается только glTF версии 2.0.',
      }
    }
    return { ok: true }
  }

  if (lower.endsWith('.gltf')) {
    try {
      const text = new TextDecoder().decode(buffer.slice(0, Math.min(buffer.byteLength, 512)))
      const trimmed = text.trim()
      if (!trimmed.startsWith('{')) {
        return {
          ok: false,
          error: 'Файл .gltf повреждён: ожидается JSON.',
        }
      }
      return { ok: true }
    } catch {
      return { ok: false, error: 'Не удалось прочитать файл .gltf.' }
    }
  }

  return { ok: false, error: 'Неизвестный формат модели.' }
}
