export const TEAM_ROLE_LABELS = {
  CAPTAIN: 'Capitán',
  COACH: 'Entrenador',
  PLAYER: 'Jugador',
}

export const INVITATION_STATUS_LABELS = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
  CANCELLED: 'Cancelada',
}

export const TEAM_VISIBILITY_LABELS = {
  PUBLIC: 'Equipo público',
  PRIVATE: 'Equipo privado',
}

export function teamInitials(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'CS'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

export function memberName(member) {
  const user = member?.user || member
  return user?.display_name || user?.nickname || user?.username || 'Jugador'
}

export function roleLabel(role) {
  return TEAM_ROLE_LABELS[role] || role || 'Sin rol'
}

export function statusLabel(status) {
  return INVITATION_STATUS_LABELS[status] || status || 'Sin estado'
}

export function canCancelTeamInvitation(team, invitation, viewerId) {
  if (!team?.permissions?.can_manage_invitations) return false
  if (team.my_role === 'COACH') {
    return invitation?.invited_by?.id === viewerId
  }
  return true
}

export function canManageMember(team, member, viewerId) {
  if (!team?.permissions?.can_change_roles) return false
  if (member?.role === 'CAPTAIN') return false
  return member?.user?.id !== viewerId
}
