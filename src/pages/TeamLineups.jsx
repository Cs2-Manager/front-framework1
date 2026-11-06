import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import Alert from '../components/common/Alert.jsx'
import LineupComparison from '../components/teamLineups/LineupComparison.jsx'
import LineupHistory from '../components/teamLineups/LineupHistory.jsx'
import ConfirmDialog from '../components/common/ConfirmDialog.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import TeamLineupCard from '../components/teamLineups/TeamLineupCard.jsx'
import TeamLineupFormModal from '../components/teamLineups/TeamLineupFormModal.jsx'
import { useTeam } from '../hooks/useTeams.js'
import { useTeamLineups } from '../hooks/useTeamLineups.js'
import {
  activateTeamLineup,
  deactivateTeamLineup,
  deleteTeamLineup,
  setPrimaryTeamLineup,
} from '../services/teamLineups.js'
import { getErrorMessage } from '../utils/errors.js'

export default function TeamLineups() {
  const { id } = useParams()
  const navigate = useNavigate()
  const teamResource = useTeam(id)
  const lineupsResource = useTeamLineups(id)
  const { team } = teamResource
  const { lineups, limits } = lineupsResource
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)

  const teamId = team?.id ?? id
  const canManage = Boolean(team?.permissions?.can_manage_lineups)
  const loading = teamResource.loading || lineupsResource.loading
  const error = teamResource.error || lineupsResource.error

  function reload() {
    return Promise.all([teamResource.reload(), lineupsResource.reload()])
  }

  async function runAction(action, successMessage) {
    setBusy(true)
    setActionError('')
    setFeedback('')
    try {
      await action()
      setFeedback(successMessage)
      await reload()
    } catch (err) {
      setActionError(
        getErrorMessage(
          err,
          'No pudimos completar la acción. Intentalo de nuevo.',
        ),
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return
    setBusy(true)
    setActionError('')
    setFeedback('')
    try {
      await deleteTeamLineup(teamId, pendingDelete.id)
      setPendingDelete(null)
      setFeedback('Alineación eliminada.')
      await reload()
    } catch (err) {
      setPendingDelete(null)
      setActionError(
        getErrorMessage(
          err,
          'No pudimos eliminar la alineación. Intentalo de nuevo.',
        ),
      )
    } finally {
      setBusy(false)
    }
  }

  function handleCreated(lineup) {
    setCreating(false)
    if (lineup?.id) {
      navigate(`/teams/${teamId}/lineups/${lineup.id}`)
      return
    }
    reload()
  }

  const activeCount = lineups.filter((lineup) => lineup.status === 'ACTIVE').length
  const primary = lineups.find((lineup) => lineup.is_primary)

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
        <div className="lineups-summary" aria-label="Resumen de alineaciones">
          <span>
            <strong>{lineups.length}</strong>{' '}
            {lineups.length === 1 ? 'alineación' : 'alineaciones'}
          </span>
          <span>
            <strong>{activeCount}</strong>{' '}
            {activeCount === 1 ? 'activa' : 'activas'}
          </span>
          <span>
            Principal: <strong>{primary?.name || 'Sin asignar'}</strong>
          </span>
        </div>
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
        <div className="team-lineups-grid">
          {lineups.map((lineup) => (
            <TeamLineupCard
              key={lineup.id}
              teamId={teamId}
              lineup={lineup}
              busy={busy}
              onActivate={(item) =>
                runAction(
                  () => activateTeamLineup(teamId, item.id),
                  'Alineación activada.',
                )
              }
              onDeactivate={(item) =>
                runAction(
                  () => deactivateTeamLineup(teamId, item.id),
                  'Alineación desactivada.',
                )
              }
              onPrimary={(item) =>
                runAction(
                  () => setPrimaryTeamLineup(teamId, item.id),
                  'Alineación marcada como principal.',
                )
              }
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      )}

      <TeamLineupFormModal
        open={creating}
        teamId={teamId}
        onClose={() => setCreating(false)}
        onSaved={handleCreated}
      />
      {!loading && !error && <><LineupComparison teamId={teamId} lineups={lineups} /><LineupHistory teamId={teamId} updatedAt={lineups.map(l => l.updated_at).join(',')} /></>}

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
