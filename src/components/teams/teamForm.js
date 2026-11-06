export const TEAM_VISIBILITY_OPTIONS = [
  { value: 'PUBLIC', label: 'Público: aparece en el directorio' },
  { value: 'PRIVATE', label: 'Privado: solo integrantes y administradores' },
]

export const TEAM_INVITE_ROLE_OPTIONS = [
  { value: 'PLAYER', label: 'Jugador' },
  { value: 'COACH', label: 'Entrenador' },
]

const MAX_NAME = 80
const MAX_TAG = 10
const MAX_DESCRIPTION = 1000
const TAG_REGEX = /^[A-Z0-9][A-Z0-9_-]{1,9}$/

function text(value) {
  return (value || '').trim()
}

function validateUrl(value, errors) {
  const url = text(value)
  if (!url) return
  if (url.length > 500) {
    errors.logo_url = 'La URL del logo no puede superar los 500 caracteres.'
    return
  }

  let parsed
  try {
    parsed = new URL(url)
  } catch {
    errors.logo_url = 'Ingresá una URL http(s) válida.'
    return
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    errors.logo_url = 'La URL debe usar http o https.'
  }
}

export function validateTeamForm(values) {
  const errors = {}
  const name = text(values.name)
  const tag = text(values.tag).toUpperCase()
  const country = text(values.country)
  const description = values.description || ''

  if (!name) {
    errors.name = 'El nombre del equipo es obligatorio.'
  } else if (name.length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres.'
  } else if (name.length > MAX_NAME) {
    errors.name = `El nombre no puede superar los ${MAX_NAME} caracteres.`
  } else if (/[\u0000-\u001f]/.test(name)) {
    errors.name = 'El nombre contiene caracteres inválidos.'
  }

  if (tag && !TAG_REGEX.test(tag)) {
    errors.tag = 'El tag debe tener entre 2 y 10 caracteres: letras, números, - o _.'
  }
  if (country && !/^[a-zA-Z]{2}$/.test(country)) {
    errors.country = 'Usá un código de país de 2 letras (por ejemplo AR).'
  }
  if (description.length > MAX_DESCRIPTION) {
    errors.description = `La descripción no puede superar los ${MAX_DESCRIPTION} caracteres.`
  }
  if (!['PUBLIC', 'PRIVATE'].includes(values.visibility)) {
    errors.visibility = 'Elegí una visibilidad válida.'
  }

  validateUrl(values.logo_url, errors)
  return errors
}

export function buildTeamPayload(values) {
  return {
    name: text(values.name),
    tag: text(values.tag).toUpperCase() || null,
    logo_url: text(values.logo_url) || null,
    description: text(values.description) || null,
    country: text(values.country).toUpperCase() || null,
    visibility: values.visibility,
  }
}

export function teamToForm(team) {
  return {
    name: team?.name || '',
    tag: team?.tag || '',
    logo_url: team?.logo_url || '',
    description: team?.description || '',
    country: team?.country || '',
    visibility: team?.visibility || 'PRIVATE',
  }
}
