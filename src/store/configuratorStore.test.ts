import { describe, it, expect, beforeEach } from 'vitest'
import { useConfiguratorStore } from '@/store/configuratorStore'
import { DEFAULT_COLORS, STORAGE_KEYS } from '@/lib/constants'

describe('configuratorStore', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState(null, '', '/')
    useConfiguratorStore.setState({
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
    })
  })

  it('устанавливает цвет слота и сохраняет в LocalStorage', () => {
    useConfiguratorStore.getState().setSlotColor('body', '#abcdef')
    expect(useConfiguratorStore.getState().colors.body).toBe('#ABCDEF')

    const raw = localStorage.getItem(STORAGE_KEYS.config)
    expect(raw).toBeTruthy()
    expect(raw).toContain('ABCDEF')
  })

  it('отклоняет неверный цвет', () => {
    useConfiguratorStore.getState().setSlotColor('body', 'не цвет')
    expect(useConfiguratorStore.getState().error).toMatch(/формат|цвет/i)
  })

  it('сбрасывает цвета', () => {
    useConfiguratorStore.getState().setSlotColor('accent', '#123456')
    useConfiguratorStore.getState().resetColors()
    expect(useConfiguratorStore.getState().colors).toEqual(DEFAULT_COLORS)
    expect(useConfiguratorStore.getState().toast).toMatch(/сброшены/i)
  })

  it('восстанавливает из LocalStorage', () => {
    useConfiguratorStore.getState().setSlotColor('laces', '#445566')
    useConfiguratorStore.getState().setPaletteSource('ral')

    useConfiguratorStore.setState({ colors: { ...DEFAULT_COLORS } })
    useConfiguratorStore.getState().initFromPersistence()

    expect(useConfiguratorStore.getState().colors.laces).toBe('#445566')
    expect(useConfiguratorStore.getState().paletteSource).toBe('ral')
  })
})
