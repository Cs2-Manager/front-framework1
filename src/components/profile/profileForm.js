export const SOCIAL_PLATFORMS = [
  { key: 'twitch', label: 'Twitch', placeholder: 'https://twitch.tv/usuario' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@usuario' },
  { key: 'x', label: 'X', placeholder: 'https://x.com/usuario' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/usuario' },
  { key: 'discord', label: 'Discord', placeholder: 'https://discord.gg/invitacion' },
]

export const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC', label: 'Público: cualquier persona puede verlo' },
  { value: 'PRIVATE', label: 'Privado: solo vos y administradores' },
]

const MAX_NICKNAME = 80
const MAX_DISPLAY_NAME = 80
const MAX_BIO = 500

function optionalText(value) {
  return (value || '').trim()
}

function validateOptionalUrl(value, { field, errors, allowedHost }) {
  const text = optionalText(value)
  if (!text) return
  if (text.length > 500) {
    errors[field] = 'La URL no puede superar los 500 caracteres.'
    return
  }

  let parsed
  try {
    parsed = new URL(text)
  } catch {
    errors[field] = 'Ingresá una URL http(s) válida.'
    return
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    errors[field] = 'La URL debe usar http o https.'
    return
  }
  if (parsed.username || parsed.password) {
    errors[field] = 'La URL no puede incluir credenciales.'
    return
  }
  if (allowedHost) {
    const hostname = parsed.hostname.toLowerCase()
    if (hostname !== allowedHost && !hostname.endsWith(`.${allowedHost}`)) {
      errors[field] = `La URL debe pertenecer a ${allowedHost}.`
    }
  }
}

export function validateProfileForm(values) {
  const errors = {}
  const nickname = optionalText(values.nickname)
  const displayName = optionalText(values.display_name)
  const country = optionalText(values.country)
  const bio = values.bio || ''

  if (!nickname) {
    errors.nickname = 'El nickname competitivo es obligatorio.'
  } else if (nickname.length > MAX_NICKNAME) {
    errors.nickname = `El nickname no puede superar los ${MAX_NICKNAME} caracteres.`
  } else if (/[\u0000-\u001f]/.test(nickname)) {
    errors.nickname = 'El nickname contiene caracteres inválidos.'
  }

  if (displayName.length > MAX_DISPLAY_NAME) {
    errors.display_name = `El nombre visible no puede superar los ${MAX_DISPLAY_NAME} caracteres.`
  }
  if (country && !/^[a-zA-Z]{2}$/.test(country)) {
    errors.country = 'Usá un código de país de 2 letras (por ejemplo AR).'
  }
  if (bio.length > MAX_BIO) {
    errors.bio = `La descripción no puede superar los ${MAX_BIO} caracteres.`
  }
  if (!['PUBLIC', 'PRIVATE'].includes(values.visibility)) {
    errors.visibility = 'Elegí una visibilidad válida.'
  }

  validateOptionalUrl(values.avatar_url, {
    field: 'avatar_url',
    errors,
  })
  validateOptionalUrl(values.steam_url, {
    field: 'steam_url',
    errors,
    allowedHost: 'steamcommunity.com',
  })
  for (const platform of SOCIAL_PLATFORMS) {
    validateOptionalUrl(values[platform.key], {
      field: platform.key,
      errors,
    })
  }

  return errors
}

export function buildProfilePayload(values) {
  const socialLinks = {}
  for (const platform of SOCIAL_PLATFORMS) {
    socialLinks[platform.key] = optionalText(values[platform.key])
  }

  return {
    nickname: optionalText(values.nickname),
    display_name: optionalText(values.display_name) || null,
    country: optionalText(values.country).toUpperCase() || null,
    bio: optionalText(values.bio) || null,
    avatar_url: optionalText(values.avatar_url) || null,
    steam_url: optionalText(values.steam_url) || null,
    visibility: values.visibility,
    social_links: socialLinks,
  }
}

export function profileToForm(profile) {
  const socialLinks = profile.social_links || {}
  const form = {
    nickname: profile.nickname || '',
    display_name: profile.display_name || '',
    country: profile.country || '',
    bio: profile.bio || '',
    avatar_url: profile.avatar_url || '',
    steam_url: profile.steam_url || '',
    visibility: profile.visibility || 'PRIVATE',
  }

  for (const platform of SOCIAL_PLATFORMS) {
    form[platform.key] = socialLinks[platform.key] || ''
  }

  return form
}
