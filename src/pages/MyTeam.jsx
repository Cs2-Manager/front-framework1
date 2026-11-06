import { Link } from 'react-router-dom'

import Badge from '../components/common/Badge.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import TeamLogo from '../components/teams/TeamLogo.jsx'
import { roleLabel } from '../components/teams/teamDisplay.js'
import { useMyTeam } from '../hooks/useTeams.js'

function MyTeamEmpty() {
  return (
    <section className="empty-state my-team-empty">
      <span className="empty-state-icon" aria-hidden="true">
        <TeamLogo team={{ name: 'CS' }} size="md" />
      </span>
      <h3 className="empty-state-title">Todavía no tenés un equipo</h3>
      <p>
        Cuando crees un equipo o aceptes una invitación, tu equipo activo va a
        aparecer acá con su roster y sus alineaciones.
      </p>
      <div className="empty-state-actions">
        <Link to="/teams/new" className="btn btn-primary">
          Crear equipo
        </Link>
        <Link to="/teams" className="btn btn-ghost">
          Explorar equipos
        </Link>
      </div>
    </section>
  )
}

function MyTeamCard({ team }) {
  return (
    <section className="my-team-card" aria-labelledby="my-team-title">
      <div className="my-team-head">
        <TeamLogo team={team} size="lg" />
        <div className="my-team-identity">
          <div className="my-team-title-row">
            <h2 id="my-team-title">{team.name}</h2>
            {team.tag && <span className="team-tag">[{team.tag}]</span>}
            {team.my_role && (
              <Badge variant="primary">{roleLabel(team.my_role)}</Badge>
            )}
          </div>
          <p className="my-team-meta">
            {team.country && <span>{team.country}</span>}
            <span>
              {team.member_count}{' '}
              {team.member_count === 1 ? 'integrante' : 'integrantes'}
            </span>
            {team.visibility && (
              <span>
                {team.visibility === 'PUBLIC'
                  ? 'Equipo público'
                  : 'Equipo privado'}
              </span>
            )}
          </p>
          {team.description && (
            <p className="my-team-description">{team.description}</p>
          )}
        </div>
      </div>

      <div className="my-team-actions">
        <Link to={`/teams/${team.id}`} className="btn btn-primary">
          Ver equipo
        </Link>
        {team.permissions?.can_view_lineups && (
          <Link to={`/teams/${team.id}/lineups`} className="btn btn-ghost">
            Alineaciones
          </Link>
        )}
        {team.permissions?.can_edit && (
          <Link to={`/teams/${team.id}/edit`} className="btn btn-ghost">
            Editar equipo
          </Link>
        )}
        <Link to="/teams" className="btn btn-ghost">
          Directorio de equipos
        </Link>
      </div>
    </section>
  )
}

export default function MyTeam() {
  const { team, loading, error, reload } = useMyTeam()

  return (
    <div className="page container">
      <PageHeader
        eyebrow="Tu equipo activo"
        title="Mi equipo"
        subtitle="Roster, permisos y acceso directo a tus alineaciones."
        actions={
          <Link to="/teams" className="btn btn-ghost">
            Ver equipos
          </Link>
        }
      />

      {loading && (
        <LoadingState
          label="Cargando tu equipo…"
          detail="Estamos buscando tu equipo activo."
          cards={2}
        />
      )}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && !team && <MyTeamEmpty />}
      {!loading && !error && team && <MyTeamCard team={team} />}
    </div>
  )
}
