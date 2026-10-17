import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext.jsx'
import NavLinks from './NavLinks.jsx'
import ProfileMenu from './ProfileMenu.jsx'
import NavbarMobileMenu from './NavbarMobileMenu.jsx'

const NAV_LINKS = [
  { label: 'Inicio', to: '/' },
  { label: 'Mapas', to: '/maps' },
  { label: 'Lineups', to: '/lineups' },
  { label: 'Workshop', to: '/workshop' },
]

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
