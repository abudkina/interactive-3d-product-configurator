import { describe, it, expect } from 'vitest'
import {
  getPresets,
  findPresetById,
  validatePreset,
  normalizePresetColors,
} from '@/lib/presets'

describe('presets', () => {
  it('возвращает непустой список пресетов', () => {
    const list = getPresets()
    expect(list.length).toBeGreaterThan(0)
    expect(list.every(validatePreset)).toBe(true)
  })

  it('находит пресет по идентификатору', () => {
    const first = getPresets()[0]!
    expect(findPresetById(first.id)?.name).toBe(first.name)
    expect(findPresetById('нет-такого')).toBeNull()
  })

  it('отклоняет повреждённый пресет', () => {
    expect(validatePreset({ id: 'x' })).toBe(false)
    expect(
      validatePreset({
        id: 'x',
        name: 'Тест',
        description: '',
        paletteSource: 'ral',
        colors: {
          body: 'не цвет',
          sole: '#fff',
          laces: '#fff',
          accent: '#fff',
          logo: '#fff',
        },
      }),
    ).toBe(false)
  })

  it('нормализует HEX цветов', () => {
    expect(
      normalizePresetColors({
        body: '#abc',
        sole: '#112233',
        laces: '#fff',
        accent: '#000',
        logo: '#AbCdEf',
      }).body,
    ).toBe('#AABBCC')
  })
})
