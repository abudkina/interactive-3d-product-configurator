import { create } from 'zustand'
import type {
  MaterialColorMap,
  MaterialSlotId,
  PaletteSource,
  ColorSwatch,
} from '@/types'
import { DEFAULT_COLORS } from '@/lib/constants'
import {
  loadConfigFromLocal,
  saveConfigToLocal,
} from '@/lib/storage'
import {
  decodeConfigFromHash,
  writeHashConfig,
} from '@/lib/hashConfig'
import { normalizeHex, validateHexColor } from '@/lib/validation'
import { logger } from '@/lib/logger'
import {
  type ColorPreset,
  normalizePresetColors,
  validatePreset,
} from '@/lib/presets'
import { remapColorMapToPalette } from '@/lib/colors'
import pantone from '@/data/pantone.json'
import ral from '@/data/ral.json'

export type AppView = 'configurator' | 'gallery'

const pantoneSwatches = pantone as ColorSwatch[]
const ralSwatches = ral as ColorSwatch[]

function paletteFor(source: PaletteSource): ColorSwatch[] {
  return source === 'ral' ? ralSwatches : pantoneSwatches
}

interface ConfiguratorStore {
  colors: MaterialColorMap
  activeSlot: MaterialSlotId
  paletteSource: PaletteSource
  modelUrl: string | null
  modelName: string | null
  isUnboxing: boolean
  hasUnboxed: boolean
  error: string | null
  toast: string | null
  panelOpen: boolean
  view: AppView
  specsOpen: boolean
  activePresetId: string | null

  initFromPersistence: () => void
  setActiveSlot: (slot: MaterialSlotId) => void
  setPaletteSource: (source: PaletteSource) => void
  setSlotColor: (slot: MaterialSlotId, hex: string) => void
  setModel: (url: string | null, name: string | null) => void
  startUnboxing: () => void
  finishUnboxing: () => void
  setError: (message: string | null) => void
  setToast: (message: string | null) => void
  setPanelOpen: (open: boolean) => void
  setView: (view: AppView) => void
  setSpecsOpen: (open: boolean) => void
  applyPreset: (preset: ColorPreset) => void
  resetColors: () => void
  persist: () => void
}

function persistSideEffects(
  colors: MaterialColorMap,
  paletteSource: PaletteSource,
  activeSlot: MaterialSlotId,
): void {
  saveConfigToLocal({ colors, paletteSource, activeSlot })
  writeHashConfig({ colors, paletteSource, activeSlot })
}

function syncViewHash(view: AppView): void {
  try {
    const url = new URL(window.location.href)
    if (view === 'gallery') {
      url.searchParams.set('страница', 'галерея')
    } else {
      url.searchParams.delete('страница')
    }
    // Сохраняем hash конфигурации
    const next = `${url.pathname}${url.search}${url.hash}`
    window.history.replaceState(null, '', next)
  } catch (error) {
    logger.warn('Не удалось обновить адрес страницы', error)
  }
}

export const useConfiguratorStore = create<ConfiguratorStore>((set, get) => ({
  colors: { ...DEFAULT_COLORS },
  activeSlot: 'body',
  paletteSource: 'pantone',
  modelUrl: null,
  modelName: null,
  isUnboxing: false,
  hasUnboxed: false,
  error: null,
  toast: null,
  panelOpen: true,
  view: 'configurator',
  specsOpen: false,
  activePresetId: null,

  initFromPersistence: () => {
    const fromHash = decodeConfigFromHash(window.location.hash)
    const fromLocal = loadConfigFromLocal()
    const source = fromHash ?? fromLocal

    const params = new URLSearchParams(window.location.search)
    const page = params.get('страница')
    const view: AppView = page === 'галерея' ? 'gallery' : 'configurator'

    if (source) {
      set({
        colors: source.colors,
        paletteSource: source.paletteSource,
        activeSlot: source.activeSlot,
        view,
      })
      logger.info('Конфигурация восстановлена')
    } else {
      set({ view })
    }
  },

  setActiveSlot: (slot) => {
    set({ activeSlot: slot, activePresetId: null })
    const { colors, paletteSource } = get()
    persistSideEffects(colors, paletteSource, slot)
  },

  setPaletteSource: (source) => {
    const current = get()
    if (current.paletteSource === source) return

    const remapped = remapColorMapToPalette(
      current.colors,
      paletteFor(source),
    )
    const label = source === 'ral' ? 'RAL' : 'Pantone'
    set({
      paletteSource: source,
      colors: remapped,
      activePresetId: null,
      error: null,
      toast: `Цвета подогнаны под палитру ${label}.`,
      isUnboxing: true,
      hasUnboxed: false,
    })
    persistSideEffects(remapped, source, current.activeSlot)
  },

  setSlotColor: (slot, hex) => {
    const check = validateHexColor(hex)
    if (!check.ok) {
      set({ error: check.error ?? 'Неверный цвет.' })
      return
    }

    const normalized = normalizeHex(hex)
    const colors = { ...get().colors, [slot]: normalized }
    set({ colors, error: null, activePresetId: null })
    const { paletteSource, activeSlot } = get()
    persistSideEffects(colors, paletteSource, activeSlot)
  },

  setModel: (url, name) => {
    set({
      modelUrl: url,
      modelName: name,
      isUnboxing: true,
      hasUnboxed: false,
      error: null,
    })
  },

  startUnboxing: () => set({ isUnboxing: true, hasUnboxed: false }),

  finishUnboxing: () => set({ isUnboxing: false, hasUnboxed: true }),

  setError: (message) => set({ error: message }),

  setToast: (message) => set({ toast: message }),

  setPanelOpen: (open) => set({ panelOpen: open }),

  setView: (view) => {
    set({ view })
    syncViewHash(view)
  },

  setSpecsOpen: (open) => set({ specsOpen: open }),

  applyPreset: (preset) => {
    if (!validatePreset(preset)) {
      set({ error: 'Пресет повреждён или имеет неверный формат.' })
      return
    }

    const colors = normalizePresetColors(preset.colors)
    set({
      colors,
      paletteSource: preset.paletteSource,
      activePresetId: preset.id,
      error: null,
      toast: `Применён пресет «${preset.name}».`,
      isUnboxing: true,
      hasUnboxed: false,
    })
    const { activeSlot } = get()
    persistSideEffects(colors, preset.paletteSource, activeSlot)
  },

  resetColors: () => {
    const colors = { ...DEFAULT_COLORS }
    set({
      colors,
      error: null,
      toast: 'Цвета сброшены к исходным.',
      activePresetId: null,
    })
    const { paletteSource, activeSlot } = get()
    persistSideEffects(colors, paletteSource, activeSlot)
  },

  persist: () => {
    const { colors, paletteSource, activeSlot } = get()
    persistSideEffects(colors, paletteSource, activeSlot)
  },
}))
