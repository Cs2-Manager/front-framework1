import { Link, useNavigate } from 'react-router-dom'

import EmptyState from '../common/EmptyState.jsx'
import { MapIcon } from './icons.jsx'

function MapThumb({ map }) {
  if (map.image_url) {
    return (
      <img
        src={map.image_url}
        alt={map.name}
        className="dashboard-map-thumb"
        loading="lazy"
      />
    )
  }

  return (
    <span className="dashboard-map-thumb dashboard-map-fallback" aria-hidden="true">
      <MapIcon />
    </span>
  )
}

function ActiveMapItem({ map }) {
  const label = map.callouts_count === 1 ? '1 zona' : `${map.callouts_count} zonas`

  return (
    <li>
      <Link to={`/maps/${map.id}`} className="dashboard-map-item">
        <MapThumb map={map} />
        <span className="dashboard-map-info">
          <strong>{map.name}</strong>
          <span>{label}</span>
        </span>
      </Link>
    </li>
  )
}

export default function ActivePool({ maps }) {
  const navigate = useNavigate()

  return (
    <section className="dashboard-panel" aria-labelledby="dashboard-pool-title">
      <div className="dashboard-panel-head">
        <h2 id="dashboard-pool-title">Pool activo</h2>
        <Link to="/maps" className="dashboard-panel-link">
          Ver mapas
        </Link>
      </div>
      {maps.length === 0 ? (
        <EmptyState
          message="No hay mapas marcados en el pool activo."
          actionLabel="Gestionar mapas"
          onAction={() => navigate('/maps')}
        />
      ) : (
        <ul className="dashboard-map-list">
          {maps.map((map) => (
            <ActiveMapItem key={map.id} map={map} />
          ))}
        </ul>
      )}
    </section>
  )
}
