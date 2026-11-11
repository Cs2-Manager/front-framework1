// Utilidades de normalización y helpers para el contexto de tiempo real.
// Todas las funciones son puras: reciben datos crudos del servidor y devuelven
// estructuras normalizadas y validadas para el frontend.

const PAGE_SIZE = 20
// Límite defensivo en memoria. El historial real vive en PostgreSQL y se
// pagina; este tope solo evita que una pestaña abierta días crezca sin control.
const MAX_NOTIFICATIONS = 200
const MAX_ACTIVITIES = 100
const SOCKET_PATH =
  import.meta.env.VITE_REALTIME_PATH || '/realtime/socket.io'

// Errores de autenticación: reintentar en bucle no ayuda y castiga al servidor.
const FATAL_CODES = new Set([
  'AUTH_MISSING_TOKEN',
  'AUTH_INVALID',
  'AUTH_EXPIRED',
  'AUTH_FORBIDDEN',
  'CONNECTION_LIMIT',
])

const HISTORY_ERROR =
  'No pudimos cargar el historial de notificaciones. Intentalo de nuevo.'
const READ_ERROR = 'No pudimos actualizar el estado de las notificaciones.'

export {
  PAGE_SIZE,
  MAX_NOTIFICATIONS,
  MAX_ACTIVITIES,
  SOCKET_PATH,
  FATAL_CODES,
  HISTORY_ERROR,
  READ_ERROR,
}

function safePath(value) {
  return typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//')
    ? value
    : null
}

function positiveInt(value) {
  return Number.isInteger(value) && value > 0 ? value : null
}

function timestamp(value) {
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function byNewest(a, b) {
  return timestamp(b.created_at) - timestamp(a.created_at)
}

function mergeById(current, incoming) {
  const merged = []
  const seen = new Set()
  for (const item of [...incoming, ...current]) {
    if (!item || seen.has(item.event_id)) continue
    seen.add(item.event_id)
    merged.push(item)
  }
  return merged.sort(byNewest)
}

export { safePath, positiveInt, timestamp, byNewest, mergeById }

// Normaliza una notificación recibida en vivo o del historial.
export function normalizeNotification(raw) {
  if (!raw || typeof raw !== 'object') return null
  const eventId = typeof raw.event_id === 'string' ? raw.event_id : ''
  if (!eventId) return null
  if (typeof raw.title !== 'string' || typeof raw.message !== 'string') {
    return null
  }
  const resource = raw.resource
  if (!resource || typeof resource !== 'object') return null
  const path = safePath(resource.path)
  if (!path) return null

  return {
    id: typeof raw.id === 'string' ? raw.id : eventId,
    event_id: eventId,
    notification_id: positiveInt(raw.notification_id),
    event_type: typeof raw.event_type === 'string' ? raw.event_type : '',
    created_at:
      typeof raw.created_at === 'string'
        ? raw.created_at
        : new Date().toISOString(),
    title: raw.title,
    message: raw.message,
    read: raw.read === true,
    read_at: typeof raw.read_at === 'string' ? raw.read_at : null,
    resource: {
      type:
        typeof resource.type === 'string' && resource.type
          ? resource.type
          : 'other',
      id: resource.id,
      team_id: resource.team_id,
      path,
    },
    metadata:
      raw.metadata && typeof raw.metadata === 'object' ? raw.metadata : {},
  }
}

// Presencia de un equipo: solo datos confirmados por el servidor.
export function normalizePresence(raw) {
  if (!raw || typeof raw !== 'object') return null
  const teamId = positiveInt(raw.team_id)
  if (!teamId) return null

  const members = Array.isArray(raw.members)
    ? raw.members
        .filter((member) => member && positiveInt(member.user_id))
        .map((member) => ({
          user_id: member.user_id,
          username:
            typeof member.username === 'string' ? member.username : '',
          role: typeof member.role === 'string' ? member.role : null,
        }))
    : []

  return {
    team_id: teamId,
    members,
    generated_at:
      typeof raw.generated_at === 'string'
        ? raw.generated_at
        : new Date().toISOString(),
  }
}

// Actividad de equipo normalizada (historial REST o evento en vivo).
export function normalizeTeamActivity(raw) {
  if (!raw || typeof raw !== 'object') return null
  const eventId = typeof raw.event_id === 'string' ? raw.event_id : ''
  const teamId = positiveInt(raw.team_id)
  const path = safePath(raw.path)
  if (!eventId || !teamId || !path) return null
  if (
    typeof raw.activity_type !== 'string' ||
    typeof raw.description !== 'string'
  ) {
    return null
  }

  const actor = raw.actor && typeof raw.actor === 'object' ? raw.actor : {}
  return {
    id: positiveInt(raw.activity_id) || positiveInt(raw.id) || eventId,
    event_id: eventId,
    team_id: teamId,
    activity_id: positiveInt(raw.activity_id) || positiveInt(raw.id),
    activity_type: raw.activity_type,
    description: raw.description,
    actor: {
      user_id: positiveInt(actor.user_id),
      username:
        typeof actor.username === 'string' ? actor.username : '',
    },
    resource_type:
      typeof raw.resource_type === 'string' ? raw.resource_type : 'team',
    resource_id: positiveInt(raw.resource_id),
    path,
    metadata:
      raw.metadata && typeof raw.metadata === 'object' ? raw.metadata : {},
    created_at:
      typeof raw.created_at === 'string'
        ? raw.created_at
        : new Date().toISOString(),
  }
}
