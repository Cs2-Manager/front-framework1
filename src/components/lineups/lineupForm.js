import { validateUrl } from '../../utils/validation.js'
import { extractYoutubeId } from '../../utils/video.js'

export const EMPTY_LINEUP_FORM = {
  map_id: '',
  type: '',
  side: '',
  title: '',
  description: '',
  video_url: '',
}

export function lineupToForm(lineup, maps = []) {
  if (!lineup) {
    return {
      ...EMPTY_LINEUP_FORM,
      map_id: maps[0] ? String(maps[0].id) : '',
    }
  }
  return {
    map_id: String(lineup.map_id),
    type: lineup.type,
    side: lineup.side,
    title: lineup.title,
    description: lineup.description,
    video_url: lineup.video_url,
  }
}

const REQUIRED_FIELDS = [
  ['map_id', 'Seleccioná un mapa.'],
  ['type', 'Seleccioná el tipo de granada.'],
  ['side', 'Seleccioná el bando.'],
]

export function validateLineupForm(values) {
  const errors = {}
  for (const [key, message] of REQUIRED_FIELDS) {
    if (!values[key]) errors[key] = message
  }
  if (!values.title.trim()) errors.title = 'El título es obligatorio.'

  const urlError = validateVideoUrl(values)
  if (urlError) errors.video_url = urlError
  return errors
}

function validateVideoUrl(values) {
  return validateUrl(values.video_url, {
    requiredMessage: 'La URL del video es obligatoria.',
    invalidMessage: 'Ingresá un enlace válido de YouTube.',
    isValid: extractYoutubeId,
  })
}

export function buildLineupPayload(values) {
  return {
    map_id: Number(values.map_id),
    type: values.type,
    side: values.side,
    title: values.title.trim(),
    description: values.description.trim(),
    video_url: values.video_url.trim(),
  }
}
