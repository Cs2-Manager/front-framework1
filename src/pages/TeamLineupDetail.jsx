import { Link, useNavigate, useParams } from 'react-router-dom'

import Alert from '../components/common/Alert.jsx'
import LineupHistory from '../components/teamLineups/LineupHistory.jsx'
import LineupRecommendations from '../components/teamLineups/LineupRecommendations.jsx'
import ConfirmDialog from '../components/common/ConfirmDialog.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import LineupRosterView from '../components/teamLineups/LineupRosterView.jsx'
import TeamLineupFormModal from '../components/teamLineups/TeamLineupFormModal.jsx'
import TeamLineupHero from '../components/teamLineups/TeamLineupHero.jsx'
import TeamLineupRosterEditor from '../components/teamLineups/TeamLineupRosterEditor.jsx'
import { useTeam } from '../hooks/useTeams.js'
import { useTeamLineup } from '../hooks/useTeamLineups.js'
import useTeamLineupActions from '../hooks/useTeamLineupActions.js'

export default function TeamLineupDetail() {
  const { id, lineupId } = useParams()
  const teamResource = useTeam(id)
  const lineupResource = useTeamLineup(id, lineupId)
  const { team } = teamResource
  const { lineup, limits } = lineupResource

  const loading = teamResource.loading || lineupResource.loading
  const error = teamResource.error || lineupResource.error
  const teamId = team?.id ?? id
  const currentLineupId = lineup?.id ?? lineupId

  function reload() {
    return Promise.all([teamResource.reload(), lineupResource.reload()])
  }

  const {
    busy,
    actionError,
    feedback,
    editing,
    setEditing,
    confirmDelete,
    setConfirmDelete,
    runAction,
    handleSaveRoster,
    handleDelete,
  } = useTeamLineupActions({
    teamId,
    lineupId: currentLineupId,
    reload,
  })

  return (
    <div className="page container">
      <Link to={`/teams/${teamId}/lineups`} className="team-back-link">
        ← Volver a alineaciones
      </Link>

      {loading && (
        <LoadingState
          label="Cargando alineación…"
          detail="Estamos preparando el roster."
          cards={2}
        />
      )}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && lineup && (
        <>
          <TeamLineupHero
            team={team}
            lineup={lineup}
            limits={limits}
            busy={busy}
            teamId={teamId}
            lineupId={currentLineupId}
            runAction={runAction}
            onEdit={() => setEditing(true)}
            onDelete={() => setConfirmDelete(true)}
          />

          <Alert>{actionError}</Alert>
          {lineup.notes && (
            <section className="team-panel">
              <h2>Notas tácticas</h2>
              <p>{lineup.notes}</p>
            </section>
          )}
          <LineupHistory
            teamId={teamId}
            lineupId={currentLineupId}
            updatedAt={lineup.updated_at}
          />
          <LineupRecommendations team={team} lineup={lineup} />
          <Alert variant="success">{feedback}</Alert>

          <section className="team-panel lineup-overview">
            <div className="team-panel-head">
              <h2>Vista del roster</h2>
              <Link to={`/teams/${teamId}`} className="dashboard-panel-link">
                Ver equipo
              </Link>
            </div>
            <LineupRosterView lineup={lineup} />
          </section>

          <TeamLineupRosterEditor
            team={team}
            lineup={lineup}
            busy={busy}
            onSave={handleSaveRoster}
          />

          <TeamLineupFormModal
            open={editing}
            teamId={teamId}
            lineup={lineup}
            onClose={() => setEditing(false)}
            onSaved={reload}
          />

          <ConfirmDialog
            open={confirmDelete}
            title="Eliminar alineación"
            message={`¿Seguro que querés eliminar la alineación «${lineup.name}»? Esta acción no se puede deshacer.`}
            confirmLabel="Eliminar"
            busy={busy}
            onCancel={() => setConfirmDelete(false)}
            onConfirm={handleDelete}
          />
        </>
      )}
    </div>
  )
}
