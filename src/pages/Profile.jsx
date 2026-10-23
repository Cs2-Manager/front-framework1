import { useAuth } from '../context/AuthContext.jsx'
import ProfileHeader from '../components/profile/ProfileHeader.jsx'
import ProfileActions from '../components/profile/ProfileActions.jsx'
import StatCard from '../components/profile/StatCard.jsx'
import {
  AccountIcon,
  CalendarIcon,
  IdIcon,
  MailIcon,
} from '../components/profile/icons.jsx'
﻿import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function formatDate(value) {
  if (!value) return 'No disponible'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No disponible'
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function Profile() {
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <div className="page container page-profile">
        <div className="profile-loading" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <p>Cargando perfil…</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      icon: <AccountIcon />,
      value: user.username,
      label: 'Nombre de usuario',
    },
    { icon: <MailIcon />, value: user.email, label: 'Correo electrónico' },
    { icon: <IdIcon />, value: `#${user.id}`, label: 'Identificador' },
    {
      icon: <CalendarIcon />,
      value: formatDate(user.created_at),
      label: 'Miembro desde',
    },
  ]
  const initial = user.username?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="page container page-profile">
      <div className="profile-card fade-in-up">
        <ProfileHeader user={user} onLogout={logout} />
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
          <button onClick={logout} className="btn btn-danger profile-logout-top">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </div>

        <div className="profile-content">
          <section className="profile-section">
            <h2>Información de la cuenta</h2>
            <div className="profile-stats">
              {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
              <div className="stat-card">
                <span className="stat-icon" aria-hidden="true">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <circle cx="9" cy="10" r="2" />
                    <path d="M5 20a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4" />
                    <line x1="15" y1="10" x2="19" y2="10" />
                    <line x1="15" y1="14" x2="19" y2="14" />
                  </svg>
                </span>
                <div>
                  <div className="stat-value">{user.username}</div>
                  <div className="stat-label">Nombre de usuario</div>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-icon" aria-hidden="true">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-10 6L2 7" />
                  </svg>
                </span>
                <div>
                  <div className="stat-value">{user.email}</div>
                  <div className="stat-label">Correo electrónico</div>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-icon" aria-hidden="true">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 7h16" />
                    <path d="M4 12h10" />
                    <path d="M4 17h7" />
                  </svg>
                </span>
                <div>
                  <div className="stat-value">#{user.id}</div>
                  <div className="stat-label">Identificador</div>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-icon" aria-hidden="true">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
                <div>
                  <div className="stat-value">{formatDate(user.created_at)}</div>
                  <div className="stat-label">Miembro desde</div>
                </div>
              </div>
            </div>
          </section>

          <section className="profile-section">
            <h2>Acciones</h2>
            <ProfileActions onLogout={logout} />
            <div className="profile-actions">
              <Link to="/" className="btn btn-ghost">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Volver al inicio
              </Link>
              <Link to="/workshop" className="btn btn-ghost">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon"
                >
                  <path d="m14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.1-2.1z" />
                </svg>
                Ir al Workshop
              </Link>
              <button onClick={logout} className="btn btn-danger">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
