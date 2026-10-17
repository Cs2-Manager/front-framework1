import { Link } from 'react-router-dom'

import NavLinks from './NavLinks.jsx'
import { LogoutIcon, UserIcon } from './icons.jsx'

export default function NavbarMobileMenu({
  open,
  links,
  isAuthenticated,
  user,
  onLogout,
}) {
  return (
    <div className={`navbar-mobile ${open ? 'open' : ''}`}>
      <NavLinks
        links={links}
        variant="mobile"
        ariaLabel="Navegación principal móvil"
      />
      <div className="navbar-mobile-actions">
        {isAuthenticated && user ? (
          <>
            <Link to="/profile" className="btn btn-ghost btn-block">
              <UserIcon />
              Mi perfil
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
  )
}
