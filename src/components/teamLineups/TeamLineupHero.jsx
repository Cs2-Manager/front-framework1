import Alert from '../common/Alert.jsx'
import LineupBadges from '../teamLineups/LineupBadges.jsx'
import { formatDate } from '../profile/format.js'
import {
  activateTeamLineup,
  deactivateTeamLineup,
  setPrimaryTeamLineup,
} from '../../services/teamLineups.js'

function HeroActions({
  permissions,
  lineup,
  busy,
  teamId,
  lineupId,
  runAction,
  onEdit,
  onDelete,
}) {
  return (
    <div className="team-lineup-hero-actions">
      {permissions.can_edit && (
        <button
          type="button"
          className="btn btn-ghost"
          disabled={busy}
          onClick={onEdit}
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
              () => activateTeamLineup(teamId, lineupId),
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
              () => deactivateTeamLineup(teamId, lineupId),
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
              () => setPrimaryTeamLineup(teamId, lineupId),
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
          onClick={onDelete}
        >
          Eliminar
        </button>
      )}
    </div>
  )
}

/**
 * Cabecera de la alineación: identidad, acciones permitidas, descripción,
 * contadores del roster y aviso de alineación activa incompleta.
 */
export default function TeamLineupHero({
  team,
  lineup,
  limits,
  busy,
  teamId,
  lineupId,
  runAction,
  onEdit,
  onDelete,
}) {
  const permissions = lineup.permissions || {}

  return (
    <section className="team-panel team-lineup-hero">
      <div className="team-lineup-hero-head">
        <div>
          <p className="page-eyebrow">Alineación competitiva</p>
          <h1>{lineup.name}</h1>
          <p>{lineup.map_name || 'Alineación general'}</p>
          <LineupBadges lineup={lineup} />
        </div>
        <HeroActions
          permissions={permissions}
          lineup={lineup}
          busy={busy}
          teamId={teamId}
          lineupId={lineupId}
          runAction={runAction}
          onEdit={onEdit}
          onDelete={onDelete}
        />
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
  )
}
