import { Link } from 'react-router-dom'

import Badge from '../common/Badge.jsx'
import { formatDate } from '../profile/format.js'
import TeamLogo from './TeamLogo.jsx'
import {
  TEAM_VISIBILITY_LABELS,
  memberName,
  roleLabel,
} from './teamDisplay.js'

function VisibilityBadge({ visibility }) {
  const isPublic = visibility === 'PUBLIC'
  return (
    <Badge variant={isPublic ? 'success' : 'neutral'}>
      {TEAM_VISIBILITY_LABELS[visibility] || visibility}
    </Badge>
  )
}

function TeamHeaderActions({ team, onLeave }) {
  const canViewLineups = team.permissions?.can_view_lineups ?? true

  return (
    <div className="team-header-actions">
      {canViewLineups && (
        <Link to={`/teams/${team.id}/lineups`} className="btn btn-ghost">
          Alineaciones
        </Link>
      )}
      {team.permissions?.can_edit && (
        <Link to={`/teams/${team.id}/edit`} className="btn btn-primary">
          Editar equipo
        </Link>
      )}
      {team.permissions?.can_leave && (
        <button type="button" className="btn btn-ghost" onClick={onLeave}>
          Abandonar equipo
        </button>
      )}
    </div>
  )
}

export default function TeamHeader({ team, onLeave }) {
  return (
    <section className="team-hero">
      <div className="team-hero-glow" aria-hidden="true" />
      <TeamLogo team={team} size="lg" />
      <div className="team-hero-body">
        <div className="team-title-row">
          <h1>{team.name}</h1>
          {team.tag && <span className="team-tag">[{team.tag}]</span>}
          <VisibilityBadge visibility={team.visibility} />
        </div>
        <p className="team-meta">
          {team.country && <span>{team.country}</span>}
          <span>
            {team.member_count}{' '}
            {team.member_count === 1 ? 'integrante' : 'integrantes'}
          </span>
          <span>Creado el {formatDate(team.created_at)}</span>
          <span>
            Capitán: {team.captain ? memberName(team.captain) : 'Sin capitán'}
          </span>
        </p>
        {team.description && (
          <p className="team-description">{team.description}</p>
        )}
        {team.my_role && (
          <p className="team-my-role">
            Tu rol: {roleLabel(team.my_role)}
          </p>
        )}
        <TeamHeaderActions team={team} onLeave={onLeave} />
      </div>
    </section>
  )
}
