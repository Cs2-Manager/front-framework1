import { useEffect, useState } from 'react'
import { createLineup, GRENADE_TYPES, SIDES, updateLineup } from '../../services/lineups.js'
import { extractYoutubeId } from '../../utils/video.js'

const EMPTY = {
  map_id: '',
  type: '',
  side: '',
  title: '',
  description: '',
  video_url: '',
}

export default function LineupFormModal({ open, maps, lineup, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(
      lineup
        ? {
            map_id: String(lineup.map_id),
            type: lineup.type,
            side: lineup.side,
            title: lineup.title,
            description: lineup.description,
            video_url: lineup.video_url,
          }
        : { ...EMPTY, map_id: maps[0] ? String(maps[0].id) : '' },
    )
    setErrors({})
    setServerError('')
    setSaving(false)
  }, [open, lineup, maps])

  if (!open) return null

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function validate() {
    const next = {}
    if (!form.map_id) next.map_id = 'Seleccioná un mapa.'
    if (!form.type) next.type = 'Seleccioná el tipo de granada.'
    if (!form.side) next.side = 'Seleccioná el bando.'
    if (!form.title.trim()) next.title = 'El título es obligatorio.'
    if (!form.video_url.trim()) {
      next.video_url = 'La URL del video es obligatoria.'
    } else if (!extractYoutubeId(form.video_url)) {
      next.video_url = 'Ingresá un enlace válido de YouTube.'
    }
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
        map_id: Number(form.map_id),
        type: form.type,
        side: form.side,
        title: form.title.trim(),
        description: form.description.trim(),
        video_url: form.video_url.trim(),
      }
      const saved = lineup
        ? await updateLineup(lineup.id, payload)
        : await createLineup(payload)
      onSaved(saved)
      onClose()
    } catch (err) {
      const fields = err.response?.data?.fields
      if (fields) {
        setErrors(fields)
      } else {
        setServerError(
          err.response?.data?.error ||
            'No se pudo guardar el lineup. Intentalo de nuevo.',
        )
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{lineup ? 'Editar lineup' : 'Nuevo lineup'}</h2>
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

          <div className="lineup-form-grid">
            <div className="form-group">
              <label htmlFor="lineup-map">Mapa</label>
              <select
                id="lineup-map"
                name="map_id"
                className={errors.map_id ? 'form-input invalid' : 'form-input'}
                value={form.map_id}
                onChange={handleChange}
              >
                <option value="">Seleccioná un mapa</option>
                {maps.map((map) => (
                  <option key={map.id} value={map.id}>
                    {map.name}
                  </option>
                ))}
              </select>
              {errors.map_id && <p className="form-error">{errors.map_id}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="lineup-type">Tipo</label>
              <select
                id="lineup-type"
                name="type"
                className={errors.type ? 'form-input invalid' : 'form-input'}
                value={form.type}
                onChange={handleChange}
              >
                <option value="">Seleccioná el tipo</option>
                {GRENADE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.type && <p className="form-error">{errors.type}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="lineup-side">Bando</label>
              <select
                id="lineup-side"
                name="side"
                className={errors.side ? 'form-input invalid' : 'form-input'}
                value={form.side}
                onChange={handleChange}
              >
                <option value="">Seleccioná el bando</option>
                {SIDES.map((side) => (
                  <option key={side} value={side}>
                    {side}
                  </option>
                ))}
              </select>
              {errors.side && <p className="form-error">{errors.side}</p>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="lineup-title">Título</label>
            <input
              id="lineup-title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              className={errors.title ? 'form-input invalid' : 'form-input'}
              placeholder="Ej: Smoke de CT hacia el sitio B"
            />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="lineup-video">URL del video (YouTube)</label>
            <input
              id="lineup-video"
              name="video_url"
              type="url"
              value={form.video_url}
              onChange={handleChange}
              className={errors.video_url ? 'form-input invalid' : 'form-input'}
              placeholder="https://www.youtube.com/watch?v=…"
            />
            {errors.video_url && <p className="form-error">{errors.video_url}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="lineup-desc">Descripción</label>
            <textarea
              id="lineup-desc"
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
              className="form-input"
              placeholder="Pasos, notas o utilidades necesarias…"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : lineup ? 'Guardar cambios' : 'Crear lineup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}