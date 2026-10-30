import CardActions from '../common/CardActions.jsx'

function CalloutItem({ callout, index, active, onSelect, onEdit, onDelete }) {
  return (
    <li
      className={active ? 'active' : ''}
      onClick={() => onSelect(index)}
    >
      <span className="callout-number">{index + 1}</span>
      <span className="callout-name">{callout.zone_name}</span>
      <CardActions
        as="span"
        className="callout-actions"
        item={callout}
        onEdit={onEdit}
        onDelete={onDelete}
        stopPropagation
      />
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
  return (
    <aside className="callout-list">
      <h3>Zonas</h3>
      {callouts.length === 0 && (
        <p className="text-muted">
          Todavía no hay zonas. Agregá la primera con «Nueva zona».
        </p>
      )}
      <ul>
        {callouts.map((callout, index) => (
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
