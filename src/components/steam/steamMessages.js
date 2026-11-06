const ERROR_MESSAGES = {
  invalid_state:
    'La sesión de Steam expiró o no es válida. Iniciá el proceso de nuevo.',
  verification_failed:
    'Steam no pudo verificar tu identidad. Intentá de nuevo.',
  unavailable: 'Steam no está disponible en este momento. Reintentá más tarde.',
  not_configured:
    'La integración con Steam no está configurada en este servidor.',
  link_requires_login: 'Iniciá sesión antes de vincular tu cuenta de Steam.',
  account_conflict:
    'Esa cuenta de Steam ya está vinculada a otro usuario de la plataforma.',
  exchange_failed:
    'No pudimos completar el inicio de sesión con Steam. Intentá de nuevo.',
}

export const STEAM_STATUS_LABELS = {
  NEVER: 'Sin sincronizar',
  OK: 'Sincronizada',
  PARTIAL: 'Sincronización parcial',
  ERROR: 'Error de sincronización',
  SKIPPED: 'Sincronización reciente',
}

export function steamErrorMessage(code, fallback) {
  if (!code) return fallback || ERROR_MESSAGES.exchange_failed
  return ERROR_MESSAGES[code] || fallback || ERROR_MESSAGES.exchange_failed
}
