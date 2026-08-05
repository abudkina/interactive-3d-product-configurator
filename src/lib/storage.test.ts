import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveConfigToLocal,
  loadConfigFromLocal,
  clearLocalConfig,
} from '@/lib/storage'
import { DEFAULT_COLORS, STORAGE_KEYS } from '@/lib/constants'

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('сохраняет и читает конфигурацию', () => {
    saveConfigToLocal({
      colors: { ...DEFAULT_COLORS, body: '#010203' },
      paletteSource: 'pantone',
      activeSlot: 'body',
    })

    const loaded = loadConfigFromLocal()
    expect(loaded?.colors.body).toBe('#010203')
  })

  it('очищает конфигурацию', () => {
    saveConfigToLocal({
      colors: DEFAULT_COLORS,
      paletteSource: 'ral',
      activeSlot: 'logo',
    })
    clearLocalConfig()
    expect(localStorage.getItem(STORAGE_KEYS.config)).toBeNull()
    expect(loadConfigFromLocal()).toBeNull()
  })

  it('игнорирует повреждённые данные', () => {
    localStorage.setItem(STORAGE_KEYS.config, '{не json')
    expect(loadConfigFromLocal()).toBeNull()
  })
})
