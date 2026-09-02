import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Inicio', to: '/' },
  { label: 'Mapas', to: '/maps' },
  { label: 'Lineups', to: '/lineups' },
  { label: 'Workshop', to: '/workshop' },
]

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          CS2 Manager
        </Link>
        <nav className="navbar-nav">
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="navbar-link">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="navbar-actions">
          <Link to="/login" className="btn btn-ghost">
            Iniciar sesión
          </Link>
          <Link to="/register" className="btn btn-primary">
            Registrarse
          </Link>
        </div>
      </div>
    </header>
  )
}