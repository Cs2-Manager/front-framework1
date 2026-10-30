import { Link } from 'react-router-dom'

export default function MapDetailHeader({ map, onEdit, onCreateCallout }) {
  return (
    <div className="page-head">
      <div>
        <Link to="/maps" className="back-link">
          ← Volver a mapas
        </Link>
        <h1>
          {map.name}{' '}
          {map.active_pool && <span className="badge">Pool activo</span>}
        </h1>
      </div>
      <div className="map-toolbar">
        <button type="button" className="btn btn-ghost" onClick={onEdit}>
          Editar mapa
        </button>
        <button type="button" className="btn btn-primary" onClick={onCreateCallout}>
          Nueva zona
        </button>
      </div>
    </div>
  )
}
