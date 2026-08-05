import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { MaterialColorMap } from '@/types'
import { STORAGE_KEYS, DEFAULT_COLORS } from '@/lib/constants'
import { logger } from '@/lib/logger'
import { validateHexColor, normalizeHex } from '@/lib/validation'

interface ConfiguratorDB extends DBSchema {
  snapshots: {
    key: string
    value: {
      id: string
      createdAt: number
      blob: Blob
      label: string
    }
  }
  models: {
    key: string
    value: {
      id: string
      name: string
      blob: Blob
      savedAt: number
    }
  }
}

let dbPromise: Promise<IDBPDatabase<ConfiguratorDB>> | null = null

function getDb(): Promise<IDBPDatabase<ConfiguratorDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ConfiguratorDB>('configurator-3d', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('snapshots')) {
          db.createObjectStore('snapshots', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('models')) {
          db.createObjectStore('models', { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

export interface PersistedConfig {
  colors: MaterialColorMap
  paletteSource: 'pantone' | 'ral'
  activeSlot: keyof MaterialColorMap
}

function isMaterialColorMap(value: unknown): value is MaterialColorMap {
  if (!value || typeof value !== 'object') return false
  const map = value as Record<string, unknown>
  const keys: (keyof MaterialColorMap)[] = [
    'body',
    'sole',
    'laces',
    'accent',
    'logo',
  ]
  return keys.every((key) => {
    const color = map[key]
    return typeof color === 'string' && validateHexColor(color).ok
  })
}

/** Сохранение конфигурации в LocalStorage */
export function saveConfigToLocal(config: PersistedConfig): void {
  try {
    const normalized: PersistedConfig = {
      ...config,
      colors: {
        body: normalizeHex(config.colors.body),
        sole: normalizeHex(config.colors.sole),
        laces: normalizeHex(config.colors.laces),
        accent: normalizeHex(config.colors.accent),
        logo: normalizeHex(config.colors.logo),
      },
    }
    localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(normalized))
  } catch (error) {
    logger.error('Не удалось сохранить конфигурацию в LocalStorage', error)
  }
}

/** Загрузка конфигурации из LocalStorage */
export function loadConfigFromLocal(): PersistedConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.config)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<PersistedConfig>
    if (!isMaterialColorMap(parsed.colors)) return null

    return {
      colors: parsed.colors,
      paletteSource:
        parsed.paletteSource === 'ral' || parsed.paletteSource === 'pantone'
          ? parsed.paletteSource
          : 'pantone',
      activeSlot:
        parsed.activeSlot && parsed.activeSlot in DEFAULT_COLORS
          ? parsed.activeSlot
          : 'body',
    }
  } catch (error) {
    logger.error('Не удалось прочитать конфигурацию из LocalStorage', error)
    return null
  }
}

/** Очистка конфигурации */
export function clearLocalConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.config)
  } catch (error) {
    logger.error('Не удалось очистить LocalStorage', error)
  }
}

/** Сохранение скриншота в IndexedDB */
export async function saveSnapshot(
  blob: Blob,
  label: string,
): Promise<string> {
  const db = await getDb()
  const id = `snap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  await db.put('snapshots', {
    id,
    createdAt: Date.now(),
    blob,
    label,
  })
  return id
}

/** Список скриншотов */
export async function listSnapshots() {
  const db = await getDb()
  return db.getAll('snapshots')
}

/** Сохранение модели в IndexedDB */
export async function saveModelBlob(
  name: string,
  blob: Blob,
): Promise<string> {
  const db = await getDb()
  const id = `model-${Date.now()}`
  await db.put('models', {
    id,
    name,
    blob,
    savedAt: Date.now(),
  })
  return id
}

/** Получение последней сохранённой модели */
export async function getLatestModel() {
  const db = await getDb()
  const all = await db.getAll('models')
  if (!all.length) return null
  return all.sort((a, b) => b.savedAt - a.savedAt)[0] ?? null
}
