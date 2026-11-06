export const FACEIT_STATUS_LABELS = {
  NEVER: 'Sin sincronizar',
  OK: 'Sincronización correcta',
  PARTIAL: 'Sincronización parcial',
  ERROR: 'Error de sincronización',
  SKIPPED: 'Esperando intervalo',
  NOT_CONFIGURED: 'FACEIT no configurado',
}

export const FACEIT_RESULT_LABELS = {
  WIN: 'Victoria',
  LOSS: 'Derrota',
  DRAW: 'Empate',
  UNKNOWN: 'Sin resultado',
}

export const FACEIT_LINK_LABELS = {
  DISCOVERED: 'Descubierta por Steam',
  VERIFIED: 'Verificada con FACEIT Connect',
}

export const FACEIT_CALLBACK_MESSAGES = {
  linked: {
    variant: 'success',
    text: 'Cuenta de FACEIT verificada correctamente. Ya podés sincronizar tus estadísticas.',
  },
  error: {
    variant: 'warning',
    text: 'No pudimos completar la vinculación con FACEIT.',
  },
}

export const FACEIT_ERROR_REASONS = {
  not_configured:
    'FACEIT Connect no está configurado en este servidor.',
  access_denied: 'Cancelaste la autorización en FACEIT.',
  invalid_state:
    'La solicitud de vinculación venció o ya fue utilizada. Intentá de nuevo.',
  exchange_failed:
    'FACEIT no aceptó el código de autorización. Intentá de nuevo.',
  userinfo_failed:
    'FACEIT no devolvió la identidad de la cuenta. Intentá de nuevo.',
  account_conflict:
    'Esa cuenta de FACEIT ya está vinculada a otro usuario.',
  already_linked:
    'Ya tenés otra cuenta de FACEIT vinculada. Desvinculala primero.',
}

export function faceitSyncVariant(status) {
  if (status === 'ERROR' || status === 'NOT_CONFIGURED') return 'error'
  if (status === 'PARTIAL' || status === 'SKIPPED') return 'warning'
  return 'success'
}
