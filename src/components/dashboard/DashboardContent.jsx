import ActivePool from './ActivePool.jsx'
import DashboardEmpty from './DashboardEmpty.jsx'
import DashboardStats from './DashboardStats.jsx'
import QuickAccess from './QuickAccess.jsx'
import RecentLineups from './RecentLineups.jsx'

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

/** Contenido del dashboard autenticado, con estado vacío si no hay datos. */
export default function DashboardContent({ dashboard }) {
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
