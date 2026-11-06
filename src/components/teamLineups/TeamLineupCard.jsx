import { Link } from 'react-router-dom'

import Badge from '../common/Badge.jsx'
import { formatDate } from '../profile/format.js'
import LineupRosterView from './LineupRosterView.jsx'
import { lineupStatusLabel } from './teamLineupDisplay.js'

function LineupBadges({ lineup }) {
  return (
    <div className="team-lineup-badges">
      <Badge
        size="sm"
        variant={lineup.status === 'ACTIVE' ? 'success' : 'neutral'}
      >
        {lineupStatusLabel(lineup.status)}
      </Badge>
      {lineup.is_primary && (
        <Badge size="sm" variant="primary">
          Principal
        </Badge>
      )}
    </div>
  )
}

export default function TeamLineupCard({
  teamId,
  lineup,
  busy,
  onActivate,
  onDeactivate,
  onPrimary,
  onDelete,
}) {
  const permissions = lineup.permissions || {}
  const detailPath = `/teams/${teamId}/lineups/${lineup.id}`

  return (
    <article className="team-lineup-card">
      <div className="team-lineup-card-head">
        <div>
          <h3 className="team-lineup-title">
            <Link to={detailPath}>{lineup.name}</Link>
          </h3>
          <LineupBadges lineup={lineup} />
          <p>{lineup.map_name || 'General · todos los mapas'}</p>
        </div>
        <span className="team-lineup-count">
          {lineup.starters_count}/5 titulares
        </span>
      </div>

      {lineup.description && (
        <p className="team-lineup-description">{lineup.description}</p>
      )}

      <LineupRosterView lineup={lineup} variant="compact" />

      <p className="team-lineup-meta">
        {lineup.substitutes_count}{' '}
        {lineup.substitutes_count === 1 ? 'suplente' : 'suplentes'} · Actualizada
        el {formatDate(lineup.updated_at)}
      </p>

      <div className="team-lineup-card-actions">
        <Link to={detailPath} className="btn btn-sm btn-ghost">
          Ver detalle
        </Link>
        {permissions.can_activate && (
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            disabled={busy}
            onClick={() => onActivate(lineup)}
          >
            Activar
          </button>
        )}
        {permissions.can_deactivate && (
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            disabled={busy}
            onClick={() => onDeactivate(lineup)}
          >
            Desactivar
          </button>
        )}
        {permissions.can_set_primary && !lineup.is_primary && (
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            disabled={busy}
            onClick={() => onPrimary(lineup)}
          >
            Hacer principal
          </button>
        )}
        {permissions.can_delete && (
          <button
            type="button"
            className="btn btn-sm btn-danger"
            disabled={busy}
            onClick={() => onDelete(lineup)}
          >
            Eliminar
          </button>
        )}
      </div>
    </article>
  )
}
