import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function MapDetailHeader({ map, onEdit, onCreateCallout }) {
  const { user } = useAuth()
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
      {user?.is_admin && <div className="map-toolbar">
        <button type="button" className="btn btn-ghost" onClick={onEdit}>
          Editar mapa
        </button>
        <button type="button" className="btn btn-primary" onClick={onCreateCallout}>
          Nueva zona
        </button>
      </div>}
    </div>
  )
}
