import FormField from '../common/FormField.jsx'
import OptionList from '../common/OptionList.jsx'
import { GRENADE_TYPES, SIDES } from '../../services/lineups.js'

export default function LineupFilters({ maps, filters, onChange }) {
  const update = (key) => (event) =>
    onChange({ ...filters, [key]: event.target.value })

  return (
    <div className="filters">
      <FormField
        as="select"
        id="filter-map"
        label="Mapa"
        value={filters.map_id}
        onChange={update('map_id')}
      >
        <option value="">Todos los mapas</option>
        {maps.map((map) => (
          <option key={map.id} value={map.id}>
            {map.name}
          </option>
        ))}
      </FormField>

      <FormField
        as="select"
        id="filter-type"
        label="Tipo de granada"
        value={filters.type}
        onChange={update('type')}
      >
        <option value="">Todos los tipos</option>
        <OptionList values={GRENADE_TYPES} />
      </FormField>

      <FormField
        as="select"
        id="filter-side"
        label="Bando"
        value={filters.side}
        onChange={update('side')}
      >
        <option value="">Ambos bandos</option>
        <OptionList values={SIDES} />
      </FormField>
    </div>
  )
}
