import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useConfiguratorStore } from '@/store/configuratorStore'

interface UnboxGroupProps {
  children: React.ReactNode
}

/**
 * Анимация «распаковки»: лёгкий подпрыг и появление модели.
 */
export function UnboxGroup({ children }: UnboxGroupProps) {
  const group = useRef<THREE.Group>(null)
  const isUnboxing = useConfiguratorStore((s) => s.isUnboxing)
  const hasUnboxed = useConfiguratorStore((s) => s.hasUnboxed)
  const finishUnboxing = useConfiguratorStore((s) => s.finishUnboxing)
  const elapsed = useRef(0)
  const started = useRef(false)

  useEffect(() => {
    if (isUnboxing) {
      elapsed.current = 0
      started.current = true
      if (group.current) {
        group.current.scale.setScalar(0.01)
        group.current.position.y = -0.4
        group.current.rotation.y = -0.6
      }
    }
  }, [isUnboxing])

  useFrame((_, delta) => {
    if (!group.current || !started.current) return
    if (hasUnboxed && !isUnboxing) {
      group.current.scale.setScalar(1)
      group.current.position.y = 0
      return
    }

    elapsed.current += delta
    const t = Math.min(elapsed.current / 1.15, 1)
    // easeOutBack
    const c1 = 1.70158
    const c3 = c1 + 1
    const eased = 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2

    const bounce = Math.sin(t * Math.PI) * 0.18 * (1 - t)
    group.current.scale.setScalar(Math.max(0.01, eased))
    group.current.position.y = -0.4 * (1 - eased) + bounce
    group.current.rotation.y = -0.6 * (1 - eased)

    if (t >= 1) {
      started.current = false
      finishUnboxing()
    }
  })

  return <group ref={group}>{children}</group>
}
