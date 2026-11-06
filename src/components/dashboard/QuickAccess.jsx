import { Link } from 'react-router-dom'

import { LineupIcon, MapIcon, WorkshopIcon } from './icons.jsx'

const ACCESS_LINKS = [
  {
    to: '/maps',
    title: 'Mapas y callouts',
    description: 'Administrá el catálogo de mapas y marcá las zonas de cada uno.',
    icon: <MapIcon />,
  },
  {
    to: '/lineups',
    title: 'Biblioteca de lineups',
    description: 'Consultá y sumá utilidades por mapa, tipo de granada y lado.',
    icon: <LineupIcon />,
  },
  {
    to: '/workshop',
    title: 'Steam Workshop',
    description: 'Explorá mapas de entrenamiento recomendados por categoría.',
    icon: <WorkshopIcon />,
  },
]

export default function QuickAccess() {
  return (
    <section className="dashboard-section" aria-labelledby="dashboard-access-title">
      <h2 id="dashboard-access-title" className="dashboard-section-title">
        Accesos directos
      </h2>
      <div className="dashboard-access-grid">
        {ACCESS_LINKS.map(({ to, title, description, icon }) => (
          <Link key={to} to={to} className="dashboard-access-card">
            <span className="dashboard-access-icon" aria-hidden="true">
              {icon}
            </span>
            <h3>{title}</h3>
            <p>{description}</p>
            <span className="dashboard-access-cta">Abrir</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
