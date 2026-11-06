import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import Alert from '../components/common/Alert.jsx'
import LineupHistory from '../components/teamLineups/LineupHistory.jsx'
import LineupRecommendations from '../components/teamLineups/LineupRecommendations.jsx'
import Badge from '../components/common/Badge.jsx'
import ConfirmDialog from '../components/common/ConfirmDialog.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import LineupRosterView from '../components/teamLineups/LineupRosterView.jsx'
import TeamLineupFormModal from '../components/teamLineups/TeamLineupFormModal.jsx'
import TeamLineupRosterEditor from '../components/teamLineups/TeamLineupRosterEditor.jsx'
import { lineupStatusLabel } from '../components/teamLineups/teamLineupDisplay.js'
import { formatDate } from '../components/profile/format.js'
import { useTeam } from '../hooks/useTeams.js'
import { useTeamLineup } from '../hooks/useTeamLineups.js'
import {
  activateTeamLineup,
  deactivateTeamLineup,
  deleteTeamLineup,
  replaceTeamLineupPlayers,
  setPrimaryTeamLineup,
} from '../services/teamLineups.js'
import { getErrorMessage } from '../utils/errors.js'

function LineupBadges({ lineup }) {
  return (
    <div className="team-lineup-badges">
      <Badge variant={lineup.status === 'ACTIVE' ? 'success' : 'neutral'}>
        {lineupStatusLabel(lineup.status)}
      </Badge>
      {lineup.is_primary && <Badge variant="primary">Principal</Badge>}
      {lineup.is_complete ? (
        <Badge variant="info">Completa</Badge>
      ) : (
        <Badge variant="warning">Incompleta</Badge>
      )}
    </div>
  )
}

export default function TeamLineupDetail() {
  const { id, lineupId } = useParams()
  const navigate = useNavigate()
  const teamResource = useTeam(id)
  const lineupResource = useTeamLineup(id, lineupId)
  const { team } = teamResource
  const { lineup, limits } = lineupResource
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const loading = teamResource.loading || lineupResource.loading
  const error = teamResource.error || lineupResource.error
  const teamId = team?.id ?? id
  const currentLineupId = lineup?.id ?? lineupId
  const permissions = lineup?.permissions || {}

  function reload() {
    return Promise.all([teamResource.reload(), lineupResource.reload()])
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

  async function handleSaveRoster(payload) {
    setBusy(true)
    setActionError('')
    setFeedback('')
    try {
      await replaceTeamLineupPlayers(teamId, currentLineupId, payload)
      setFeedback('Alineación actualizada.')
      await reload()
    } catch (err) {
      setActionError(
        getErrorMessage(
          err,
          'No pudimos guardar la alineación. Intentalo de nuevo.',
        ),
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    setActionError('')
    setFeedback('')
    try {
      await deleteTeamLineup(teamId, currentLineupId)
      setConfirmDelete(false)
      navigate(`/teams/${teamId}/lineups`)
    } catch (err) {
      setConfirmDelete(false)
      setActionError(
        getErrorMessage(
          err,
          'No pudimos eliminar la alineación. Intentalo de nuevo.',
        ),
      )
      setBusy(false)
    }
  }

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
          <section className="team-panel team-lineup-hero">
            <div className="team-lineup-hero-head">
              <div>
                <p className="page-eyebrow">Alineación competitiva</p>
                <h1>{lineup.name}</h1>
                <p>{lineup.map_name || 'Alineación general'}</p>
                <LineupBadges lineup={lineup} />
              </div>
              <div className="team-lineup-hero-actions">
                {permissions.can_edit && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={busy}
                    onClick={() => setEditing(true)}
                  >
                    Editar datos
                  </button>
                )}
                {permissions.can_activate && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={busy}
                    onClick={() =>
                      runAction(
                        () => activateTeamLineup(teamId, currentLineupId),
                        'Alineación activada.',
                      )
                    }
                  >
                    Activar
                  </button>
                )}
                {permissions.can_deactivate && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={busy}
                    onClick={() =>
                      runAction(
                        () => deactivateTeamLineup(teamId, currentLineupId),
                        'Alineación desactivada.',
                      )
                    }
                  >
                    Desactivar
                  </button>
                )}
                {permissions.can_set_primary && !lineup.is_primary && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={busy}
                    onClick={() =>
                      runAction(
                        () => setPrimaryTeamLineup(teamId, currentLineupId),
                        'Alineación marcada como principal.',
                      )
                    }
                  >
                    Hacer principal
                  </button>
                )}
                {permissions.can_delete && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={busy}
                    onClick={() => setConfirmDelete(true)}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>

            {lineup.description && (
              <p className="team-description">{lineup.description}</p>
            )}

            <p className="team-lineup-meta">
              {team?.name && <span>{team.name}</span>}
              <span>
                {lineup.starters_count}/{limits?.starters ?? 5} titulares
              </span>
              <span>
                {lineup.substitutes_count}/{limits?.substitutes ?? 5} suplentes
              </span>
              <span>Actualizada el {formatDate(lineup.updated_at)}</span>
            </p>

            {lineup.status === 'ACTIVE' && !lineup.is_complete && (
              <Alert variant="warning">
                Esta alineación está activa pero no tiene cinco titulares.
              </Alert>
            )}
          </section>

          <Alert>{actionError}</Alert>
          {lineup.notes && <section className="team-panel"><h2>Notas tácticas</h2><p>{lineup.notes}</p></section>}
          <LineupHistory teamId={teamId} lineupId={currentLineupId} updatedAt={lineup.updated_at} />
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
