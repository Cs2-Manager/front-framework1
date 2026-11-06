export const EMPTY_MAP_FORM = { name: '', image_url: '', active_pool: false }

export const MAP_CATEGORY_OPTIONS = [
  { value: 'COMPETITIVE', label: 'Pool competitivo' },
  { value: 'RESERVE', label: 'Fuera del pool' },
  { value: 'TEMPORARY', label: 'Temporal' },
  { value: 'RETIRED', label: 'Retirado' },
  { value: 'ARCHIVED', label: 'Archivado' },
]

export const MAP_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'ARCHIVED', label: 'Archivado' },
]

const EDITABLE_DEFAULTS = {
  category: 'COMPETITIVE',
  status: 'ACTIVE',
  slug: '',
  display_order: '',
  release_date: '',
  image_source: '',
  top_down_source: '',
  visual_version: '',
}

function metadata(values) {
  return Object.fromEntries(['description', 'cover_url']
    .filter((key) => key in values)
    .map((key) => [key, (values[key] || '').trim()]))
}

export function mapToForm(map) {
  if (!map) return EMPTY_MAP_FORM
  return {
    name: map.name,
    image_url: map.image_url,
    active_pool: map.active_pool,
    ...metadata(map),
  }
}

/**
 * Formulario administrativo ampliado. Se mantiene separado de `mapToForm`
 * para no alterar el contrato histórico del formulario público.
 */
export function mapToEditableForm(map) {
  const base = mapToForm(map)
  if (!map) return { ...base, ...EDITABLE_DEFAULTS }
  return {
    ...base,
    category: map.category || EDITABLE_DEFAULTS.category,
    status: map.status || EDITABLE_DEFAULTS.status,
    slug: map.slug || '',
    display_order: map.display_order ?? '',
    release_date: map.release_date || '',
    image_source: map.image_source || '',
    top_down_source: map.top_down_source || '',
    visual_version: map.visual_version ?? '',
  }
}

export function validateMapForm(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'El nombre es obligatorio.'
  if (!values.image_url.trim())
    errors.image_url = 'La URL de la imagen es obligatoria.'
  return errors
}

function isPublicHttps(value) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:' && parsed.hostname.includes('.')
  } catch {
    return false
  }
}

export function validateEditableMapForm(values) {
  const errors = validateMapForm(values)
  if (values.cover_url && !isPublicHttps(values.cover_url.trim())) {
    errors.cover_url = 'La portada debe ser una URL HTTPS pública.'
  }
  if (values.release_date) {
    const parsed = new Date(values.release_date)
    if (Number.isNaN(parsed.getTime())) {
      errors.release_date = 'Usá una fecha ISO válida (YYYY-MM-DD).'
    }
  }
  if (values.display_order !== '' && values.display_order != null) {
    const order = Number(values.display_order)
    if (!Number.isInteger(order) || order < 0) {
      errors.display_order = 'El orden debe ser un entero mayor o igual a 0.'
    }
  }
  return errors
}

export function buildMapPayload(values) {
  return {
    name: values.name.trim(),
    image_url: values.image_url.trim(),
    active_pool: values.active_pool,
    ...metadata(values),
  }
}

/**
 * Payload administrativo: por defecto omite los valores por defecto para
 * conservar el contrato de creación histórica. En edición se usa
 * `includeDefaults` para poder restablecer campos a su valor inicial.
 */
export function buildEditableMapPayload(values, { includeDefaults = false } = {}) {
  const payload = buildMapPayload(values)

  const category = values.category || EDITABLE_DEFAULTS.category
  if (includeDefaults || category !== EDITABLE_DEFAULTS.category) {
    payload.category = category
  }

  const status = values.status || EDITABLE_DEFAULTS.status
  if (includeDefaults || status !== EDITABLE_DEFAULTS.status) {
    payload.status = status
  }

  if (String(values.slug || '').trim()) payload.slug = values.slug.trim()
  if (values.display_order !== '' && values.display_order != null) {
    payload.display_order = Number(values.display_order)
  }
  if (includeDefaults || values.release_date) {
    payload.release_date = values.release_date || null
  }
  if (includeDefaults || String(values.image_source || '').trim()) {
    payload.image_source = String(values.image_source || '').trim() || null
  }
  if (includeDefaults || String(values.top_down_source || '').trim()) {
    payload.top_down_source = String(values.top_down_source || '').trim() || null
  }

  const visualVersion =
    values.visual_version !== '' && values.visual_version != null
      ? Number(values.visual_version)
      : 1
  if (includeDefaults || visualVersion !== 1) {
    payload.visual_version = visualVersion
  }
  return payload
}
