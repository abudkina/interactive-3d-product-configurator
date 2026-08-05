import { useId, useMemo, useState, useEffect, useRef } from 'react'
import type { ColorSwatch } from '@/types'
import { contrastTextColor, formatSwatchLabel } from '@/lib/colors'
import { findClosestColorAsync } from '@/lib/colorWorkerClient'
import { logger } from '@/lib/logger'

interface ColorPickerProps {
  open: boolean
  onClose: () => void
  palette: ColorSwatch[]
  currentHex: string
  onSelect: (hex: string, swatch: ColorSwatch) => void
  title: string
  anchorRef?: React.RefObject<HTMLElement | null>
}

/**
 * Палитра-пипетка вместо скучного input type="color".
 */
export function ColorPicker({
  open,
  onClose,
  palette,
  currentHex,
  onSelect,
  title,
}: ColorPickerProps) {
  const titleId = useId()
  const searchId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useIdQuery()
  const [hint, setHint] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return palette
    return palette.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.hex.toLowerCase().includes(q),
    )
  }, [palette, query])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    dialogRef.current?.querySelector<HTMLElement>('input')?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    ;(async () => {
      try {
        const closest = await findClosestColorAsync(currentHex, palette)
        if (!cancelled && closest) {
          setHint(
            `Ближайший в палитре: ${closest.swatch.code} (${closest.swatch.name})`,
          )
        }
      } catch (error) {
        logger.warn('Не удалось найти ближайший цвет', error)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, currentHex, palette])

  if (!open) return null

  return (
    <div className="picker-backdrop" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className="picker-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="picker-header">
          <h2 id={titleId}>{title}</h2>
          <button
            type="button"
            className="icon-btn"
            aria-label="Закрыть палитру"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <label className="field" htmlFor={searchId}>
          <span className="field-label">Поиск по коду или названию</span>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Например, RAL 5015 или коралл"
            autoComplete="off"
          />
        </label>

        {hint && <p className="picker-hint">{hint}</p>}

        {filtered.length === 0 ? (
          <p className="picker-empty" role="status">
            Ничего не найдено. Измените запрос.
          </p>
        ) : (
          <ul className="swatch-grid" role="listbox" aria-label="Палитра цветов">
            {filtered.map((swatch) => {
              const hex = `#${swatch.hex.replace('#', '')}`
              const selected =
                hex.toUpperCase() === currentHex.toUpperCase()
              return (
                <li key={`${swatch.source}-${swatch.code}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`swatch${selected ? ' is-selected' : ''}`}
                    style={{
                      backgroundColor: hex,
                      color: contrastTextColor(hex),
                    }}
                    aria-label={formatSwatchLabel(swatch)}
                    title={formatSwatchLabel(swatch)}
                    onClick={() => onSelect(hex, swatch)}
                  >
                    <span className="swatch-code">{swatch.code}</span>
                    <span className="swatch-name">{swatch.name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function useIdQuery(): [string, (v: string) => void] {
  const [query, setQuery] = useState('')
  return [query, setQuery]
}
