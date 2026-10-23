import { NavLink } from 'react-router-dom'

export default function NavLinks({ links, variant = 'desktop', ariaLabel }) {
  const isMobile = variant === 'mobile'
  const baseClass = isMobile ? 'navbar-mobile-link' : 'navbar-link'
  const navClass = isMobile ? 'navbar-mobile-nav' : 'navbar-nav'

  return (
    <nav className={navClass} aria-label={ariaLabel}>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/'}
          className={({ isActive }) =>
            isActive ? `${baseClass} active` : baseClass
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}
