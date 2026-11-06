export const TEAM_LINEUP_ROLE_LABELS = {
  IGL: 'IGL',
  AWPER: 'AWPer',
  ENTRY: 'Entry Fragger',
  SUPPORT: 'Support',
  LURKER: 'Lurker',
  ANCHOR: 'Anchor',
  RIFLER: 'Rifler',
  FLEX: 'Flex',
}

export const TEAM_LINEUP_ROLE_OPTIONS = Object.entries(
  TEAM_LINEUP_ROLE_LABELS,
).map(([value, label]) => ({ value, label }))

export const TEAM_LINEUP_STATUS_LABELS = {
  DRAFT: 'Borrador',
  ACTIVE: 'Activa',
}

export const TEAM_LINEUP_LIMITS = {
  starters: 5,
  substitutes: 5,
}

export function lineupRoleLabel(role) {
  return TEAM_LINEUP_ROLE_LABELS[role] || role || 'Sin rol'
}

export function lineupStatusLabel(status) {
  return TEAM_LINEUP_STATUS_LABELS[status] || status || 'Sin estado'
}

export function lineupPlayerName(entry) {
  const user = entry?.user || entry
  return user?.display_name || user?.nickname || user?.username || 'Jugador'
}

export function lineupMembers(lineup) {
  return [...(lineup?.starters || []), ...(lineup?.substitutes || [])]
}

export function rosterFromLineup(lineup) {
  return {
    starters: (lineup?.starters || []).map((entry) => ({
      user_id: entry.user?.id,
      role: entry.role || '',
    })),
    substitutes: (lineup?.substitutes || []).map((entry) => ({
      user_id: entry.user?.id,
      role: entry.role || '',
    })),
  }
}

export function buildRosterPayload(roster) {
  const mapEntry = (entry) => ({
    user_id: entry.user_id,
    role: entry.role || null,
  })
  return {
    starters: (roster?.starters || []).map(mapEntry),
    substitutes: (roster?.substitutes || []).map(mapEntry),
  }
}

/** Ubicación actual de un integrante dentro del roster editable. */
export function rosterSlot(roster, userId) {
  if (roster?.starters?.some((entry) => entry.user_id === userId)) {
    return 'starter'
  }
  if (roster?.substitutes?.some((entry) => entry.user_id === userId)) {
    return 'substitute'
  }
  return ''
}

export function rosterRole(roster, userId) {
  const entry =
    roster?.starters?.find((item) => item.user_id === userId) ||
    roster?.substitutes?.find((item) => item.user_id === userId)
  return entry?.role || ''
}

/**
 * Mueve a un integrante a titulares, suplentes o fuera del roster.
 * Devuelve un roster nuevo sin mutar el anterior.
 */
export function setRosterSlot(roster, userId, slot) {
  const starters = (roster?.starters || []).filter(
    (entry) => entry.user_id !== userId,
  )
  const substitutes = (roster?.substitutes || []).filter(
    (entry) => entry.user_id !== userId,
  )
  const previous =
    roster?.starters?.find((entry) => entry.user_id === userId) ||
    roster?.substitutes?.find((entry) => entry.user_id === userId)
  const role = previous?.role || ''

  if (slot === 'starter') starters.push({ user_id: userId, role })
  if (slot === 'substitute') substitutes.push({ user_id: userId, role })
  return { starters, substitutes }
}

export function setRosterRole(roster, userId, role) {
  const update = (entries) =>
    entries.map((entry) =>
      entry.user_id === userId ? { ...entry, role } : entry,
    )
  return {
    starters: update(roster?.starters || []),
    substitutes: update(roster?.substitutes || []),
  }
}
