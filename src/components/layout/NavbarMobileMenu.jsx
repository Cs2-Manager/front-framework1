import { Link } from 'react-router-dom'

import NavLinks from './NavLinks.jsx'
import { InboxIcon, LogoutIcon, UserIcon } from './icons.jsx'

function UsersIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <circle cx="17" cy="9" r="2" />
      <path d="M15 20a5 5 0 0 1 6-4" />
    </svg>
  )
}

function MobileAccountActions({ user, onLogout }) {
  return (
    <>
      <div className="navbar-mobile-user">
        <span className="navbar-mobile-avatar" aria-hidden="true">
          {user.username?.charAt(0).toUpperCase() || 'U'}
        </span>
        <span className="navbar-mobile-user-copy">
          <strong>{user.username}</strong>
          {user.email && <span>{user.email}</span>}
        </span>
      </div>
      <Link to="/profile" className="btn btn-ghost btn-block">
        <UserIcon />
        Mi perfil
      </Link>
      <Link to="/teams/mine" className="btn btn-ghost btn-block">
        <UsersIcon />
        Mi equipo
      </Link>
      <Link to="/invitations" className="btn btn-ghost btn-block">
        <InboxIcon />
        Mis invitaciones
      </Link>
      <button
        type="button"
        onClick={onLogout}
        className="btn btn-danger btn-block"
      >
        <LogoutIcon />
        Cerrar sesión
      </button>
    </>
  )
}

function MobileGuestActions() {
  return (
    <>
      <Link to="/login" className="btn btn-ghost btn-block">
        Iniciar sesión
      </Link>
      <Link to="/register" className="btn btn-primary btn-block">
        Registrarse
      </Link>
    </>
  )
}

export default function NavbarMobileMenu({
  open,
  links,
  isAuthenticated,
  user,
  onLogout,
  onClose,
}) {
  return (
    <>
      <div
        className={`navbar-mobile-backdrop ${open ? 'open' : ''}`}
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        id="navbar-mobile-menu"
        className={`navbar-mobile ${open ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        aria-hidden={!open}
      >
        <NavLinks
          links={links}
          variant="mobile"
          ariaLabel="Navegación principal móvil"
        />
        <div className="navbar-mobile-actions">
          {isAuthenticated && user ? (
            <MobileAccountActions user={user} onLogout={onLogout} />
          ) : (
            <MobileGuestActions />
          )}
        </div>
      </div>
    </>
  )
}
