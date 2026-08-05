import type { MaterialColorMap, MaterialSlotId, PaletteSource } from '@/types'
import { DEFAULT_COLORS } from '@/lib/constants'
import { validateHexColor, normalizeHex } from '@/lib/validation'
import { logger } from '@/lib/logger'

export interface HashConfig {
  colors: MaterialColorMap
  paletteSource: PaletteSource
  activeSlot: MaterialSlotId
}

/** Сериализация конфигурации в URL hash */
export function encodeConfigToHash(config: HashConfig): string {
  const payload = {
    c: {
      b: normalizeHex(config.colors.body).slice(1),
      s: normalizeHex(config.colors.sole).slice(1),
      l: normalizeHex(config.colors.laces).slice(1),
      a: normalizeHex(config.colors.accent).slice(1),
      o: normalizeHex(config.colors.logo).slice(1),
    },
    p: config.paletteSource === 'ral' ? 'r' : 'p',
    m: config.activeSlot,
  }

  return `#cfg=${encodeURIComponent(JSON.stringify(payload))}`
}

/** Разбор конфигурации из URL hash */
export function decodeConfigFromHash(hash: string): HashConfig | null {
  try {
    const raw = hash.startsWith('#') ? hash.slice(1) : hash
    const match = raw.match(/(?:^|&)cfg=([^&]+)/)
    const encoded = match?.[1]
    if (!encoded) return null

    const payload = JSON.parse(decodeURIComponent(encoded)) as {
      c?: Record<string, string>
      p?: string
      m?: string
    }

    if (!payload.c) return null

    const colors: MaterialColorMap = {
      body: toHex(payload.c.b, DEFAULT_COLORS.body),
      sole: toHex(payload.c.s, DEFAULT_COLORS.sole),
      laces: toHex(payload.c.l, DEFAULT_COLORS.laces),
      accent: toHex(payload.c.a, DEFAULT_COLORS.accent),
      logo: toHex(payload.c.o, DEFAULT_COLORS.logo),
    }

    const paletteSource: PaletteSource = payload.p === 'r' ? 'ral' : 'pantone'
    const slots: MaterialSlotId[] = ['body', 'sole', 'laces', 'accent', 'logo']
    const activeSlot = slots.includes(payload.m as MaterialSlotId)
      ? (payload.m as MaterialSlotId)
      : 'body'

    return { colors, paletteSource, activeSlot }
  } catch (error) {
    logger.warn('Не удалось разобрать конфигурацию из адреса', error)
    return null
  }
}

function toHex(value: string | undefined, fallback: string): string {
  if (!value) return fallback
  const candidate = value.startsWith('#') ? value : `#${value}`
  return validateHexColor(candidate).ok ? normalizeHex(candidate) : fallback
}

/** Применение hash к истории браузера без перезагрузки */
export function writeHashConfig(config: HashConfig): void {
  try {
    const next = encodeConfigToHash(config)
    if (window.location.hash !== next) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${next}`)
    }
  } catch (error) {
    logger.error('Не удалось обновить адрес страницы', error)
  }
}
