import { useId, useEffect, useRef } from 'react'
import specs from '@/data/specs.json'

interface SpecsModalProps {
  open: boolean
  onClose: () => void
}

/**
 * Модальное окно «Технические характеристики».
 */
export function SpecsModal({ open, onClose }: SpecsModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    dialogRef.current?.querySelector<HTMLElement>('button')?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="picker-backdrop" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className="picker-dialog specs-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="picker-header">
          <h2 id={titleId}>{specs.title}</h2>
          <button
            type="button"
            className="icon-btn"
            aria-label="Закрыть технические характеристики"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <p className="specs-product">{specs.productName}</p>

        <table className="specs-table">
          <caption className="visually-hidden">
            Таблица технических характеристик
          </caption>
          <tbody>
            {specs.rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
