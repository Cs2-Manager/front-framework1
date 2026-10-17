import { useEffect, useState } from 'react'
import {
  createWorkshopMap,
  updateWorkshopMap,
  WORKSHOP_CATEGORIES,
} from '../../services/workshopMaps.js'

const EMPTY = {
  title: '',
  category: '',
  description: '',
  image_url: '',
  workshop_url: '',
}

export default function WorkshopFormModal({ open, workshopMap, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(
      workshopMap
        ? {
            title: workshopMap.title,
            category: workshopMap.category,
            description: workshopMap.description,
            image_url: workshopMap.image_url,
            workshop_url: workshopMap.workshop_url,
          }
        : EMPTY,
    )
    setErrors({})
    setServerError('')
    setSaving(false)
  }, [open, workshopMap])

  if (!open) return null

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function validate() {
    const next = {}
    if (!form.title.trim()) next.title = 'El título es obligatorio.'
    if (!form.category) next.category = 'Seleccioná una categoría.'
    if (!form.image_url.trim()) next.image_url = 'La URL de la imagen es obligatoria.'
    if (!form.workshop_url.trim()) {
      next.workshop_url = 'La URL de la Workshop es obligatoria.'
    } else if (!/^https?:\/\/.+/i.test(form.workshop_url.trim())) {
      next.workshop_url = 'Ingresá una URL válida (http/https).'
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
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        image_url: form.image_url.trim(),
        workshop_url: form.workshop_url.trim(),
      }
      const saved = workshopMap
        ? await updateWorkshopMap(workshopMap.id, payload)
        : await createWorkshopMap(payload)
      onSaved(saved)
      onClose()
    } catch (err) {
      const fields = err.response?.data?.fields
      if (fields) {
        setErrors(fields)
      } else {
        setServerError(
          err.response?.data?.error ||
            'No se pudo guardar el mapa de la Workshop. Intentalo de nuevo.',
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
          <h2>{workshopMap ? 'Editar mapa de la Workshop' : 'Nuevo mapa de la Workshop'}</h2>
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
            <label htmlFor="workshop-title">Título</label>
            <input
              id="workshop-title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              className={errors.title ? 'form-input invalid' : 'form-input'}
              placeholder="Ej: Aim Botz"
            />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="workshop-category">Categoría</label>
            <select
              id="workshop-category"
              name="category"
              className={errors.category ? 'form-input invalid' : 'form-input'}
              value={form.category}
              onChange={handleChange}
            >
              <option value="">Seleccioná una categoría</option>
              {WORKSHOP_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && <p className="form-error">{errors.category}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="workshop-image">URL de la imagen</label>
            <input
              id="workshop-image"
              name="image_url"
              type="url"
              value={form.image_url}
              onChange={handleChange}
              className={errors.image_url ? 'form-input invalid' : 'form-input'}
              placeholder="https://…/aim-botz.jpg"
            />
            {errors.image_url && <p className="form-error">{errors.image_url}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="workshop-url">URL de la Steam Workshop</label>
            <input
              id="workshop-url"
              name="workshop_url"
              type="url"
              value={form.workshop_url}
              onChange={handleChange}
              className={errors.workshop_url ? 'form-input invalid' : 'form-input'}
              placeholder="https://steamcommunity.com/sharedfiles/filedetails/?id=…"
            />
            {errors.workshop_url && <p className="form-error">{errors.workshop_url}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="workshop-desc">Descripción</label>
            <textarea
              id="workshop-desc"
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
              className="form-input"
              placeholder="Qué se entrena y por qué la recomendamos…"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : workshopMap ? 'Guardar cambios' : 'Crear mapa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
