import { Link, useParams } from 'react-router-dom'

import Alert from '../components/common/Alert.jsx'
import LineupComparison from '../components/teamLineups/LineupComparison.jsx'
import LineupHistory from '../components/teamLineups/LineupHistory.jsx'
import ConfirmDialog from '../components/common/ConfirmDialog.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import TeamLineupFormModal from '../components/teamLineups/TeamLineupFormModal.jsx'
import TeamLineupsGrid from '../components/teamLineups/TeamLineupsGrid.jsx'
import TeamLineupsSummary from '../components/teamLineups/TeamLineupsSummary.jsx'
import { useTeam } from '../hooks/useTeams.js'
import { useTeamLineups } from '../hooks/useTeamLineups.js'
import useTeamLineupListActions from '../hooks/useTeamLineupListActions.js'

export default function TeamLineups() {
  const { id } = useParams()
  const teamResource = useTeam(id)
  const lineupsResource = useTeamLineups(id)
  const { team } = teamResource
  const { lineups, limits } = lineupsResource

  const teamId = team?.id ?? id
  const canManage = Boolean(team?.permissions?.can_manage_lineups)
  const loading = teamResource.loading || lineupsResource.loading
  const error = teamResource.error || lineupsResource.error

  function reload() {
    return Promise.all([teamResource.reload(), lineupsResource.reload()])
  }

  const {
    creating,
    setCreating,
    busy,
    actionError,
    feedback,
    pendingDelete,
    setPendingDelete,
    handleDelete,
    handleCreated,
    activate,
    deactivate,
    makePrimary,
  } = useTeamLineupListActions({ teamId, reload })

  return (
    <div className="page container">
      <Link to={`/teams/${teamId}`} className="team-back-link">
        ← Volver al equipo
      </Link>

      <PageHeader
        eyebrow="Roster competitivo"
        title="Alineaciones"
        subtitle={
          team
            ? `Alineaciones competitivas de ${team.name}.`
            : 'Alineaciones competitivas del equipo.'
        }
        actions={
          <div className="team-header-actions">
            <Link to={`/teams/${teamId}`} className="btn btn-ghost">
              Ver equipo
            </Link>
            {canManage && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCreating(true)}
              >
                Nueva alineación
              </button>
            )}
          </div>
        }
      />

      <Alert>{actionError}</Alert>
      <Alert variant="success">{feedback}</Alert>

      {!loading && !error && lineups.length > 0 && (
        <TeamLineupsSummary lineups={lineups} />
      )}

      {loading && (
        <LoadingState
          label="Cargando alineaciones…"
          detail="Estamos preparando el roster competitivo."
          cards={2}
        />
      )}
      {!loading && error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && lineups.length === 0 && (
        <EmptyState
          title="Sin alineaciones"
          message="Este equipo todavía no tiene alineaciones."
          actionLabel={canManage ? 'Crear la primera alineación' : undefined}
          onAction={canManage ? () => setCreating(true) : undefined}
        />
      )}

      {!loading && !error && lineups.length > 0 && (
        <TeamLineupsGrid
          teamId={teamId}
          lineups={lineups}
          busy={busy}
          onActivate={activate}
          onDeactivate={deactivate}
          onPrimary={makePrimary}
          onDelete={setPendingDelete}
        />
      )}

      <TeamLineupFormModal
        open={creating}
        teamId={teamId}
        onClose={() => setCreating(false)}
        onSaved={handleCreated}
      />

      {!loading && !error && (
        <>
          <LineupComparison teamId={teamId} lineups={lineups} />
          <LineupHistory
            teamId={teamId}
            updatedAt={lineups.map((lineup) => lineup.updated_at).join(',')}
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Eliminar alineación"
        message={
          pendingDelete
            ? `¿Seguro que querés eliminar la alineación «${pendingDelete.name}»? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        busy={busy}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />

      {limits && lineups.length > 0 && (
        <p className="text-muted team-lineup-limits">
          Cada alineación admite {limits.starters} titulares y{' '}
          {limits.substitutes} suplentes.
        </p>
      )}
    </div>
  )
}
