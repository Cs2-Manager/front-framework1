import { Link } from 'react-router-dom'

import Badge from '../common/Badge.jsx'
import { formatDate } from '../profile/format.js'
import TeamLogo from './TeamLogo.jsx'
import { TEAM_VISIBILITY_LABELS, memberName } from './teamDisplay.js'

export default function TeamCard({ team }) {
  return (
    <Link to={`/teams/${team.id}`} className="team-card">
      <div className="team-card-top">
        <TeamLogo team={team} />
        <Badge
          size="sm"
          variant={team.visibility === 'PUBLIC' ? 'success' : 'neutral'}
        >
          {TEAM_VISIBILITY_LABELS[team.visibility] || team.visibility}
        </Badge>
      </div>
      <div className="team-card-body">
        <div className="team-card-title">
          <strong>{team.name}</strong>
          {team.tag && <span className="team-tag">[{team.tag}]</span>}
        </div>
        <p className="team-card-meta">
          {team.country && <span>{team.country}</span>}
          <span>
            {team.member_count}{' '}
            {team.member_count === 1 ? 'integrante' : 'integrantes'}
          </span>
        </p>
        <p className="team-card-captain">
          Capitán: {team.captain ? memberName(team.captain) : 'Sin capitán'}
        </p>
        <p className="team-card-date">Creado el {formatDate(team.created_at)}</p>
      </div>
      <span className="team-card-arrow" aria-hidden="true">
        →
      </span>
    </Link>
  )
}
