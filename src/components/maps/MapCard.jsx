import { Link } from 'react-router-dom'

import CardActions from '../common/CardActions.jsx'

export default function MapCard({ map, onEdit, onDelete }) {
  const calloutCount = map.callouts.length

  return (
    <div className="map-card">
      <Link to={`/maps/${map.id}`} className="map-card-img">
        {map.image_url ? (
          <img src={map.image_url} alt={map.name} loading="lazy" />
        ) : (
          <div className="map-card-fallback">{map.name}</div>
        )}
      </Link>
      <div className="map-card-body">
        <div className="map-card-title">
          <Link to={`/maps/${map.id}`}>{map.name}</Link>
          {map.active_pool && <span className="badge">Pool activo</span>}
        </div>
        <p className="map-card-meta">
          {calloutCount} zona{calloutCount === 1 ? '' : 's'}
        </p>
        <CardActions
          className="map-card-actions"
          item={map}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  )
}
