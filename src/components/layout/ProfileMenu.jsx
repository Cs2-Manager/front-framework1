import { Link } from 'react-router-dom'

import { ChevronIcon, LogoutIcon, UserIcon } from './icons.jsx'

function ProfileMenuTrigger({ user, initial, open, onToggle }) {
  return (
    <button
      type="button"
      className="profile-button"
      aria-haspopup="true"
      aria-expanded={open}
      onClick={onToggle}
    >
      <span className="profile-avatar" aria-hidden="true">{initial}</span>
      <span className="profile-name">{user.username}</span>
      <ChevronIcon open={open} />
    </button>
  )
}

function ProfileDropdown({ user, initial, open, onClose, onLogout }) {
  return (
    <div className={`profile-dropdown ${open ? 'open' : ''}`}>
      <div className="profile-dropdown-header">
        <span className="profile-avatar" aria-hidden="true">{initial}</span>
        <div className="profile-dropdown-user">
          <strong>{user.username}</strong>
          <span>{user.email}</span>
        </div>
      </div>
      <Link to="/profile" className="profile-dropdown-item" onClick={onClose}>
        <UserIcon />
        Mi perfil
      </Link>
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

export default function ProfileMenu({ user, open, onToggle, onClose, onLogout, menuRef }) {
  const initial = user.username?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="profile-menu" ref={menuRef}>
      <ProfileMenuTrigger user={user} initial={initial} open={open} onToggle={onToggle} />
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
