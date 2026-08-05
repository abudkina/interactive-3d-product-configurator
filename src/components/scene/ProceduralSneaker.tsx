import { useMemo } from 'react'
import * as THREE from 'three'
import { createStandardMaterial } from '@/lib/materials'
import type { MaterialColorMap } from '@/types'

interface ProceduralSneakerProps {
  colors: MaterialColorMap
}

/**
 * Процедурный кроссовок из примитивов — работает без внешних файлов.
 * Имена мешей соответствуют слотам материалов.
 */
export function ProceduralSneaker({ colors }: ProceduralSneakerProps) {
  const materials = useMemo(
    () => ({
      body: createStandardMaterial(colors.body, { roughness: 0.45 }),
      sole: createStandardMaterial(colors.sole, { roughness: 0.85, metalness: 0 }),
      midsole: createStandardMaterial(colors.sole, { roughness: 0.7 }),
      laces: createStandardMaterial(colors.laces, { roughness: 0.9 }),
      accent: createStandardMaterial(colors.accent, { roughness: 0.35, metalness: 0.15 }),
      logo: createStandardMaterial(colors.logo, { roughness: 0.4, metalness: 0.2 }),
    }),
    [colors],
  )

  // Обновляем цвета при смене палитры без пересоздания геометрии
  materials.body.color.set(colors.body)
  materials.sole.color.set(colors.sole)
  materials.midsole.color.set(colors.sole)
  materials.laces.color.set(colors.laces)
  materials.accent.color.set(colors.accent)
  materials.logo.color.set(colors.logo)

  return (
    <group name="sneaker" rotation={[0, Math.PI * 0.15, 0]} position={[0, -0.15, 0]}>
      {/* Корпус */}
      <mesh name="body" castShadow receiveShadow position={[0, 0.28, 0]} material={materials.body}>
        <boxGeometry args={[1.55, 0.42, 0.62]} />
      </mesh>
      <mesh name="body" castShadow receiveShadow position={[0.55, 0.38, 0]} material={materials.body}>
        <boxGeometry args={[0.55, 0.35, 0.58]} />
      </mesh>
      {/* Носок */}
      <mesh
        name="body"
        castShadow
        receiveShadow
        position={[0.85, 0.22, 0]}
        rotation={[0, 0, -0.25]}
        material={materials.body}
      >
        <sphereGeometry args={[0.28, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
      </mesh>

      {/* Подошва */}
      <mesh name="sole" castShadow receiveShadow position={[0.05, 0.05, 0]} material={materials.sole}>
        <boxGeometry args={[1.7, 0.12, 0.68]} />
      </mesh>
      <mesh name="midsole" castShadow receiveShadow position={[0.05, 0.14, 0]} material={materials.midsole}>
        <boxGeometry args={[1.65, 0.08, 0.64]} />
      </mesh>

      {/* Акцентная полоса */}
      <mesh name="accent" castShadow position={[0.1, 0.3, 0.32]} material={materials.accent}>
        <boxGeometry args={[1.1, 0.08, 0.02]} />
      </mesh>
      <mesh name="stripe" castShadow position={[0.1, 0.3, -0.32]} material={materials.accent}>
        <boxGeometry args={[1.1, 0.08, 0.02]} />
      </mesh>

      {/* Шнурки */}
      {[0.15, 0.32, 0.49].map((x, i) => (
        <mesh
          key={`lace-${i}`}
          name="laces"
          castShadow
          position={[x, 0.52, 0]}
          material={materials.laces}
        >
          <boxGeometry args={[0.08, 0.04, 0.42]} />
        </mesh>
      ))}

      {/* Логотип */}
      <mesh name="logo" castShadow position={[-0.35, 0.35, 0.315]} material={materials.logo}>
        <circleGeometry args={[0.1, 24]} />
      </mesh>
    </group>
  )
}

/** Освобождение материалов при размонтировании — через dispose в родителе при необходимости */
export function disposeSneakerMaterials(mats: Record<string, THREE.Material>): void {
  Object.values(mats).forEach((m) => m.dispose())
}
