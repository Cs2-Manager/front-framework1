import { isNormalizedPoint } from './grenadeForm.js'
import { clamp } from './grenadeEditorGeometry.js'

/** Par de entradas numéricas X/Y para un punto normalizado del plano. */
export default function GrenadeCoordinateInput({
  label,
  point,
  readOnly,
  onChange,
}) {
  const value = isNormalizedPoint(point) ? point : null
  const update = (index, raw) => {
    if (raw === '') {
      onChange(null)
      return
    }
    const parsed = Number(raw)
    if (!Number.isFinite(parsed)) return
    const next = value ? [...value] : [0.5, 0.5]
    next[index] = clamp(parsed)
    onChange(next)
  }

  return (
    <fieldset className="grenade-coordinate-group">
      <legend>{label}</legend>
      {['X', 'Y'].map((axis, index) => (
        <label key={axis}>
          {axis}
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            inputMode="decimal"
            aria-label={`${label} ${axis}`}
            value={value ? Number(value[index].toFixed(3)) : ''}
            disabled={readOnly}
            onChange={(event) => update(index, event.target.value)}
          />
        </label>
      ))}
    </fieldset>
  )
}
