import api from './api'

export async function fetchFaceitStatus() {
  const { data } = await api.get('/faceit/status')
  return data
}

export async function discoverFaceit() {
  const { data } = await api.post('/faceit/discover')
  return data.discovery
}

export async function linkFaceit(playerId) {
  const payload = playerId ? { player_id: playerId } : {}
  const { data } = await api.post('/faceit/link', payload)
  return data.faceit
}

export async function unlinkFaceit() {
  const { data } = await api.delete('/faceit/account')
  return data.faceit
}

export async function syncFaceit({ force = false } = {}) {
  const { data } = await api.post('/faceit/sync', force ? { force: true } : {})
  return data
}

export async function startFaceitOauth() {
  const { data } = await api.post('/faceit/oauth/start')
  return data.authorization_url
}

export async function fetchFaceitMatches({ limit = 25, offset = 0, map, result } = {}) {
  const params = {}
  if (limit) params.limit = limit
  if (offset) params.offset = offset
  if (map) params.map = map
  if (result) params.result = result
  const { data } = await api.get('/faceit/matches', { params })
  return data
}

export async function fetchFaceitMatch(matchId, { refresh = false } = {}) {
  const { data } = await api.get(`/faceit/matches/${matchId}`, {
    params: refresh ? { refresh: true } : undefined,
  })
  return data.match
}

export async function fetchFaceitMaps() {
  const { data } = await api.get('/faceit/maps')
  return data.maps
}

export async function fetchFaceitElo() {
  const { data } = await api.get('/faceit/elo')
  return data
}
