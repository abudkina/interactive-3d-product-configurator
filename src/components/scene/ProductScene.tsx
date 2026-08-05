import { Canvas } from '@react-three/fiber'
import {
  OrbitControls,
  ContactShadows,
  Center,
} from '@react-three/drei'
import { ProductModel } from '@/components/scene/ProductModel'
import { useConfiguratorStore } from '@/store/configuratorStore'
import { useEffect } from 'react'

/**
 * Основная 3D-сцена с OrbitControls и студийным освещением.
 * Без внешних HDR — работает полностью офлайн.
 */
export function ProductScene() {
  const startUnboxing = useConfiguratorStore((s) => s.startUnboxing)

  useEffect(() => {
    startUnboxing()
  }, [startUnboxing])

  return (
    <div className="scene-wrap" role="img" aria-label="Трёхмерная модель товара">
      <Canvas
        shadows={false}
        dpr={[1, 1.5]}
        camera={{ position: [2.4, 1.6, 2.8], fov: 42, near: 0.1, far: 100 }}
        gl={{
          preserveDrawingBuffer: true,
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#DDE3EA', 1)
        }}
      >
        <color attach="background" args={['#DDE3EA']} />
        <hemisphereLight color="#f2f6fa" groundColor="#8a96a3" intensity={0.75} />
        <directionalLight position={[4, 6, 3]} intensity={1.45} />
        <directionalLight position={[-3, 2, -2]} intensity={0.4} />
        <directionalLight position={[0, 3, -4]} intensity={0.25} />

        <Center>
          <ProductModel />
        </Center>

        <ContactShadows
          position={[0, -0.55, 0]}
          opacity={0.4}
          scale={8}
          blur={2.2}
          far={2}
        />

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={1.4}
          maxDistance={8}
          maxPolarAngle={Math.PI * 0.49}
          target={[0, 0.1, 0]}
        />
      </Canvas>
    </div>
  )
}
