import { GRENADE_TYPES, SIDES } from '../../services/lineups.js'

export default function LineupFilters({ maps, filters, onChange }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="filters">
      <div className="form-group">
        <label htmlFor="filter-map">Mapa</label>
        <select
          id="filter-map"
          className="form-input"
          value={filters.map_id}
          onChange={(e) => update('map_id', e.target.value)}
        >
          <option value="">Todos los mapas</option>
          {maps.map((map) => (
            <option key={map.id} value={map.id}>
              {map.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="filter-type">Tipo de granada</label>
        <select
          id="filter-type"
          className="form-input"
          value={filters.type}
          onChange={(e) => update('type', e.target.value)}
        >
          <option value="">Todos los tipos</option>
          {GRENADE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="filter-side">Bando</label>
        <select
          id="filter-side"
          className="form-input"
          value={filters.side}
          onChange={(e) => update('side', e.target.value)}
        >
          <option value="">Ambos bandos</option>
          {SIDES.map((side) => (
            <option key={side} value={side}>
              {side}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}