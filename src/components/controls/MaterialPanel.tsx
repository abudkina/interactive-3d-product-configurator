import { useMemo, useState } from 'react'
import pantone from '@/data/pantone.json'
import ral from '@/data/ral.json'
import type { ColorSwatch, MaterialSlotId } from '@/types'
import { MATERIAL_SLOTS } from '@/lib/constants'
import { useConfiguratorStore } from '@/store/configuratorStore'
import { ColorPicker } from '@/components/palette/ColorPicker'
import { findClosestColor, formatSwatchLabel } from '@/lib/colors'

const pantoneSwatches = pantone as ColorSwatch[]
const ralSwatches = ral as ColorSwatch[]

export function MaterialPanel() {
  const colors = useConfiguratorStore((s) => s.colors)
  const activeSlot = useConfiguratorStore((s) => s.activeSlot)
  const paletteSource = useConfiguratorStore((s) => s.paletteSource)
  const setActiveSlot = useConfiguratorStore((s) => s.setActiveSlot)
  const setPaletteSource = useConfiguratorStore((s) => s.setPaletteSource)
  const setSlotColor = useConfiguratorStore((s) => s.setSlotColor)
  const setToast = useConfiguratorStore((s) => s.setToast)
  const resetColors = useConfiguratorStore((s) => s.resetColors)

  const [pickerOpen, setPickerOpen] = useState(false)

  const palette = useMemo(
    () => (paletteSource === 'ral' ? ralSwatches : pantoneSwatches),
    [paletteSource],
  )

  const activeLabel =
    MATERIAL_SLOTS.find((s) => s.id === activeSlot)?.label ?? activeSlot

  const openPickerFor = (slot: MaterialSlotId) => {
    setActiveSlot(slot)
    setPickerOpen(true)
  }

  return (
    <section className="panel-section" aria-labelledby="materials-title">
      <h2 id="materials-title">Материалы</h2>
      <p className="panel-lead">
        Переключатель Pantone / RAL сразу подгоняет цвета модели под выбранную
        систему. Затем можно уточнить оттенок детали.
      </p>

      <div className="segmented" role="group" aria-label="Система цветов">
        <button
          type="button"
          className={paletteSource === 'pantone' ? 'is-active' : ''}
          aria-pressed={paletteSource === 'pantone'}
          aria-label="Переключить на палитру Pantone"
          onClick={() => setPaletteSource('pantone')}
        >
          Pantone
        </button>
        <button
          type="button"
          className={paletteSource === 'ral' ? 'is-active' : ''}
          aria-pressed={paletteSource === 'ral'}
          aria-label="Переключить на палитру RAL"
          onClick={() => setPaletteSource('ral')}
        >
          RAL
        </button>
      </div>

      <ul className="slot-list">
        {MATERIAL_SLOTS.map((slot) => {
          const hex = colors[slot.id]
          const match = findClosestColor(hex, palette)
          return (
            <li key={slot.id}>
              <button
                type="button"
                className={`slot-btn${activeSlot === slot.id ? ' is-active' : ''}`}
                aria-label={`Изменить цвет: ${slot.label}`}
                aria-pressed={activeSlot === slot.id}
                onClick={() => openPickerFor(slot.id)}
              >
                <span
                  className="slot-swatch"
                  style={{ backgroundColor: hex }}
                  aria-hidden
                />
                <span className="slot-meta">
                  <span className="slot-label">{slot.label}</span>
                  <span className="slot-hex">
                    {match ? match.swatch.code : hex}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        className="btn btn-ghost"
        aria-label="Сбросить цвета к исходным"
        onClick={() => resetColors()}
      >
        Сбросить цвета
      </button>

      <ColorPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        palette={palette}
        currentHex={colors[activeSlot]}
        title={`Цвет: ${activeLabel}`}
        onSelect={(hex, swatch) => {
          setSlotColor(activeSlot, hex)
          setToast(`Назначен ${formatSwatchLabel(swatch)}`)
          setPickerOpen(false)
        }}
      />
    </section>
  )
}
