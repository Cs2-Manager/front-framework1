import { useEffect, useMemo, useState } from 'react'

/**
 * Query params de filtros de lineups (omite los vacíos).
 */
export function buildLineupParams(filters) {
  const params = {}
  if (filters.map_id) params.map_id = filters.map_id
  if (filters.type) params.type = filters.type
  if (filters.side) params.side = filters.side
  return params
}

/**
 * Índice `id -> map` para resolver nombres en las tarjetas.
 */
export function useMapIndex(maps) {
  return useMemo(() => new Map(maps.map((map) => [map.id, map])), [maps])
}

/**
 * Lineup seleccionado, sincronizado con la lista (mantiene el actual si sigue).
 */
export function useSelectedLineup(lineups) {
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    setSelected((current) => {
      if (current && lineups.some((item) => item.id === current.id)) {
        return current
      }
      return lineups[0] || null
    })
  }, [lineups])

  return [selected, setSelected]
}
