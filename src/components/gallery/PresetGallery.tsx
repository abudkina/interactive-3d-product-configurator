import { getPresets, type ColorPreset } from '@/lib/presets'
import { MATERIAL_SLOTS } from '@/lib/constants'
import { useConfiguratorStore } from '@/store/configuratorStore'

/**
 * Страница «Галерея пресетов» — готовые цветовые схемы.
 */
export function PresetGallery() {
  const presets = getPresets()
  const applyPreset = useConfiguratorStore((s) => s.applyPreset)
  const setView = useConfiguratorStore((s) => s.setView)
  const activePresetId = useConfiguratorStore((s) => s.activePresetId)

  const handleApply = (preset: ColorPreset) => {
    applyPreset(preset)
    setView('configurator')
  }

  return (
    <section className="gallery-page" aria-labelledby="gallery-title">
      <header className="gallery-header">
        <div>
          <h1 id="gallery-title">Галерея пресетов</h1>
          <p className="gallery-lead">
            Готовые цветовые схемы. Выберите — и вернётесь в конфигуратор с
            применёнными цветами.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          aria-label="Вернуться в конфигуратор"
          onClick={() => setView('configurator')}
        >
          К конфигуратору
        </button>
      </header>

      <ul className="preset-grid">
        {presets.map((preset) => {
          const selected = activePresetId === preset.id
          return (
            <li key={preset.id}>
              <article
                className={`preset-card${selected ? ' is-selected' : ''}`}
              >
                <div
                  className="preset-stripes"
                  aria-hidden
                >
                  {MATERIAL_SLOTS.map((slot) => (
                    <span
                      key={slot.id}
                      className="preset-stripe"
                      style={{ backgroundColor: preset.colors[slot.id] }}
                      title={slot.label}
                    />
                  ))}
                </div>
                <div className="preset-body">
                  <h2 className="preset-name">{preset.name}</h2>
                  <p className="preset-desc">{preset.description}</p>
                  <p className="preset-meta">
                    Палитра:{' '}
                    {preset.paletteSource === 'ral' ? 'RAL' : 'Pantone'}
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    aria-label={`Применить пресет «${preset.name}»`}
                    aria-pressed={selected}
                    onClick={() => handleApply(preset)}
                  >
                    {selected ? 'Уже применён — открыть' : 'Применить'}
                  </button>
                </div>
              </article>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
