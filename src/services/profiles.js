import api from './api'

export async function fetchOwnProfile() {
  const { data } = await api.get('/profile')
  return data.profile
}

export async function updateOwnProfile(payload) {
  const { data } = await api.put('/profile', payload)
  return data.profile
}

export async function fetchPlayers({ search = '', page, perPage } = {}) {
  const params = {}
  const term = search.trim()
  if (term) params.search = term
  if (page) params.page = page
  if (perPage) params.per_page = perPage

  const { data } = await api.get('/players', { params })
  return { players: data.players, meta: data.meta }
}

export async function fetchPlayer(userId) {
  const { data } = await api.get(`/players/${userId}`)
  return data.profile
}

export async function fetchPlayerMatches(userId, { page, perPage } = {}) {
  const params = {}
  if (page) params.page = page
  if (perPage) params.per_page = perPage

  const { data } = await api.get(`/players/${userId}/matches`, { params })
  return { matches: data.matches, meta: data.meta }
}
