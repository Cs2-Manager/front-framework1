export default function CalloutCanvas({ map, selectedIndex, onSelect }) {
  const highlighted = map.callouts[selectedIndex] ?? null

  return (
    <div className="map-detail-visual">
      {map.image_url ? (
        <div className="callout-canvas">
          <img src={map.image_url} alt={map.name} />
          {map.callouts.map((callout, index) => (
            <button
              key={callout.id}
              type="button"
              className={`callout-marker${index === selectedIndex ? ' active' : ''}`}
              style={{
                left: `${callout.x_ratio * 100}%`,
                top: `${callout.y_ratio * 100}%`,
              }}
              onClick={() => onSelect(index)}
              title={callout.zone_name}
            >
              {index + 1}
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state">Este mapa no tiene imagen.</div>
      )}

      {highlighted && (
        <div className="callout-highlight">
          <strong>{highlighted.zone_name}</strong>
          <span className="text-muted">
            (x: {highlighted.x_ratio.toFixed(2)}, y:{' '}
            {highlighted.y_ratio.toFixed(2)})
          </span>
        </div>
      )}
    </div>
  )
}
