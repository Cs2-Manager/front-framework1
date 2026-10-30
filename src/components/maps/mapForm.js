export const EMPTY_MAP_FORM = { name: '', image_url: '', active_pool: false }

export function mapToForm(map) {
  if (!map) return EMPTY_MAP_FORM
  return {
    name: map.name,
    image_url: map.image_url,
    active_pool: map.active_pool,
  }
}

export function validateMapForm(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'El nombre es obligatorio.'
  if (!values.image_url.trim())
    errors.image_url = 'La URL de la imagen es obligatoria.'
  return errors
}

export function buildMapPayload(values) {
  return {
    name: values.name.trim(),
    image_url: values.image_url.trim(),
    active_pool: values.active_pool,
  }
}
