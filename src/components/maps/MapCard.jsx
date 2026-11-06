import { Link } from 'react-router-dom'

import CardActions from '../common/CardActions.jsx'
import { MAP_CATEGORY_OPTIONS } from './mapForm.js'

const CATEGORY_LABELS = Object.fromEntries(
  MAP_CATEGORY_OPTIONS.map((option) => [option.value, option.label]),
)

export default function MapCard({ map, onEdit, onDelete, onRestore, restoring = false }) {
  const calloutCount = map.callouts.length
  const category = map.category || 'COMPETITIVE'
  const archived = map.status === 'ARCHIVED'

  return (
    <div className="map-card">
      <Link to={`/maps/${map.id}`} className="map-card-img">
        {map.cover_url || map.image_url ? (
          <img src={map.cover_url || map.image_url} alt={map.name} loading="lazy" />
        ) : (
          <div className="map-card-fallback">{map.name}</div>
        )}
      </Link>
      <div className="map-card-body">
        <div className="map-card-title">
          <Link to={`/maps/${map.id}`}>{map.name}</Link>
          {map.active_pool && <span className="badge">Pool activo</span>}
          {category !== 'COMPETITIVE' && (
            <span className="badge">{CATEGORY_LABELS[category] || category}</span>
          )}
          {archived && <span className="badge">Archivado</span>}
        </div>
        <p className="map-card-meta">
          {calloutCount} zona{calloutCount === 1 ? '' : 's'}
        </p>
        {map.resources && <p className="map-card-meta">{map.resources.strategies_count} estrategias · {map.resources.grenades_count} granadas · {({ NOT_STARTED: 'Sin preparar', IN_PROGRESS: 'En preparación', READY: 'Preparado' })[map.resources.readiness]}</p>}
        {map.description && <p className="map-library-description">{map.description}</p>}
        {map.cover_url && <img className="map-library-radar" src={map.image_url} alt={`Plano táctico de ${map.name}`} loading="lazy" />}
        {onEdit && (
        <CardActions
          className="map-card-actions"
          item={map}
          onEdit={onEdit}
          onDelete={archived ? undefined : onDelete}
          onRestore={archived ? onRestore : undefined}
          restoreBusy={restoring}
        />
        )}
      </div>
    </div>
  )
}
