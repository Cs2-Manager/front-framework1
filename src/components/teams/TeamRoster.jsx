import { Link } from 'react-router-dom'

import Badge from '../common/Badge.jsx'
import { formatDate } from '../profile/format.js'
import PlayerAvatar from '../profile/PlayerAvatar.jsx'
import { canManageMember, memberName, roleLabel } from './teamDisplay.js'

function roleVariant(role) {
  if (role === 'CAPTAIN') return 'primary'
  if (role === 'COACH') return 'info'
  return 'neutral'
}

function MemberActions({
  team,
  member,
  viewerId,
  busy,
  onRemove,
  onChangeRole,
  onTransfer,
}) {
  if (!canManageMember(team, member, viewerId)) return null

  const nextRole = member.role === 'COACH' ? 'PLAYER' : 'COACH'
  const nextLabel =
    member.role === 'COACH' ? 'Hacer jugador' : 'Hacer entrenador'

  return (
    <div className="team-member-actions">
      <button
        type="button"
        className="btn btn-sm btn-ghost"
        disabled={busy}
        onClick={() => onChangeRole(member, nextRole)}
      >
        {nextLabel}
      </button>
      {team.permissions?.can_transfer_captain && (
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          disabled={busy}
          onClick={() => onTransfer(member)}
        >
          Transferir capitanía
        </button>
      )}
      <button
        type="button"
        className="btn btn-sm btn-danger"
        disabled={busy}
        onClick={() => onRemove(member)}
      >
        Expulsar
      </button>
    </div>
  )
}

export default function TeamRoster({
  team,
  viewerId,
  busy = false,
  onRemove,
  onChangeRole,
  onTransfer,
}) {
  return (
    <section className="team-panel" aria-labelledby="team-roster-title">
      <div className="team-panel-head">
        <h2 id="team-roster-title">Integrantes</h2>
        <span className="team-panel-count">{team.member_count}</span>
      </div>

      {team.members.length === 0 ? (
        <p className="text-muted">Este equipo todavía no tiene integrantes.</p>
      ) : (
        <ul className="team-member-list">
          {team.members.map((member) => (
            <li key={member.id} className="team-member-row">
              <div className="team-member-main">
                <PlayerAvatar profile={member.user} size="sm" />
                <div className="team-member-identity">
                  <strong>{memberName(member)}</strong>
                  <span className="team-member-username">
                    @{member.user?.username}
                  </span>
                </div>
              </div>
              <div className="team-member-meta">
                <Badge size="sm" variant={roleVariant(member.role)}>
                  {roleLabel(member.role)}
                </Badge>
                <span className="team-member-date">
                  Desde {formatDate(member.joined_at)}
                </span>
                <Link
                  to={`/players/${member.user?.id}`}
                  className="team-member-link"
                >
                  Ver perfil
                </Link>
              </div>
              <MemberActions
                team={team}
                member={member}
                viewerId={viewerId}
                busy={busy}
                onRemove={onRemove}
                onChangeRole={onChangeRole}
                onTransfer={onTransfer}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
