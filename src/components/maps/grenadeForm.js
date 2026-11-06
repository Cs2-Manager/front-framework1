import { youtubeEmbedUrl } from '../../utils/video.js'

export const GRENADE_TYPE_OPTIONS = [
  { value: 'SMOKE', label: 'Smoke' },
  { value: 'FLASH', label: 'Flash' },
  { value: 'MOLOTOV', label: 'Molotov' },
  { value: 'INCENDIARY', label: 'Incendiaria' },
  { value: 'HE', label: 'HE' },
  { value: 'DECOY', label: 'Decoy' },
]

export const SIDE_OPTIONS = [
  { value: 'T', label: 'Terrorista (T)' },
  { value: 'CT', label: 'Contraterrorista (CT)' },
]

export const DIFFICULTY_OPTIONS = [
  { value: 'EASY', label: 'Fácil' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HARD', label: 'Difícil' },
]

export const THROW_TYPE_OPTIONS = [
  { value: '', label: 'Sin especificar' },
  { value: 'STANDING', label: 'De pie' },
  { value: 'RUNNING', label: 'Corriendo' },
  { value: 'WALKING', label: 'Caminando' },
  { value: 'JUMP_THROW', label: 'Salto' },
  { value: 'RUNNING_JUMP_THROW', label: 'Salto corriendo' },
  { value: 'CUSTOM', label: 'Personalizada' },
]

export const LINEUP_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'PUBLISHED', label: 'Publicada' },
  { value: 'ARCHIVED', label: 'Archivada' },
]

export const EMPTY_GRENADE_FORM = {
  map_id: null,
  title: '',
  type: 'SMOKE',
  side: 'T',
  difficulty: 'MEDIUM',
  description: '',
  video_url: '',
  image_url: '',
  launch_zone: '',
  impact_zone: '',
  launch_position: null,
  impact_position: null,
  throw_type: '',
  instructions: '',
  notes: '',
  tags: '',
  game_version: '',
  media: [],
  status: 'PUBLISHED',
  responsible_id: null,
}

function mediaToForm(media = []) {
  return media.map((item) => ({
    kind: item.kind === 'VIDEO' ? 'VIDEO' : 'IMAGE',
    url: item.url || '',
    thumbnail_url: item.thumbnail_url || '',
  }))
}

export function grenadeToForm(lineup, { mapId = null } = {}) {
  if (!lineup) {
    return { ...EMPTY_GRENADE_FORM, map_id: mapId }
  }
  return {
    ...EMPTY_GRENADE_FORM,
    map_id: lineup.map_id ?? mapId,
    title: lineup.title || '',
    type: lineup.grenade_type || lineup.type || 'SMOKE',
    side: lineup.side === 'TR' ? 'T' : lineup.side || 'T',
    difficulty: lineup.difficulty || 'MEDIUM',
    description: lineup.description || '',
    video_url: lineup.video_url || '',
    image_url: lineup.image_url || '',
    launch_zone: lineup.launch_zone || '',
    impact_zone: lineup.impact_zone || '',
    launch_position: lineup.launch_position || null,
    impact_position: lineup.impact_position || lineup.position || null,
    throw_type: lineup.throw_type || '',
    instructions: lineup.instructions || '',
    notes: lineup.notes || '',
    tags: Array.isArray(lineup.tags) ? lineup.tags.join(', ') : '',
    game_version: lineup.game_version || '',
    media: mediaToForm(lineup.media),
    status: lineup.status || 'PUBLISHED',
    responsible_id: lineup.responsible_id ?? null,
  }
}

export function isNormalizedPoint(value) {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every(
      (coordinate) =>
        typeof coordinate === 'number' &&
        Number.isFinite(coordinate) &&
        coordinate >= 0 &&
        coordinate <= 1,
    )
  )
}

function isPublicHttps(value) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:' && parsed.hostname.includes('.')
  } catch {
    return false
  }
}

export function validateGrenadeForm(form) {
  const errors = {}
  if (!String(form.title || '').trim()) {
    errors.title = 'El nombre es obligatorio.'
  }
  if (!GRENADE_TYPE_OPTIONS.some((option) => option.value === form.type)) {
    errors.type = 'Elegí un tipo de granada válido.'
  }
  if (!SIDE_OPTIONS.some((option) => option.value === form.side)) {
    errors.side = 'Elegí un lado válido.'
  }
  if (!DIFFICULTY_OPTIONS.some((option) => option.value === form.difficulty)) {
    errors.difficulty = 'Elegí una dificultad válida.'
  }
  if (form.video_url && !youtubeEmbedUrl(form.video_url)) {
    errors.video_url = 'Usá un enlace de YouTube válido.'
  }
  if (form.image_url && !isPublicHttps(form.image_url.trim())) {
    errors.image_url = 'La imagen debe ser una URL HTTPS pública.'
  }
  if (form.launch_position && !isNormalizedPoint(form.launch_position)) {
    errors.launch_position = 'El origen debe estar dentro del mapa (0..1).'
  }
  if (form.impact_position && !isNormalizedPoint(form.impact_position)) {
    errors.impact_position = 'El destino debe estar dentro del mapa (0..1).'
  }
  for (const [index, item] of (form.media || []).entries()) {
    if (!item.url) {
      errors[`media-${index}`] = 'La URL del medio es obligatoria.'
    } else if (!isPublicHttps(item.url.trim())) {
      errors[`media-${index}`] = 'El medio debe ser una URL HTTPS pública.'
    }
  }
  return errors
}

function parseTags(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  return String(value || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export function buildGrenadePayload(form, { scope = 'PERSONAL' } = {}) {
  const payload = {
    map_id: form.map_id,
    title: String(form.title || '').trim(),
    type: form.type,
    side: form.side,
    difficulty: form.difficulty,
    description: String(form.description || '').trim(),
    video_url: String(form.video_url || '').trim() || null,
    image_url: String(form.image_url || '').trim() || null,
    launch_zone: String(form.launch_zone || '').trim(),
    impact_zone: String(form.impact_zone || '').trim(),
    launch_position: isNormalizedPoint(form.launch_position)
      ? form.launch_position
      : null,
    impact_position: isNormalizedPoint(form.impact_position)
      ? form.impact_position
      : null,
    position: isNormalizedPoint(form.impact_position)
      ? form.impact_position
      : null,
    throw_type: form.throw_type || '',
    instructions: String(form.instructions || '').trim(),
    notes: String(form.notes || '').trim(),
    tags: parseTags(form.tags),
    game_version: String(form.game_version || '').trim(),
    media: (form.media || [])
      .filter((item) => String(item.url || '').trim())
      .map((item) => ({
        kind: item.kind === 'VIDEO' ? 'VIDEO' : 'IMAGE',
        url: item.url.trim(),
        thumbnail_url: String(item.thumbnail_url || '').trim() || null,
      })),
  }

  if (scope === 'OFFICIAL' && form.status) {
    payload.status = form.status
  }
  if (scope === 'TEAM' && form.responsible_id) {
    payload.responsible_id = form.responsible_id
  }
  return payload
}
