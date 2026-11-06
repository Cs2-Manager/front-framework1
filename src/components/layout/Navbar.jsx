import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext.jsx'
import NavLinks from './NavLinks.jsx'
import ProfileMenu from './ProfileMenu.jsx'
import NavbarMobileMenu from './NavbarMobileMenu.jsx'
import useNavbarMenu from './useNavbarMenu.js'

const NAV_LINKS = [
  { label: 'Inicio', to: '/' },
  { label: 'Mapas', to: '/maps' },
  { label: 'Lineups', to: '/lineups' },
  { label: 'Workshop', to: '/workshop' },
  { label: 'Jugadores', to: '/players' },
  { label: 'Equipos', to: '/teams' },
]

const MY_TEAM_LINK = { label: 'Mi equipo', to: '/teams/mine' }

function NavbarBrand() {
  return (
    <Link to="/" className="navbar-brand">
      <span className="navbar-brand-mark" aria-hidden="true">
        CS
      </span>
      <span className="navbar-brand-text">
        CS2 <strong>Manager</strong>
      </span>
    </Link>
  )
}

function NavbarToggle({ open, onToggle }) {
  return (
    <button
      type="button"
      className={`navbar-toggle ${open ? 'open' : ''}`}
      aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
      aria-expanded={open}
      aria-controls="navbar-mobile-menu"
      onClick={onToggle}
    >
      <span className="navbar-toggle-bar" />
      <span className="navbar-toggle-bar" />
      <span className="navbar-toggle-bar" />
    </button>
  )
}

function NavbarAuth({ isAuthenticated, user, menu, onLogout }) {
  if (isAuthenticated && user) {
    return (
      <ProfileMenu
        user={user}
        open={menu.menuOpen}
        onToggle={() => menu.setMenuOpen((open) => !open)}
        onClose={() => menu.setMenuOpen(false)}
        onLogout={onLogout}
        menuRef={menu.menuRef}
      />
    )
  }

  return (
    <div className="navbar-auth">
      <Link to="/login" className="btn btn-ghost btn-sm">
        Iniciar sesión
      </Link>
      <Link to="/register" className="btn btn-primary btn-sm">
        Registrarse
      </Link>
    </div>
  )
}

function NavbarActions({ isAuthenticated, user, menu, onLogout }) {
  return (
    <div className="navbar-actions">
      <NavbarAuth
        isAuthenticated={isAuthenticated}
        user={user}
        menu={menu}
        onLogout={onLogout}
      />
      <NavbarToggle
        open={menu.mobileOpen}
        onToggle={() => menu.setMobileOpen((open) => !open)}
      />
    </div>
  )
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()
  const menu = useNavbarMenu(location.pathname)
  const links = isAuthenticated ? [...NAV_LINKS, MY_TEAM_LINK] : NAV_LINKS

  function handleLogout() {
    menu.setMenuOpen(false)
    menu.setMobileOpen(false)
    logout()
  }

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <NavbarBrand />
        <NavLinks links={links} ariaLabel="Navegación principal" />
        <NavbarActions
          isAuthenticated={isAuthenticated}
          user={user}
          menu={menu}
          onLogout={handleLogout}
        />
      </div>

      <NavbarMobileMenu
        open={menu.mobileOpen}
        links={links}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
        onClose={() => menu.setMobileOpen(false)}
      />
    </header>
  )
}
