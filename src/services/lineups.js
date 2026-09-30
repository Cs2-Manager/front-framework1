import api from './api'

export const GRENADE_TYPES = ['Smoke', 'Molotov', 'Flash', 'HE', 'Decoy']
export const SIDES = ['TR', 'CT']

export async function fetchLineups(params = {}) {
  const { data } = await api.get('/lineups', { params })
  return data.lineups
}

export async function createLineup(payload) {
  const { data } = await api.post('/lineups', payload)
  return data.lineup
}

export async function updateLineup(id, payload) {
  const { data } = await api.put(`/lineups/${id}`, payload)
  return data.lineup
}

export async function deleteLineup(id) {
  await api.delete(`/lineups/${id}`)
}