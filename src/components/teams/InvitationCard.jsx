import { Link } from 'react-router-dom'

import Badge from '../common/Badge.jsx'
import { formatDate } from '../profile/format.js'
import TeamLogo from './TeamLogo.jsx'
import { memberName, roleLabel, statusLabel } from './teamDisplay.js'

function statusVariant(status) {
  if (status === 'PENDING') return 'warning'
  if (status === 'ACCEPTED') return 'success'
  if (status === 'REJECTED') return 'danger'
  return 'neutral'
}

export default function InvitationCard({
  invitation,
  busy,
  onAccept,
  onReject,
}) {
  const pending = invitation.status === 'PENDING'
  const team = invitation.team

  return (
    <article className={`invitation-card ${pending ? 'pending' : ''}`}>
      <div className="invitation-card-top">
        <TeamLogo team={team} size="md" />
        <div className="invitation-card-body">
          <div className="invitation-card-title">
            <Link to={`/teams/${team?.id}`} className="invitation-team-link">
              {team?.name || 'Equipo'}
            </Link>
            {team?.tag && <span className="team-tag">[{team.tag}]</span>}
            <Badge size="sm" variant={statusVariant(invitation.status)}>
              {statusLabel(invitation.status)}
            </Badge>
          </div>
          <p className="invitation-meta">
            Rol ofrecido: {roleLabel(invitation.role)}
            {team?.country && ` · ${team.country}`}
          </p>
          <p className="invitation-meta">
            Invitación de {memberName(invitation.invited_by)} ·{' '}
            {formatDate(invitation.created_at)}
          </p>
          {invitation.responded_at && (
            <p className="invitation-meta">
              Respondida el {formatDate(invitation.responded_at)}
            </p>
          )}
        </div>
      </div>

      {pending && (
        <div className="invitation-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy}
            onClick={() => onAccept(invitation)}
          >
            Aceptar
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy}
            onClick={() => onReject(invitation)}
          >
            Rechazar
          </button>
        </div>
      )}
    </article>
  )
}
