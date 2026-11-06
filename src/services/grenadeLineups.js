import api from './api'

/**
 * Cliente de la biblioteca de lineups de granadas.
 *
 * Convive con `services/lineups.js` (endpoints históricos). Todas las rutas
 * nuevas viven en `/api/maps/:id/lineups` y `/api/grenade-lineups`.
 */

export const GRENADE_SCOPES = ['OFFICIAL', 'PERSONAL', 'TEAM']

export const SCOPE_LABELS = {
  OFFICIAL: 'Oficiales',
  PERSONAL: 'Mis granadas',
  TEAM: 'Equipo',
}

export const LINEUP_STATUS_LABELS = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicada',
  ARCHIVED: 'Archivada',
}

export const PROPOSAL_STATUS_LABELS = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  CANCELLED: 'Cancelada',
}

function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )
}

export async function fetchMapGrenadeLineups(mapId, { scope = 'OFFICIAL', ...params } = {}) {
  const { data } = await api.get(`/maps/${mapId}/lineups`, {
    params: cleanParams({ ...params, scope }),
  })
  return data.lineups
}

export async function fetchPersonalGrenadeLineups(params = {}) {
  const { data } = await api.get('/grenade-lineups/personal', {
    params: cleanParams(params),
  })
  return data.lineups
}

export async function fetchTeamGrenadeLineups(teamId, params = {}) {
  const { data } = await api.get(`/teams/${teamId}/grenade-lineups`, {
    params: cleanParams(params),
  })
  return data.lineups
}

export async function fetchGrenadeLineup(lineupId) {
  const { data } = await api.get(`/grenade-lineups/${lineupId}`)
  return data.lineup
}

export async function createGrenadeLineup(mapId, payload, scope = 'PERSONAL') {
  const { data } = await api.post(`/maps/${mapId}/lineups`, payload, {
    params: { scope },
  })
  return data.lineup
}

export async function updateGrenadeLineup(lineupId, payload) {
  const { data } = await api.put(`/grenade-lineups/${lineupId}`, payload)
  return data.lineup
}

export async function deleteGrenadeLineup(lineupId) {
  await api.delete(`/grenade-lineups/${lineupId}`)
}

export async function publishGrenadeLineup(lineupId) {
  const { data } = await api.post(`/grenade-lineups/${lineupId}/publish`)
  return data.lineup
}

export async function archiveGrenadeLineup(lineupId) {
  const { data } = await api.post(`/grenade-lineups/${lineupId}/archive`)
  return data.lineup
}

export async function fetchGrenadeRevisions(lineupId) {
  const { data } = await api.get(`/grenade-lineups/${lineupId}/revisions`)
  return data
}

export async function restoreGrenadeRevision(lineupId, version, payload = {}) {
  const { data } = await api.post(
    `/grenade-lineups/${lineupId}/revisions/${version}/restore`,
    payload,
  )
  return data.lineup
}

export async function proposeGrenadeLineup(lineupId, payload = {}) {
  const { data } = await api.post(`/grenade-lineups/${lineupId}/propose`, payload)
  return data.proposal
}

export async function fetchMyGrenadeProposals(params = {}) {
  const { data } = await api.get('/grenade-lineups/proposals', {
    params: cleanParams(params),
  })
  return data.proposals
}

export async function fetchGrenadeProposal(proposalId) {
  const { data } = await api.get(`/grenade-lineups/proposals/${proposalId}`)
  return data.proposal
}

export async function approveGrenadeProposal(proposalId, payload = {}) {
  const { data } = await api.post(
    `/grenade-lineups/proposals/${proposalId}/approve`,
    payload,
  )
  return data
}

export async function rejectGrenadeProposal(proposalId, payload = {}) {
  const { data } = await api.post(
    `/grenade-lineups/proposals/${proposalId}/reject`,
    payload,
  )
  return data.proposal
}

export async function cancelGrenadeProposal(proposalId) {
  const { data } = await api.post(
    `/grenade-lineups/proposals/${proposalId}/cancel`,
  )
  return data.proposal
}

export async function fetchTeamGrenadeProposals(teamId, params = {}) {
  const { data } = await api.get(`/teams/${teamId}/grenade-proposals`, {
    params: cleanParams(params),
  })
  return data.proposals
}

// Favoritos: se mantiene el endpoint histórico porque la biblioteca nueva usa
// los mismos identificadores de `lineups`.
export async function fetchGrenadeFavorites() {
  const { data } = await api.get('/lineups/favorites')
  return data.favorites
}

export async function setGrenadeFavorite(lineupId, enabled) {
  if (enabled) {
    await api.put(`/lineups/${lineupId}/favorite`)
  } else {
    await api.delete(`/lineups/${lineupId}/favorite`)
  }
}
