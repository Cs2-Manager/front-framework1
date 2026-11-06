import api from './api'

function lineupPath(teamId, lineupId) {
  const base = `/teams/${teamId}/lineups`
  return lineupId ? `${base}/${lineupId}` : base
}

export async function fetchTeamLineups(teamId) {
  const { data } = await api.get(lineupPath(teamId))
  return {
    lineups: data.lineups,
    limits: data.limits,
    meta: data.meta,
  }
}

export async function fetchTeamLineup(teamId, lineupId) {
  const { data } = await api.get(lineupPath(teamId, lineupId))
  return { lineup: data.lineup, limits: data.limits }
}

export async function createTeamLineup(teamId, payload) {
  const { data } = await api.post(lineupPath(teamId), payload)
  return data.lineup
}

export async function updateTeamLineup(teamId, lineupId, payload) {
  const { data } = await api.put(lineupPath(teamId, lineupId), payload)
  return data.lineup
}

export async function deleteTeamLineup(teamId, lineupId) {
  await api.delete(lineupPath(teamId, lineupId))
}

export async function replaceTeamLineupPlayers(teamId, lineupId, payload) {
  const { data } = await api.put(
    `${lineupPath(teamId, lineupId)}/players`,
    payload,
  )
  return data.lineup
}

export async function activateTeamLineup(teamId, lineupId) {
  const { data } = await api.post(
    `${lineupPath(teamId, lineupId)}/activate`,
  )
  return data.lineup
}

export async function deactivateTeamLineup(teamId, lineupId) {
  const { data } = await api.post(
    `${lineupPath(teamId, lineupId)}/deactivate`,
  )
  return data.lineup
}

export async function setPrimaryTeamLineup(teamId, lineupId) {
  const { data } = await api.post(`${lineupPath(teamId, lineupId)}/primary`)
  return data.lineup
}
