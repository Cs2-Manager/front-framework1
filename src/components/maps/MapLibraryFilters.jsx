import {
  MAP_CATEGORY_OPTIONS,
  MAP_STATUS_OPTIONS,
} from './mapForm.js'

export default function MapLibraryFilters({ filters, onChange }) {
  const change = (event) =>
    onChange({ ...filters, [event.target.name]: event.target.value })

  return (
    <section className="map-library-filters" aria-label="Filtros de mapas">
      <label>
        Buscar mapa
        <input
          type="search"
          name="q"
          value={filters.q}
          onChange={change}
          placeholder="Nombre del mapa…"
        />
      </label>
      <label>
        Map pool
        <select name="pool" value={filters.pool} onChange={change}>
          <option value="all">Todos</option>
          <option value="active">Pool activo</option>
          <option value="reserve">Fuera del pool</option>
        </select>
      </label>
      <label>
        Categoría
        <select
          name="category"
          value={filters.category || 'all'}
          onChange={change}
        >
          <option value="all">Todas</option>
          {MAP_CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Estado
        <select
          name="status"
          value={
            filters.status && filters.status !== 'all'
              ? String(filters.status).toUpperCase()
              : 'all'
          }
          onChange={change}
        >
          <option value="all">Todos</option>
          {MAP_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Ordenar
        <select name="sort" value={filters.sort} onChange={change}>
          <option value="name">Nombre A–Z</option>
          <option value="name_desc">Nombre Z–A</option>
          <option value="pool">Pool activo primero</option>
          <option value="display_order">Orden del catálogo</option>
          <option value="updated">Actualizados primero</option>
        </select>
      </label>
    </section>
  )
}

export function filterMaps(
  maps,
  { q = '', pool = 'all', sort = 'name', category = 'all', status = 'all' } = {},
) {
  return maps
    .filter(
      (map) =>
        map.name.toLocaleLowerCase().includes(q.trim().toLocaleLowerCase()) &&
        (pool === 'all' ||
          Boolean(map.active_pool) === (pool === 'active')) &&
        (category === 'all' || map.category === category) &&
        (status === 'all' ||
          String(map.status || 'ACTIVE').toUpperCase() === status.toUpperCase()),
    )
    .sort((a, b) => {
      if (sort === 'pool' && a.active_pool !== b.active_pool) {
        return Number(b.active_pool) - Number(a.active_pool)
      }
      if (sort === 'display_order') {
        return (a.display_order || 0) - (b.display_order || 0) ||
          a.name.localeCompare(b.name)
      }
      if (sort === 'updated') {
        return String(b.updated_at || '').localeCompare(String(a.updated_at || ''))
      }
      return a.name.localeCompare(b.name) * (sort === 'name_desc' ? -1 : 1)
    })
}
