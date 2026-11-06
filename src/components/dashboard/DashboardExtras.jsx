import DashboardProfileSummary from './DashboardProfileSummary.jsx'
import DashboardTeamPanel from './DashboardTeamPanel.jsx'
import DashboardInvitations from './DashboardInvitations.jsx'

/**
 * Resumen personal del jugador autenticado. Solo se monta con sesión real
 * para no lanzar peticiones privadas en contextos sin autenticación.
 */
export default function DashboardExtras() {
  return (
    <div className="dashboard-personal">
      <div className="dashboard-personal-main">
        <DashboardProfileSummary />
        <DashboardTeamPanel />
      </div>
      <DashboardInvitations />
    </div>
  )
}
