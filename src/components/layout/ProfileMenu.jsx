import { Link } from 'react-router-dom'

import { ChevronIcon, InboxIcon, LogoutIcon, UserIcon } from './icons.jsx'

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

function ProfileMenuTrigger({ user, initial, open, onToggle }) {
  return (
    <button
      type="button"
      className="profile-button"
      aria-haspopup="true"
      aria-expanded={open}
      aria-label={`Menú de ${user.username}`}
      onClick={onToggle}
    >
      <span className="profile-avatar" aria-hidden="true">
        {initial}
      </span>
      <span className="profile-name">{user.username}</span>
      <ChevronIcon open={open} />
    </button>
  )
}

function ProfileDropdown({ user, initial, open, onClose, onLogout }) {
  return (
    <div className={`profile-dropdown ${open ? 'open' : ''}`}>
      <div className="profile-dropdown-header">
        <span className="profile-avatar" aria-hidden="true">
          {initial}
        </span>
        <div className="profile-dropdown-user">
          <strong>{user.username}</strong>
          {user.email && <span>{user.email}</span>}
        </div>
      </div>
      <div className="profile-dropdown-links">
        <Link to="/profile" className="profile-dropdown-item" onClick={onClose}>
          <UserIcon />
          Mi perfil
        </Link>
        <Link to="/teams/mine" className="profile-dropdown-item" onClick={onClose}>
          <UsersIcon />
          Mi equipo
        </Link>
        <Link to="/invitations" className="profile-dropdown-item" onClick={onClose}>
          <InboxIcon />
          Mis invitaciones
        </Link>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="profile-dropdown-item logout"
      >
        <LogoutIcon />
        Cerrar sesión
      </button>
    </div>
  )
}

export default function ProfileMenu({
  user,
  open,
  onToggle,
  onClose,
  onLogout,
  menuRef,
}) {
  const initial = user.username?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="profile-menu" ref={menuRef}>
      <ProfileMenuTrigger
        user={user}
        initial={initial}
        open={open}
        onToggle={onToggle}
      />
      <ProfileDropdown
        user={user}
        initial={initial}
        open={open}
        onClose={onClose}
        onLogout={onLogout}
      />
    </div>
  )
}
