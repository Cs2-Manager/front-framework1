function CalloutMarker({ callout, index, active, onSelect }) {
  return (
    <button
      type="button"
      className={`callout-marker${active ? ' active' : ''}`}
      style={{
        left: `${callout.x_ratio * 100}%`,
        top: `${callout.y_ratio * 100}%`,
      }}
      onClick={() => onSelect(index)}
      title={callout.zone_name}
    >
      {index + 1}
    </button>
  )
}

function CalloutHighlight({ callout }) {
  return (
    <div className="callout-highlight">
      <strong>{callout.zone_name}</strong>
      <span className="text-muted">
        (x: {callout.x_ratio.toFixed(2)}, y: {callout.y_ratio.toFixed(2)})
      </span>
    </div>
  )
}

export default function CalloutCanvas({ map, selectedIndex, onSelect }) {
  const highlighted = map.callouts[selectedIndex] ?? null

  return (
    <div className="map-detail-visual">
      {map.image_url ? (
        <div className="callout-canvas">
          <img src={map.image_url} alt={map.name} />
          {map.callouts.map((callout, index) => (
            <CalloutMarker
              key={callout.id}
              callout={callout}
              index={index}
              active={index === selectedIndex}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">Este mapa no tiene imagen.</div>
      )}

      {highlighted && <CalloutHighlight callout={highlighted} />}
    </div>
  )
}
