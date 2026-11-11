import { useEffect, useState } from 'react'

import { fetchMyTeam } from '../services/teams.js'
import api from '../services/api.js'

/**
 * Recursos tácticos del equipo (callouts y utilidades) indexados por mapa.
 * Un fallo de carga no bloquea el catálogo: se informa como aviso aparte.
 */
export default function useMapsResources() {
  const [resources, setResources] = useState({})
  const [resourceError, setResourceError] = useState('')

  useEffect(() => {
    let active = true
    fetchMyTeam()
      .then(async (team) => {
        if (!team) return
        const { data } = await api.get(`/teams/${team.id}/map-resources`)
        if (!active) return
        setResources(
          Object.fromEntries(data.resources.map((item) => [item.map_id, item])),
        )
      })
      .catch(() => {
        if (active) {
          setResourceError('No se pudieron cargar los recursos del equipo.')
        }
      })
    return () => {
      active = false
    }
  }, [])

  return { resources, resourceError }
}
