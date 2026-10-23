import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext.jsx'
import NavLinks from './NavLinks.jsx'
import ProfileMenu from './ProfileMenu.jsx'
import NavbarMobileMenu from './NavbarMobileMenu.jsx'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

const NAV_LINKS = [
  { label: 'Inicio', to: '/' },
  { label: 'Mapas', to: '/maps' },
  { label: 'Lineups', to: '/lineups' },
  { label: 'Workshop', to: '/workshop' },
]

function UserIcon() {
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
      className="icon"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function LogoutIcon() {
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
      className="icon"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    setMenuOpen(false)
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return undefined
    function handleClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  function handleLogout() {
    setMenuOpen(false)
    setMobileOpen(false)
    logout()
  }

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-mark" aria-hidden="true">
            CS
          </span>
          CS2 Manager
        </Link>

        <NavLinks links={NAV_LINKS} ariaLabel="Navegación principal" />

        <div className="navbar-actions">
          {isAuthenticated && user ? (
            <ProfileMenu
              user={user}
              open={menuOpen}
              onToggle={() => setMenuOpen((open) => !open)}
              onClose={() => setMenuOpen(false)}
              onLogout={handleLogout}
              menuRef={menuRef}
            />
        <nav className="navbar-nav" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                isActive ? 'navbar-link active' : 'navbar-link'
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-actions">
          {isAuthenticated && user ? (
            <div className="profile-menu" ref={menuRef}>
              <button
                type="button"
                className="profile-button"
                aria-haspopup="true"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <span className="profile-avatar" aria-hidden="true">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </span>
                <span className="profile-name">{user.username}</span>
                <svg
                  className={`profile-chevron ${menuOpen ? 'open' : ''}`}
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
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <div className={`profile-dropdown ${menuOpen ? 'open' : ''}`}>
                <div className="profile-dropdown-header">
                  <span className="profile-avatar" aria-hidden="true">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                  <div className="profile-dropdown-user">
                    <strong>{user.username}</strong>
                    <span>{user.email}</span>
                  </div>
                </div>
                <Link to="/profile" className="profile-dropdown-item">
                  <UserIcon />
                  Mi perfil
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="profile-dropdown-item logout"
                >
                  <LogoutIcon />
                  Cerrar sesión
                </button>
              </div>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="btn btn-ghost">
                Iniciar sesión
              </Link>
              <Link to="/register" className="btn btn-primary">
                Registrarse
              </Link>
            </div>
          )}

          <button
            type="button"
            className="navbar-toggle"
            aria-label="Abrir menú"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span className={`navbar-toggle-bar ${mobileOpen ? 'open' : ''}`} />
            <span className={`navbar-toggle-bar ${mobileOpen ? 'open' : ''}`} />
            <span className={`navbar-toggle-bar ${mobileOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>

      <div className={`navbar-mobile ${mobileOpen ? 'open' : ''}`}>
        <nav className="navbar-mobile-nav" aria-label="Navegación principal móvil">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                isActive ? 'navbar-mobile-link active' : 'navbar-mobile-link'
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="navbar-mobile-actions">
          {isAuthenticated && user ? (
            <>
              <Link to="/profile" className="btn btn-ghost btn-block">
                <UserIcon />
                Mi perfil
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-danger btn-block"
              >
                <LogoutIcon />
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-block">
                Iniciar sesión
              </Link>
              <Link to="/register" className="btn btn-primary btn-block">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>

      <NavbarMobileMenu
        open={mobileOpen}
        links={NAV_LINKS}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
      />
    </header>
  )
}
