import { Suspense, Component, type ReactNode, useEffect } from 'react'
import { useGLTF, Center } from '@react-three/drei'
import { useConfiguratorStore } from '@/store/configuratorStore'
import { applyColorsToObject } from '@/lib/materials'
import { logger } from '@/lib/logger'
import { ProceduralSneaker } from '@/components/scene/ProceduralSneaker'
import { UnboxGroup } from '@/components/scene/UnboxGroup'

function GltfProduct({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const colors = useConfiguratorStore((s) => s.colors)

  useEffect(() => {
    applyColorsToObject(scene, colors)
  }, [scene, colors])

  return (
    <UnboxGroup>
      <Center>
        <primitive object={scene} />
      </Center>
    </UnboxGroup>
  )
}

class GltfErrorBoundary extends Component<
  { children: ReactNode; onError: (message: string) => void },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    logger.error('Ошибка загрузки glTF', error)
    this.props.onError(
      'Не удалось загрузить модель. Проверьте файл и попробуйте снова.',
    )
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}

/**
 * Товар на сцене: процедурная модель или загруженный glTF.
 */
export function ProductModel() {
  const modelUrl = useConfiguratorStore((s) => s.modelUrl)
  const colors = useConfiguratorStore((s) => s.colors)
  const setError = useConfiguratorStore((s) => s.setError)

  if (!modelUrl) {
    return (
      <UnboxGroup>
        <ProceduralSneaker colors={colors} />
      </UnboxGroup>
    )
  }

  return (
    <GltfErrorBoundary
      key={modelUrl}
      onError={(message) => setError(message)}
    >
      <Suspense fallback={null}>
        <GltfProduct url={modelUrl} />
      </Suspense>
    </GltfErrorBoundary>
  )
}
