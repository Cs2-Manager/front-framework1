import { useEffect, useState } from 'react'
import { createCallout, updateCallout } from '../../services/maps.js'

export default function CalloutFormModal({ open, map, callout, onClose, onSaved }) {
  const [form, setForm] = useState({ zone_name: '', x_ratio: 0.5, y_ratio: 0.5 })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(
      callout
        ? { zone_name: callout.zone_name, x_ratio: callout.x_ratio, y_ratio: callout.y_ratio }
        : { zone_name: '', x_ratio: 0.5, y_ratio: 0.5 },
    )
    setErrors({})
    setServerError('')
    setSaving(false)
  }, [open, callout])

  if (!open) return null

  function handleTextChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function handleRatioChange(event) {
    const { name, value } = event.target
    const numeric = parseFloat(value)
    setForm((prev) => ({
      ...prev,
      [name]: Number.isFinite(numeric) ? numeric : prev[name],
    }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function handleImageClick(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    setForm((prev) => ({
      ...prev,
      x_ratio: Math.max(0, Math.min(1, x)),
      y_ratio: Math.max(0, Math.min(1, y)),
    }))
  }

  function validate() {
    const next = {}
    if (!form.zone_name.trim()) next.zone_name = 'El nombre de la zona es obligatorio.'
    if (form.x_ratio < 0 || form.x_ratio > 1) next.x_ratio = 'Debe estar entre 0 y 1.'
    if (form.y_ratio < 0 || form.y_ratio > 1) next.y_ratio = 'Debe estar entre 0 y 1.'
    return next
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSaving(true)
    setServerError('')
    try {
      const payload = {
        zone_name: form.zone_name.trim(),
        x_ratio: form.x_ratio,
        y_ratio: form.y_ratio,
      }
      const saved = callout
        ? await updateCallout(map.id, callout.id, payload)
        : await createCallout(map.id, payload)
      onSaved(saved)
      onClose()
    } catch (err) {
      setServerError(
        err.response?.data?.error ||
          'No se pudo guardar el callout. Intentalo de nuevo.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{callout ? 'Editar zona' : 'Nueva zona'}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          {serverError && (
            <div className="alert alert-error" role="alert">
              {serverError}
            </div>
          )}

          {map?.image_url && (
            <div className="callout-pick">
              <p className="callout-pick-hint">
                {callout
                  ? 'Hacé clic en la imagen para reposicionar la zona.'
                  : 'Hacé clic en la imagen para marcar la ubicación de la zona.'}
              </p>
              <div className="callout-pick-image" onClick={handleImageClick}>
                <img src={map.image_url} alt={map.name} />
                <span
                  className="callout-pick-dot"
                  style={{
                    left: `${form.x_ratio * 100}%`,
                    top: `${form.y_ratio * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="callout-name">Nombre de la zona</label>
            <input
              id="callout-name"
              name="zone_name"
              type="text"
              value={form.zone_name}
              onChange={handleTextChange}
              className={errors.zone_name ? 'form-input invalid' : 'form-input'}
              placeholder="Ej: B Site"
            />
            {errors.zone_name && <p className="form-error">{errors.zone_name}</p>}
          </div>

          <div className="callout-ratios">
            <div className="form-group">
              <label htmlFor="callout-x">Posición X (0–1)</label>
              <input
                id="callout-x"
                name="x_ratio"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={form.x_ratio}
                onChange={handleRatioChange}
                className={errors.x_ratio ? 'form-input invalid' : 'form-input'}
              />
              {errors.x_ratio && <p className="form-error">{errors.x_ratio}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="callout-y">Posición Y (0–1)</label>
              <input
                id="callout-y"
                name="y_ratio"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={form.y_ratio}
                onChange={handleRatioChange}
                className={errors.y_ratio ? 'form-input invalid' : 'form-input'}
              />
              {errors.y_ratio && <p className="form-error">{errors.y_ratio}</p>}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : callout ? 'Guardar cambios' : 'Agregar zona'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}