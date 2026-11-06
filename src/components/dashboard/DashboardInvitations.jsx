import { Link } from 'react-router-dom'

import Alert from '../common/Alert.jsx'
import Badge from '../common/Badge.jsx'
import EmptyState from '../common/EmptyState.jsx'
import { formatDate } from '../profile/format.js'
import { roleLabel } from '../teams/teamDisplay.js'
import { useMyInvitations } from '../../hooks/useTeams.js'

function InvitationsSkeleton() {
  return (
    <div className="dashboard-invitations-skeleton" aria-hidden="true">
      <span className="skeleton skeleton-line" style={{ width: '80%' }} />
      <span className="skeleton skeleton-line" style={{ width: '60%' }} />
    </div>
  )
}

export default function DashboardInvitations() {
  const { invitations, loading, error, reload } = useMyInvitations('PENDING')

  return (
    <section
      className="dashboard-panel dashboard-invitations-panel"
      aria-labelledby="dashboard-invitations-title"
    >
      <div className="dashboard-panel-head">
        <h2 id="dashboard-invitations-title">Invitaciones pendientes</h2>
        <Link to="/invitations" className="dashboard-panel-link">
          Ver todas
        </Link>
      </div>

      {loading && <InvitationsSkeleton />}
      {!loading && error && (
        <div className="dashboard-inline-error">
          <Alert>{error}</Alert>
          <button type="button" className="btn btn-sm btn-ghost" onClick={reload}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && invitations.length === 0 && (
        <EmptyState message="No tenés invitaciones pendientes." />
      )}

      {!loading && !error && invitations.length > 0 && (
        <ul className="dashboard-invitations-list">
          {invitations.slice(0, 3).map((invitation) => (
            <li key={invitation.id} className="dashboard-invitation-item">
              <div className="dashboard-invitation-main">
                <Link
                  to={`/teams/${invitation.team?.id}`}
                  className="dashboard-invitation-team"
                >
                  {invitation.team?.name || 'Equipo'}
                </Link>
                <span>
                  {invitation.team?.tag ? `[${invitation.team.tag}] · ` : ''}
                  Invitación de{' '}
                  {invitation.invited_by?.display_name ||
                    invitation.invited_by?.nickname ||
                    invitation.invited_by?.username ||
                    'un miembro'}
                </span>
              </div>
              <div className="dashboard-invitation-meta">
                <Badge size="sm" variant="info">
                  {roleLabel(invitation.role)}
                </Badge>
                <span>{formatDate(invitation.created_at)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
