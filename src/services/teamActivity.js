import api from './api'

const DEFAULT_PAGE_SIZE = 20

/**
 * Historial de actividad de un equipo. Solo los integrantes actuales reciben
 * datos; un 403 se traduce en la UI como recurso privado.
 */
export async function fetchTeamActivity(
  teamId,
  { page = 1, perPage = DEFAULT_PAGE_SIZE } = {},
) {
  const { data } = await api.get(`/teams/${teamId}/activity`, {
    params: { page, per_page: perPage },
  })
  return {
    activities: data.activities || [],
    meta: data.meta || { total: 0, page, per_page: perPage },
  }
}
