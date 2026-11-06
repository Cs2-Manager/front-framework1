export const NO_AUTHORIZATION_MESSAGE =
  'Este jugador todavía no habilitó la sincronización de sus partidas de matchmaking oficial.'

export const SECTION_STATUS_LABELS = {
  UNAVAILABLE: 'Sin autorizar',
  AUTHORIZED: 'Autorizado',
  PROCESSING: 'Procesando demos',
  READY: 'Historial completo',
  PARTIAL: 'Historial incompleto',
  REVOKED: 'Autorización revocada',
}

export const SECTION_STATUS_VARIANTS = {
  UNAVAILABLE: 'neutral',
  AUTHORIZED: 'info',
  PROCESSING: 'warning',
  READY: 'success',
  PARTIAL: 'warning',
  REVOKED: 'danger',
}

export const DEMO_STATUS_LABELS = {
  AWAITING_DEMO: 'Falta la demo',
  QUEUED: 'En cola',
  PROCESSING: 'Procesando',
  OK: 'Procesada',
  ERROR: 'Error',
  UNAVAILABLE: 'Demo no disponible',
  DUPLICATE: 'Duplicada',
}

export const DEMO_STATUS_VARIANTS = {
  AWAITING_DEMO: 'warning',
  QUEUED: 'info',
  PROCESSING: 'info',
  OK: 'success',
  ERROR: 'danger',
  UNAVAILABLE: 'neutral',
  DUPLICATE: 'neutral',
}

export const RESULT_LABELS = {
  WIN: 'Victoria',
  LOSS: 'Derrota',
  DRAW: 'Empate',
  UNKNOWN: 'Sin resultado',
}

export const SOURCE_LABELS = {
  VERIFIED_DEMO: 'Demos oficiales',
  PENDING: 'Pendiente de demo',
  UNAVAILABLE: 'No disponible',
  INCOMPLETE: 'Incompleta',
}

export const AUTH_HELP_URL = 'https://help.steampowered.com/wizard/HelpWithGame/'

export const MATCHMAKING_ERRORS = {
  sync: 'No pudimos iniciar la sincronización. Intentalo de nuevo.',
  authorize:
    'No pudimos guardar la autorización. Revisá el código e intentalo de nuevo.',
  revoke:
    'No pudimos revocar la autorización. Intentalo de nuevo.',
  upload: 'No pudimos subir la demo. Intentalo de nuevo.',
  detail: 'No pudimos cargar el detalle de la partida.',
  history: 'No pudimos cargar el historial completo. Intentalo de nuevo.',
  refresh: 'No pudimos actualizar el estado. Intentalo de nuevo.',
}
