import { create } from 'zustand'
import type {
  MaterialColorMap,
  MaterialSlotId,
  PaletteSource,
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

  initFromPersistence: () => {
    const fromHash = decodeConfigFromHash(window.location.hash)
    const fromLocal = loadConfigFromLocal()
    const source = fromHash ?? fromLocal

    if (source) {
      set({
        colors: source.colors,
        paletteSource: source.paletteSource,
        activeSlot: source.activeSlot,
      })
      logger.info('Конфигурация восстановлена')
    }
  },

  setActiveSlot: (slot) => {
    set({ activeSlot: slot })
    const { colors, paletteSource } = get()
    persistSideEffects(colors, paletteSource, slot)
  },

  setPaletteSource: (source) => {
    set({ paletteSource: source })
    const { colors, activeSlot } = get()
    persistSideEffects(colors, source, activeSlot)
  },

  setSlotColor: (slot, hex) => {
    const check = validateHexColor(hex)
    if (!check.ok) {
      set({ error: check.error ?? 'Неверный цвет.' })
      return
    }

    const normalized = normalizeHex(hex)
    const colors = { ...get().colors, [slot]: normalized }
    set({ colors, error: null })
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

  resetColors: () => {
    const colors = { ...DEFAULT_COLORS }
    set({ colors, error: null, toast: 'Цвета сброшены к исходным.' })
    const { paletteSource, activeSlot } = get()
    persistSideEffects(colors, paletteSource, activeSlot)
  },

  persist: () => {
    const { colors, paletteSource, activeSlot } = get()
    persistSideEffects(colors, paletteSource, activeSlot)
  },
}))
