import { describe, it, expect } from 'vitest'
import { encodeConfigToHash, decodeConfigFromHash } from '@/lib/hashConfig'
import { DEFAULT_COLORS } from '@/lib/constants'

describe('hashConfig', () => {
  it('кодирует и декодирует конфигурацию', () => {
    const config = {
      colors: { ...DEFAULT_COLORS, body: '#112233' },
      paletteSource: 'ral' as const,
      activeSlot: 'sole' as const,
    }

    const hash = encodeConfigToHash(config)
    expect(hash.startsWith('#cfg=')).toBe(true)

    const decoded = decodeConfigFromHash(hash)
    expect(decoded).not.toBeNull()
    expect(decoded?.colors.body).toBe('#112233')
    expect(decoded?.paletteSource).toBe('ral')
    expect(decoded?.activeSlot).toBe('sole')
  })

  it('возвращает null для мусора', () => {
    expect(decodeConfigFromHash('#abc')).toBeNull()
    expect(decodeConfigFromHash('#cfg=%%%')).toBeNull()
  })
})
