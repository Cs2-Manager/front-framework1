import CardActions from '../common/CardActions.jsx'
import { useState } from 'react'

function CalloutItem({ callout, index, active, onSelect, onEdit, onDelete }) {
  return (
    <li
      className={active ? 'active' : ''}
      onClick={() => onSelect(index)}
    >
      <span className="callout-number">{index + 1}</span>
      <span className="callout-name">{callout.zone_name}</span>
      <span>{callout.zone} · {callout.description}</span>
      {onEdit && (
      <CardActions
        as="span"
        className="callout-actions"
        item={callout}
        onEdit={onEdit}
        onDelete={onDelete}
        stopPropagation
      />
      )}
    </li>
  )
}

export default function CalloutList({
  callouts,
  selectedIndex,
  onSelect,
  onEdit,
  onDelete,
}) {
  const [search, setSearch] = useState(''), [zone, setZone] = useState('')
  return (
    <aside className="callout-list">
      <h3>Zonas</h3>
      <label>Buscar callout<input value={search} onChange={e => setSearch(e.target.value)} /></label>
      <label>Sector del mapa<select value={zone} onChange={e => setZone(e.target.value)}><option value="">Todos</option>{[...new Set(callouts.map(c => c.zone).filter(Boolean))].map(z => <option key={z}>{z}</option>)}</select></label>
      {callouts.length === 0 && (
        <p className="text-muted">
          Todavía no hay zonas. Agregá la primera con «Nueva zona».
        </p>
      )}
      <ul>
        {callouts.map((callout, index) => (
          callout.zone_name.toLowerCase().includes(search.toLowerCase()) && (!zone || callout.zone === zone) &&
          <CalloutItem
            key={callout.id}
            callout={callout}
            index={index}
            active={index === selectedIndex}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </aside>
  )
}
