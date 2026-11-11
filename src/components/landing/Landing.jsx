import { Link } from 'react-router-dom'

import { LineupIcon, MapIcon, WorkshopIcon } from '../dashboard/icons.jsx'
import { UsersIcon } from '../profile/icons.jsx'

const LANDING_FEATURES = [
  {
    to: '/maps',
    title: 'Mapas y callouts',
    description:
      'Centralizá el pool de mapas, las zonas y los callouts que usa tu equipo.',
    icon: <MapIcon size={22} />,
  },
  {
    to: '/lineups',
    title: 'Lineups de utilidades',
    description:
      'Guardá y consultá smokes, flashes y molotovs por mapa, lado y tipo.',
    icon: <LineupIcon size={22} />,
  },
  {
    to: '/teams',
    title: 'Equipos y alineaciones',
    description:
      'Gestioná rosters, roles de juego, invitaciones y alineaciones titulares.',
    icon: <UsersIcon size={22} />,
  },
  {
    to: '/workshop',
    title: 'Steam Workshop',
    description:
      'Encontrá mapas de entrenamiento recomendados por categoría.',
    icon: <WorkshopIcon size={22} />,
  },
]

/** Portada pública para visitantes sin sesión. */
export default function Landing() {
  return (
    <div className="page container landing">
      <section className="landing-hero fade-in-up">
        <div className="landing-hero-copy">
          <p className="landing-eyebrow">Counter-Strike 2 · Entrenamiento</p>
          <h1>Tu centro de entrenamiento competitivo</h1>
          <p className="landing-lead">
            Organizá mapas y callouts, guardá lineups de utilidades, gestioná tu
            equipo y seguí tu progreso competitivo en un solo lugar.
          </p>
          <div className="landing-actions">
            <Link to="/register" className="btn btn-primary">
              Crear cuenta
            </Link>
            <Link to="/login" className="btn btn-ghost">
              Iniciar sesión
            </Link>
          </div>
          <p className="landing-note">
            ¿Solo querés mirar? El directorio de{' '}
            <Link to="/players">jugadores</Link> y{' '}
            <Link to="/teams">equipos</Link> es público.
          </p>
        </div>
        <div className="landing-hero-art" aria-hidden="true">
          <span className="landing-art-ring" />
          <span className="landing-art-card landing-art-card-a">
            <MapIcon size={18} />
            <strong>Pool activo</strong>
            <span>Mapas y callouts</span>
          </span>
          <span className="landing-art-card landing-art-card-b">
            <LineupIcon size={18} />
            <strong>Lineups</strong>
            <span>Utilidades por mapa</span>
          </span>
          <span className="landing-art-card landing-art-card-c">
            <UsersIcon size={18} />
            <strong>Roster</strong>
            <span>5 titulares + suplentes</span>
          </span>
        </div>
      </section>

      <section
        className="landing-features"
        aria-labelledby="landing-features-title"
      >
        <h2 id="landing-features-title">Todo el flujo competitivo</h2>
        <div className="landing-features-grid">
          {LANDING_FEATURES.map(({ to, title, description, icon }) => (
            <Link key={to} to={to} className="landing-feature-card">
              <span className="landing-feature-icon" aria-hidden="true">
                {icon}
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
              <span className="landing-feature-cta">Explorar</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
