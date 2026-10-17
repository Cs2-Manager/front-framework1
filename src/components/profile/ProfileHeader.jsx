import { LogoutIcon } from './icons.jsx'

export default function ProfileHeader({ user, onLogout }) {
  const initial = user.username?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="profile-header">
      <div className="profile-avatar-large" aria-hidden="true">
        {initial}
      </div>
      <div className="profile-info">
        <h1>{user.username}</h1>
        <p className="profile-email">{user.email}</p>
        <span className="profile-badge">
          <span className="profile-badge-dot" aria-hidden="true" />
          Sesión activa
        </span>
      </div>
      <button onClick={onLogout} className="btn btn-danger profile-logout-top">
        <LogoutIcon />
        Cerrar sesión
      </button>
    </div>
  )
}
