import { describe, it, expect } from 'vitest'
import {
  validateHexColor,
  normalizeHex,
  validateModelFile,
  validateModelUrl,
  validateModelBuffer,
} from '@/lib/validation'

describe('validateHexColor', () => {
  it('принимает корректные HEX', () => {
    expect(validateHexColor('#fff').ok).toBe(true)
    expect(validateHexColor('#AABBCC').ok).toBe(true)
  })

  it('отклоняет пустые и неверные значения', () => {
    expect(validateHexColor('').ok).toBe(false)
    expect(validateHexColor('red').ok).toBe(false)
    expect(validateHexColor('#GG0000').ok).toBe(false)
    expect(validateHexColor('').error).toMatch(/не указан/i)
  })
})

describe('normalizeHex', () => {
  it('нормализует короткий HEX', () => {
    expect(normalizeHex('#abc')).toBe('#AABBCC')
  })

  it('приводит к верхнему регистру', () => {
    expect(normalizeHex('#a1b2c3')).toBe('#A1B2C3')
  })
})

describe('validateModelFile', () => {
  it('принимает .glb в пределах лимита', () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'модель.glb', {
      type: 'model/gltf-binary',
    })
    expect(validateModelFile(file).ok).toBe(true)
  })

  it('отклоняет неверный формат', () => {
    const file = new File(['x'], 'фото.png')
    const result = validateModelFile(file)
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/формат/i)
  })

  it('отклоняет пустой файл', () => {
    const file = new File([], 'пустой.glb')
    expect(validateModelFile(file).ok).toBe(false)
  })
})

describe('validateModelUrl', () => {
  it('принимает https с .glb', () => {
    expect(
      validateModelUrl('https://cdn.example.com/shoe.glb').ok,
    ).toBe(true)
  })

  it('отклоняет пустой адрес', () => {
    const result = validateModelUrl('  ')
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/не указан/i)
  })

  it('отклоняет неподдерживаемый протокол', () => {
    const result = validateModelUrl('ftp://files.example.com/a.glb')
    expect(result.ok).toBe(false)
  })
})

describe('validateModelBuffer', () => {
  it('проверяет сигнатуру GLB', async () => {
    const buffer = new ArrayBuffer(20)
    const view = new DataView(buffer)
    view.setUint32(0, 0x46546c67, true)
    view.setUint32(4, 2, true)
    view.setUint32(8, 20, true)

    const result = await validateModelBuffer(buffer, 'test.glb')
    expect(result.ok).toBe(true)
  })

  it('отклоняет повреждённый GLB', async () => {
    const buffer = new ArrayBuffer(20)
    const result = await validateModelBuffer(buffer, 'bad.glb')
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/поврежд/i)
  })

  it('принимает начало JSON для gltf', async () => {
    const text = '{"asset":{"version":"2.0"}}'
    const buffer = new TextEncoder().encode(text).buffer
    const result = await validateModelBuffer(buffer, 'model.gltf')
    expect(result.ok).toBe(true)
  })
})
