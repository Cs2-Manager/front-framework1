import api from './api'

export const WORKSHOP_CATEGORIES = [
  'Aim',
  'Recoil',
  'Crosshair',
  'HUD',
  'Warmup',
]

export async function fetchWorkshopMaps(params = {}) {
  const { data } = await api.get('/workshop-maps', { params })
  return data.workshop_maps
}

export async function fetchWorkshopMap(id) {
  const { data } = await api.get(`/workshop-maps/${id}`)
  return data.workshop_map
}

export async function createWorkshopMap(payload) {
  const { data } = await api.post('/workshop-maps', payload)
  return data.workshop_map
}

export async function updateWorkshopMap(id, payload) {
  const { data } = await api.put(`/workshop-maps/${id}`, payload)
  return data.workshop_map
}

export async function deleteWorkshopMap(id) {
  await api.delete(`/workshop-maps/${id}`)
}
