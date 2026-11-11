export const TYPE_LABELS = {
  invitation: 'Invitación',
  team: 'Equipo',
  grenade_proposal: 'Propuesta',
  team_lineup: 'Lineup',
}

export const STATUS_LABELS = {
  idle: 'Sin sesión',
  connecting: 'Conectando…',
  connected: 'En línea',
  reconnecting: 'Reconectando…',
  disconnected: 'Desconectado',
  error: 'No disponible',
}

export const OFFLINE_FALLBACK =
  'El servicio de notificaciones no está disponible. El resto de la plataforma sigue funcionando.'

export function unreadBadge(unreadCount) {
  return unreadCount > 99 ? '99+' : String(unreadCount)
}

export function isConnectionWarning(status) {
  return (
    status === 'error' || status === 'disconnected' || status === 'reconnecting'
  )
}
