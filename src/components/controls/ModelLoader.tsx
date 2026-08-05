import { useId, useRef, useState } from 'react'
import { useConfiguratorStore } from '@/store/configuratorStore'
import {
  validateModelFile,
  validateModelUrl,
  validateModelBuffer,
} from '@/lib/validation'
import { saveModelBlob } from '@/lib/storage'
import { logger } from '@/lib/logger'

export function ModelLoader() {
  const fileId = useId()
  const urlId = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)

  const setModel = useConfiguratorStore((s) => s.setModel)
  const setError = useConfiguratorStore((s) => s.setError)
  const setToast = useConfiguratorStore((s) => s.setToast)
  const modelName = useConfiguratorStore((s) => s.modelName)

  const handleFile = async (file: File | undefined) => {
    if (!file) {
      setError('Файл не выбран.')
      return
    }

    const check = validateModelFile(file)
    if (!check.ok) {
      setError(check.error ?? 'Ошибка проверки файла.')
      return
    }

    setBusy(true)
    setError(null)

    try {
      const buffer = await file.arrayBuffer()
      const integrity = await validateModelBuffer(buffer, file.name)
      if (!integrity.ok) {
        setError(integrity.error ?? 'Файл повреждён.')
        return
      }

      const blob = new Blob([buffer], {
        type: file.name.toLowerCase().endsWith('.gltf')
          ? 'model/gltf+json'
          : 'model/gltf-binary',
      })

      await saveModelBlob(file.name, blob)
      const objectUrl = URL.createObjectURL(blob)
      setModel(objectUrl, file.name)
      setToast(`Модель «${file.name}» загружена.`)
    } catch (error) {
      logger.error('Ошибка загрузки модели', error)
      setError('Не удалось загрузить модель. Попробуйте другой файл.')
    } finally {
      setBusy(false)
    }
  }

  const handleUrl = async () => {
    const check = validateModelUrl(url)
    if (!check.ok) {
      setError(check.error ?? 'Неверный адрес.')
      return
    }

    setBusy(true)
    setError(null)

    try {
      const response = await fetch(url.trim())
      if (!response.ok) {
        setError(
          `Модель недоступна (код ${response.status}). Проверьте адрес.`,
        )
        return
      }

      const buffer = await response.arrayBuffer()
      const nameGuess =
        url.trim().split('/').pop()?.split('?')[0] || 'model.glb'
      const integrity = await validateModelBuffer(buffer, nameGuess)
      if (!integrity.ok) {
        setError(integrity.error ?? 'Файл по адресу повреждён.')
        return
      }

      const blob = new Blob([buffer])
      const objectUrl = URL.createObjectURL(blob)
      setModel(objectUrl, nameGuess)
      setToast('Модель загружена по адресу.')
    } catch (error) {
      logger.error('Ошибка загрузки по URL', error)
      setError(
        'Не удалось скачать модель. Проверьте адрес и доступность файла.',
      )
    } finally {
      setBusy(false)
    }
  }

  const restoreDefault = () => {
    setModel(null, null)
    useConfiguratorStore.getState().startUnboxing()
    setToast('Показана встроенная модель кроссовка.')
    setUrl('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <section className="panel-section" aria-labelledby="model-title">
      <h2 id="model-title">Модель</h2>
      <p className="panel-lead">
        Загрузите свой glTF/GLB или оставьте демонстрационный кроссовок.
      </p>

      <label className="field" htmlFor={fileId}>
        <span className="field-label">Файл модели (.glb / .gltf)</span>
        <input
          ref={fileRef}
          id={fileId}
          type="file"
          accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
          disabled={busy}
          aria-describedby="file-hint"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </label>
      <p id="file-hint" className="field-hint">
        До 50 МБ. Файл проверяется на формат и целостность.
      </p>

      <label className="field" htmlFor={urlId}>
        <span className="field-label">Адрес модели</span>
        <input
          id={urlId}
          type="url"
          value={url}
          disabled={busy}
          placeholder="https://пример.рф/модель.glb"
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void handleUrl()
            }
          }}
        />
      </label>

      <div className="btn-row">
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy || !url.trim()}
          aria-label="Загрузить модель по адресу"
          onClick={() => void handleUrl()}
        >
          {busy ? 'Загрузка…' : 'Загрузить по адресу'}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={busy}
          aria-label="Вернуть встроенную модель"
          onClick={restoreDefault}
        >
          Встроенная модель
        </button>
      </div>

      {modelName && (
        <p className="model-status" role="status">
          Сейчас: {modelName}
        </p>
      )}
    </section>
  )
}
