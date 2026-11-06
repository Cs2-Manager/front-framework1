import api from './api'

const API_BASE = (api.defaults.baseURL || '/api').replace(/\/$/, '')

/**
 * URL de inicio del flujo OpenID. Es una navegación del navegador (no XHR)
 * porque Steam debe mostrar su propia pantalla de autorización.
 */
export function getSteamLoginUrl() {
  return `${API_BASE}/auth/steam/start`
}

export async function exchangeSteamHandoff(handoff) {
  const { data } = await api.post('/auth/steam/exchange', { handoff })
  return data
}

export async function fetchSteamStatus() {
  const { data } = await api.get('/steam/status')
  return data.steam
}

export async function startSteamLink() {
  const { data } = await api.post('/steam/link')
  return data.authorization_url
}

export async function unlinkSteam() {
  const { data } = await api.delete('/steam/account')
  return data.steam
}

export async function syncSteam() {
  const { data } = await api.post('/steam/sync')
  return data
}
