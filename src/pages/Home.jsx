import { useAuth } from '../context/AuthContext.jsx'
import useDashboard from '../hooks/useDashboard.js'
import DashboardContent from '../components/dashboard/DashboardContent.jsx'
import DashboardError from '../components/dashboard/DashboardError.jsx'
import DashboardExtras from '../components/dashboard/DashboardExtras.jsx'
import DashboardHeader from '../components/dashboard/DashboardHeader.jsx'
import Landing from '../components/landing/Landing.jsx'
import LoadingState from '../components/common/LoadingState.jsx'

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
