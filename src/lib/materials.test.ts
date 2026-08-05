import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { applyColorsToObject, createStandardMaterial } from '@/lib/materials'
import { DEFAULT_COLORS } from '@/lib/constants'

describe('materials', () => {
  it('создаёт MeshStandardMaterial с цветом', () => {
    const mat = createStandardMaterial('#FF0000')
    expect(mat).toBeInstanceOf(THREE.MeshStandardMaterial)
    expect(mat.color.getHexString().toUpperCase()).toBe('FF0000')
    mat.dispose()
  })

  it('применяет цвета по имени меша', () => {
    const root = new THREE.Group()
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshStandardMaterial({ color: '#000000' }),
    )
    body.name = 'body'
    root.add(body)

    applyColorsToObject(root, { ...DEFAULT_COLORS, body: '#112233' })
    const mat = body.material as THREE.MeshStandardMaterial
    expect(mat.color.getHexString().toUpperCase()).toBe('112233')

    body.geometry.dispose()
    mat.dispose()
  })
})
