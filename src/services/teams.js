import api from './api'

function paginationParams({ page, perPage } = {}) {
  const params = {}
  if (page) params.page = page
  if (perPage) params.per_page = perPage
  return params
}

function statusParams(status) {
  if (!status) return {}
  return { status }
}

export async function fetchTeams({ search = '', page, perPage } = {}) {
  const params = paginationParams({ page, perPage })
  const term = search.trim()
  if (term) params.search = term

  const { data } = await api.get('/teams', { params })
  return { teams: data.teams, meta: data.meta }
}

export async function fetchTeam(teamId) {
  const { data } = await api.get(`/teams/${teamId}`)
  return data.team
}

export async function fetchMyTeam() {
  const { data } = await api.get('/teams/mine')
  return data.team
}

export async function createTeam(payload) {
  const { data } = await api.post('/teams', payload)
  return data.team
}

export async function updateTeam(teamId, payload) {
  const { data } = await api.put(`/teams/${teamId}`, payload)
  return data.team
}

export async function fetchTeamMembers(teamId) {
  const { data } = await api.get(`/teams/${teamId}/members`)
  return { members: data.members, meta: data.meta }
}

export async function fetchTeamInvitations(teamId, { status = 'PENDING', page, perPage } = {}) {
  const params = { ...statusParams(status), ...paginationParams({ page, perPage }) }
  const { data } = await api.get(`/teams/${teamId}/invitations`, { params })
  return { invitations: data.invitations, meta: data.meta }
}

export async function inviteTeamMember(teamId, payload) {
  const { data } = await api.post(`/teams/${teamId}/invitations`, payload)
  return data.invitation
}

export async function cancelTeamInvitation(teamId, invitationId) {
  await api.delete(`/teams/${teamId}/invitations/${invitationId}`)
}

export async function removeTeamMember(teamId, userId) {
  await api.delete(`/teams/${teamId}/members/${userId}`)
}

export async function updateTeamMemberRole(teamId, userId, role) {
  const { data } = await api.patch(`/teams/${teamId}/members/${userId}`, { role })
  return data.member
}

export async function leaveTeam(teamId) {
  await api.post(`/teams/${teamId}/leave`)
}

export async function transferTeamCaptain(teamId, userId) {
  const { data } = await api.post(`/teams/${teamId}/transfer-captain`, {
    user_id: userId,
  })
  return data.team
}

export async function fetchMyInvitations({ status = 'PENDING', page, perPage } = {}) {
  const params = { ...statusParams(status), ...paginationParams({ page, perPage }) }
  const { data } = await api.get('/teams/invitations', { params })
  return { invitations: data.invitations, meta: data.meta }
}

export async function acceptInvitation(invitationId) {
  const { data } = await api.post(`/teams/invitations/${invitationId}/accept`)
  return data
}

export async function rejectInvitation(invitationId) {
  const { data } = await api.post(`/teams/invitations/${invitationId}/reject`)
  return data.invitation
}
