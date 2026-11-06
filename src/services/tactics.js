import api from './api'
const base = (teamId) => `/teams/${teamId}`
export const fetchStrategies = async (teamId, mapId) => (await api.get(`${base(teamId)}/strategies`, { params: { map_id: mapId } })).data.strategies
export const saveStrategy = async (teamId, data, id) => (await (id ? api.put(`${base(teamId)}/strategies/${id}`, data) : api.post(`${base(teamId)}/strategies`, data))).data.strategy
export const duplicateStrategy = async (teamId, id) => (await api.post(`${base(teamId)}/strategies/${id}/duplicate`)).data.strategy
export const deleteStrategy = (teamId, id, version) => api.delete(`${base(teamId)}/strategies/${id}`, { data: { version } })
export const fetchRevisions = async (teamId, id) => (await api.get(`${base(teamId)}/strategies/${id}/revisions`)).data.revisions
export const restoreStrategy = async (teamId, id, revision, version) => (await api.post(`${base(teamId)}/strategies/${id}/restore/${revision}`, { version })).data.strategy
export const fetchPreparation = async (teamId, mapId) => (await api.get(`${base(teamId)}/maps/${mapId}/preparation`)).data.preparation
export const savePreparation = async (teamId, mapId, data) => (await api.put(`${base(teamId)}/maps/${mapId}/preparation`, data)).data.preparation
