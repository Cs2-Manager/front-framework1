import api from './api'

export async function fetchMaps() {
  const { data } = await api.get('/maps')
  return data.maps
}

export async function fetchMap(id) {
  const { data } = await api.get(`/maps/${id}`)
  return data.map
}

export async function createMap(payload) {
  const { data } = await api.post('/maps', payload)
  return data.map
}

export async function updateMap(id, payload) {
  const { data } = await api.put(`/maps/${id}`, payload)
  return data.map
}

export async function deleteMap(id) {
  await api.delete(`/maps/${id}`)
}

export async function createCallout(mapId, payload) {
  const { data } = await api.post(`/maps/${mapId}/callouts`, payload)
  return data.callout
}

export async function updateCallout(mapId, calloutId, payload) {
  const { data } = await api.put(`/maps/${mapId}/callouts/${calloutId}`, payload)
  return data.callout
}

export async function deleteCallout(mapId, calloutId) {
  await api.delete(`/maps/${mapId}/callouts/${calloutId}`)
}