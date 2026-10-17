import { Link } from 'react-router-dom'

import { HomeIcon, LogoutIcon, WrenchIcon } from './icons.jsx'

export default function ProfileActions({ onLogout }) {
  return (
    <div className="profile-actions">
      <Link to="/" className="btn btn-ghost">
        <HomeIcon />
        Volver al inicio
      </Link>
      <Link to="/workshop" className="btn btn-ghost">
        <WrenchIcon />
        Ir al Workshop
      </Link>
      <button onClick={onLogout} className="btn btn-danger">
        <LogoutIcon />
        Cerrar sesión
      </button>
    </div>
  )
}
