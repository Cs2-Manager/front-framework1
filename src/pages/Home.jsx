import { Link } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'
import useDashboard from '../hooks/useDashboard.js'
import DashboardHeader from '../components/dashboard/DashboardHeader.jsx'
import DashboardStats from '../components/dashboard/DashboardStats.jsx'
import QuickAccess from '../components/dashboard/QuickAccess.jsx'
import ActivePool from '../components/dashboard/ActivePool.jsx'
import RecentLineups from '../components/dashboard/RecentLineups.jsx'
import DashboardEmpty from '../components/dashboard/DashboardEmpty.jsx'
import DashboardError from '../components/dashboard/DashboardError.jsx'
import DashboardExtras from '../components/dashboard/DashboardExtras.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import { LineupIcon, MapIcon, WorkshopIcon } from '../components/dashboard/icons.jsx'
import { UsersIcon } from '../components/profile/icons.jsx'

function hasContent({ summary }) {
  // El contrato de /api/dashboard siempre incluye `summary`, pero un payload
  // malformado (proxy intermedio, middleware de error) no debe tumbar la
  // página: sin contenido se muestra el estado vacío.
  return (
    (summary?.maps?.total ?? 0) > 0 ||
    (summary?.lineups?.total ?? 0) > 0 ||
    (summary?.workshop_maps?.total ?? 0) > 0
  )
}

function DashboardContent({ dashboard }) {
  if (!hasContent(dashboard)) {
    return (
      <>
        <DashboardEmpty />
        <QuickAccess />
      </>
    )
  }

  return (
    <>
      <DashboardStats summary={dashboard.summary} />
      <QuickAccess />
      <div className="dashboard-columns">
        <ActivePool maps={dashboard.active_maps} />
        <RecentLineups
          lineups={dashboard.recent_lineups}
          byType={dashboard.summary.lineups.by_type}
        />
      </div>
    </>
  )
}

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

function Landing() {
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

      <section className="landing-features" aria-labelledby="landing-features-title">
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

export default function Home() {
  const { user, isAuthenticated } = useAuth()
  // En la app real `isAuthenticated` siempre es booleano. Tratamos como
  // invitado únicamente al valor explícito `false` para no romper contextos
  // de prueba que solo declaran `user` (o ninguno de los dos campos).
  const isGuest = isAuthenticated === false && !user
  const { data, loading, error, reload } = useDashboard({ enabled: !isGuest })

  if (isGuest) {
    return <Landing />
  }

  return (
    <div className="page container dashboard">
      <DashboardHeader user={user} />

      {isAuthenticated === true && <DashboardExtras />}

      {loading && (
        <LoadingState
          label="Cargando tu dashboard…"
          detail="Estamos preparando tu biblioteca."
          cards={4}
        />
      )}
      {!loading && error && <DashboardError message={error} onRetry={reload} />}
      {!loading && !error && data && <DashboardContent dashboard={data} />}
    </div>
  )
}
