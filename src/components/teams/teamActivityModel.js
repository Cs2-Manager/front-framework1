export const PAGE_SIZE = 20

export const ACTIVITY_LABELS = {
  'member.joined': 'Nuevo integrante',
  'member.left': 'Salida',
  'member.removed': 'Expulsión',
  'member.role_changed': 'Cambio de rol',
  'grenade.proposal.created': 'Propuesta',
  'grenade.proposal.approved': 'Propuesta aprobada',
  'grenade.proposal.rejected': 'Propuesta rechazada',
  'grenade.proposal.cancelled': 'Propuesta cancelada',
  'team_lineup.created': 'Lineup creada',
  'team_lineup.updated': 'Lineup actualizada',
  'team_lineup.roster_updated': 'Alineación actualizada',
  'team_lineup.activated': 'Lineup activada',
  'team_lineup.deactivated': 'Lineup desactivada',
  'team_lineup.primary_selected': 'Lineup principal',
  'team_lineup.deleted': 'Lineup eliminada',
  'team_strategy.created': 'Estrategia creada',
  'team_strategy.updated': 'Estrategia actualizada',
  'team_strategy.deleted': 'Estrategia eliminada',
}

function timestamp(value) {
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Combina actividad paginada con eventos en vivo: deduplica por `event_id` y
 * ordena de más reciente a más antigua.
 */
export function mergeActivities(current, incoming) {
  const merged = []
  const seen = new Set()
  for (const item of [...incoming, ...current]) {
    if (!item || seen.has(item.event_id)) continue
    seen.add(item.event_id)
    merged.push(item)
  }
  return merged.sort(
    (a, b) => timestamp(b.created_at) - timestamp(a.created_at),
  )
}

/** Etiqueta legible de un tipo de actividad, con fallback derivado del tipo. */
export function activityLabel(type) {
  return ACTIVITY_LABELS[type] || type.replaceAll('.', ' · ')
}
