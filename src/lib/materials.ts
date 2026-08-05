import * as THREE from 'three'
import type { MaterialColorMap, MaterialSlotId } from '@/types'
import { MATERIAL_SLOTS } from '@/lib/constants'
import { logger } from '@/lib/logger'

/** Применение цветов к материалам сцены по именам мешей */
export function applyColorsToObject(
  root: THREE.Object3D,
  colors: MaterialColorMap,
): void {
  const slotByMesh = new Map<string, MaterialSlotId>()
  for (const slot of MATERIAL_SLOTS) {
    for (const meshName of slot.meshNames) {
      slotByMesh.set(meshName.toLowerCase(), slot.id)
    }
  }

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return

    const name = child.name.toLowerCase()
    let slotId = slotByMesh.get(name)

    // Эвристика для загруженных glTF без наших имён
    if (!slotId) {
      if (name.includes('sole') || name.includes('подошв')) slotId = 'sole'
      else if (name.includes('lace') || name.includes('шнур')) slotId = 'laces'
      else if (name.includes('logo') || name.includes('лого')) slotId = 'logo'
      else if (name.includes('accent') || name.includes('stripe')) slotId = 'accent'
      else slotId = 'body'
    }

    const hex = colors[slotId]
    applyHexToMaterial(child.material, hex)
  })
}

function applyHexToMaterial(
  material: THREE.Material | THREE.Material[],
  hex: string,
): void {
  const applyOne = (mat: THREE.Material) => {
    if (
      mat instanceof THREE.MeshStandardMaterial ||
      mat instanceof THREE.MeshPhysicalMaterial ||
      mat instanceof THREE.MeshLambertMaterial ||
      mat instanceof THREE.MeshPhongMaterial ||
      mat instanceof THREE.MeshBasicMaterial
    ) {
      mat.color.set(hex)
      mat.needsUpdate = true
    } else {
      logger.debug('Пропуск неподдерживаемого материала', mat.type)
    }
  }

  if (Array.isArray(material)) {
    material.forEach(applyOne)
  } else {
    applyOne(material)
  }
}

/** Создаёт стандартный материал с заданным цветом */
export function createStandardMaterial(
  hex: string,
  extras: Partial<THREE.MeshStandardMaterialParameters> = {},
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: hex,
    roughness: 0.55,
    metalness: 0.08,
    ...extras,
  })
}
