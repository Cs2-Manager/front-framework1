/** Mensaje del estado vacío según el alcance activo y el filtro de favoritos. */
export function grenadeEmptyMessage({ favorite, scope }) {
  if (favorite) return 'No hay favoritos que coincidan con los filtros.'
  if (scope === 'OFFICIAL') {
    return 'No hay granadas oficiales publicadas para este mapa.'
  }
  if (scope === 'PERSONAL') {
    return 'Todavía no creaste granadas personales para este mapa.'
  }
  return 'El equipo todavía no tiene granadas aprobadas para este mapa.'
}
