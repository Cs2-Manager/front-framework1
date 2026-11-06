import api from './api'

export async function fetchMatchmakingStatus() {
  const { data } = await api.get('/matchmaking/status')
  return data.matchmaking
}

export async function authorizeMatchmaking({ authCode, shareCode }) {
  const { data } = await api.post('/matchmaking/authorization', {
    auth_code: authCode,
    share_code: shareCode,
  })
  return data.matchmaking
}

export async function revokeMatchmaking() {
  const { data } = await api.delete('/matchmaking/authorization')
  return data.matchmaking
}

export async function syncMatchmaking() {
  const { data } = await api.post('/matchmaking/sync')
  return data
}

export async function fetchMatchmakingMatches({ limit = 25, offset = 0 } = {}) {
  const { data } = await api.get('/matchmaking/matches', {
    params: { limit, offset },
  })
  return data
}

export async function fetchMatchmakingMatch(matchId) {
  const { data } = await api.get(`/matchmaking/matches/${matchId}`)
  return data
}

export async function uploadMatchmakingDemo(file) {
  const body = new FormData()
  body.append('demo', file)
  const { data } = await api.post('/matchmaking/demos', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 5 * 60 * 1000,
  })
  return data
}
