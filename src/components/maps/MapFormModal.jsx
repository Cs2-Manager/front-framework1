import { useEffect, useState } from 'react'
import { createMap, updateMap } from '../../services/maps.js'

const EMPTY = { name: '', image_url: '', active_pool: false }

export default function MapFormModal({ open, map, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(
      map
        ? {
            name: map.name,
            image_url: map.image_url,
            active_pool: map.active_pool,
          }
        : EMPTY,
    )
    setErrors({})
    setServerError('')
    setSaving(false)
  }, [open, map])

  if (!open) return null

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    const next = type === 'checkbox' ? checked : value
    setForm((prev) => ({ ...prev, [name]: next }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'El nombre es obligatorio.'
    if (!form.image_url.trim()) next.image_url = 'La URL de la imagen es obligatoria.'
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
        name: form.name.trim(),
        image_url: form.image_url.trim(),
        active_pool: form.active_pool,
      }
      const saved = map
        ? await updateMap(map.id, payload)
        : await createMap(payload)
      onSaved(saved)
      onClose()
    } catch (err) {
      setServerError(
        err.response?.data?.error || 'No se pudo guardar el mapa. Intentalo de nuevo.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{map ? 'Editar mapa' : 'Nuevo mapa'}</h2>
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

          <div className="form-group">
            <label htmlFor="map-name">Nombre</label>
            <input
              id="map-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className={errors.name ? 'form-input invalid' : 'form-input'}
              placeholder="Ej: Mirage"
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="map-image">URL de la imagen</label>
            <input
              id="map-image"
              name="image_url"
              type="url"
              value={form.image_url}
              onChange={handleChange}
              className={errors.image_url ? 'form-input invalid' : 'form-input'}
              placeholder="https://…/mirage.jpg"
            />
            {errors.image_url && <p className="form-error">{errors.image_url}</p>}
          </div>

          <div className="form-group form-check">
            <label className="form-check-label">
              <input
                type="checkbox"
                name="active_pool"
                checked={form.active_pool}
                onChange={handleChange}
              />
              En el map pool activo
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : map ? 'Guardar cambios' : 'Crear mapa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}