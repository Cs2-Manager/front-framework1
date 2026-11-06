import { Link, useNavigate } from 'react-router-dom'

import Alert from '../common/Alert.jsx'
import Badge from '../common/Badge.jsx'
import EmptyState from '../common/EmptyState.jsx'
import TeamLogo from '../teams/TeamLogo.jsx'
import { roleLabel } from '../teams/teamDisplay.js'
import { useMyTeam } from '../../hooks/useTeams.js'

function TeamSkeleton() {
  return (
    <div className="dashboard-team-skeleton" aria-hidden="true">
      <span className="skeleton skeleton-logo" />
      <span className="dashboard-profile-skeleton-copy">
        <span className="skeleton skeleton-line" style={{ width: '50%' }} />
        <span className="skeleton skeleton-line" style={{ width: '75%' }} />
      </span>
    </div>
  )
}

export default function DashboardTeamPanel() {
  const navigate = useNavigate()
  const { team, loading, error, reload } = useMyTeam()

  return (
    <section
      className="dashboard-panel dashboard-team-panel"
      aria-labelledby="dashboard-team-title"
    >
      <div className="dashboard-panel-head">
        <h2 id="dashboard-team-title">Mi equipo</h2>
        {team && (
          <Link to={`/teams/${team.id}`} className="dashboard-panel-link">
            Ver equipo
          </Link>
        )}
      </div>

      {loading && <TeamSkeleton />}
      {!loading && error && (
        <div className="dashboard-inline-error">
          <Alert>{error}</Alert>
          <button type="button" className="btn btn-sm btn-ghost" onClick={reload}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && !team && (
        <EmptyState
          title="Sin equipo activo"
          message="Todavía no perteneces a un equipo. Podés crear uno o explorar el directorio."
          actionLabel="Explorar equipos"
          onAction={() => navigate('/teams')}
        />
      )}

      {!loading && !error && team && (
        <>
          <div className="dashboard-team-head">
            <TeamLogo team={team} size="md" />
            <div className="dashboard-team-identity">
              <strong>
                {team.name}
                {team.tag && <span className="team-tag">[{team.tag}]</span>}
              </strong>
              <span>
                {team.member_count}{' '}
                {team.member_count === 1 ? 'integrante' : 'integrantes'}
              </span>
              {team.my_role && (
                <Badge size="sm" variant="primary">
                  {roleLabel(team.my_role)}
                </Badge>
              )}
            </div>
          </div>

          <div className="dashboard-team-actions">
            <Link to={`/teams/${team.id}`} className="btn btn-sm btn-ghost">
              Ver equipo
            </Link>
            {team.permissions?.can_view_lineups && (
              <Link
                to={`/teams/${team.id}/lineups`}
                className="btn btn-sm btn-ghost"
              >
                Alineaciones
              </Link>
            )}
            {team.permissions?.can_edit && (
              <Link
                to={`/teams/${team.id}/edit`}
                className="btn btn-sm btn-primary"
              >
                Editar equipo
              </Link>
            )}
          </div>
        </>
      )}
    </section>
  )
}
