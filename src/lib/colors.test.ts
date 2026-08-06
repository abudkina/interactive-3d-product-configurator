import { describe, it, expect } from 'vitest'
import {
  hexToRgb,
  rgbToHex,
  colorDistance,
  findClosestColor,
  contrastTextColor,
  formatSwatchLabel,
  remapColorMapToPalette,
} from '@/lib/colors'
import type { ColorSwatch } from '@/types'

const palette: ColorSwatch[] = [
  { code: 'RAL 5002', name: 'Ультрамариновый', hex: '1A237E', source: 'ral' },
  { code: 'RAL 3020', name: 'Транспортный красный', hex: 'C1121C', source: 'ral' },
  { code: 'RAL 9010', name: 'Чисто белый', hex: 'F7F9EF', source: 'ral' },
]

describe('colors', () => {
  it('конвертирует HEX ↔ RGB', () => {
    expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 })
    expect(rgbToHex(255, 0, 0)).toBe('#FF0000')
  })

  it('считает расстояние цветов', () => {
    expect(colorDistance({ r: 0, g: 0, b: 0 }, { r: 0, g: 0, b: 0 })).toBe(0)
    expect(
      colorDistance({ r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }),
    ).toBe(255)
  })

  it('находит ближайший цвет', () => {
    const result = findClosestColor('#1B2480', palette)
    expect(result?.swatch.code).toBe('RAL 5002')
  })

  it('выбирает контрастный текст', () => {
    expect(contrastTextColor('#FFFFFF')).toBe('#0A0A0A')
    expect(contrastTextColor('#000000')).toBe('#FFFFFF')
  })

  it('форматирует подпись образца', () => {
    expect(formatSwatchLabel(palette[0]!)).toContain('Ультрамариновый')
  })

  it('переназначает карту цветов на палитру', () => {
    const remapped = remapColorMapToPalette(
      {
        body: '#1B2480',
        sole: '#FFFFFF',
        laces: '#EEEEEE',
        accent: '#CC0000',
        logo: '#111111',
      },
      palette,
    )
    expect(remapped.body).toBe('#1A237E')
    expect(remapped.sole).toBe('#F7F9EF')
    expect(remapped.accent).toBe('#C1121C')
  })
})
