import FormField from '../common/FormField.jsx'
import OptionList from '../common/OptionList.jsx'
import { GRENADE_TYPES, SIDES } from '../../services/lineups.js'

function MapFilter({ maps, value, onChange }) {
  return (
    <FormField as="select" id="filter-map" label="Mapa" value={value} onChange={onChange}>
      <option value="">Todos los mapas</option>
      {maps.map((map) => (
        <option key={map.id} value={map.id}>{map.name}</option>
      ))}
    </FormField>
  )
}

function OptionsFilter({ id, label, allLabel, values, value, onChange }) {
  return (
    <FormField as="select" id={id} label={label} value={value} onChange={onChange}>
      <option value="">{allLabel}</option>
      <OptionList values={values} />
    </FormField>
  )
}

export default function LineupFilters({ maps, filters, onChange }) {
  const update = (key) => (event) =>
    onChange({ ...filters, [key]: event.target.value })

  return (
    <div className="filters">
      <MapFilter maps={maps} value={filters.map_id} onChange={update('map_id')} />
      <OptionsFilter id="filter-type" label="Tipo de granada" allLabel="Todos los tipos" values={GRENADE_TYPES} value={filters.type} onChange={update('type')} />
      <OptionsFilter id="filter-side" label="Bando" allLabel="Ambos bandos" values={SIDES} value={filters.side} onChange={update('side')} />
    </div>
  )
}
