import Badge from '../common/Badge.jsx'
import { formatDateTime } from '../profile/format.js'
import {
  MATCHMAKING_ERRORS,
  NO_AUTHORIZATION_MESSAGE,
  SECTION_STATUS_LABELS,
  SECTION_STATUS_VARIANTS,
} from './matchmakingMessages.js'

export function SectionHeader({ section }) {
  const status = section.status || 'UNAVAILABLE'
  return (
    <div className="player-panel-head mm-head">
      <div>
        <h2>CS2 Matchmaking</h2>
        <p className="mm-section-sub">
          Estadísticas calculadas desde demos oficiales. Sección independiente
          de FACEIT y de los datos de Steam.
        </p>
      </div>
      <div className="mm-head-badges">
        <Badge size="sm" variant={SECTION_STATUS_VARIANTS[status] || 'neutral'}>
          {SECTION_STATUS_LABELS[status] || section.status_label || status}
        </Badge>
        {section.has_data && (
          <Badge size="sm" variant="success">
            Demos oficiales
          </Badge>
        )}
      </div>
    </div>
  )
}

export function SyncSummary({ sync }) {
  return (
    <div className="mm-sync">
      <div className="mm-sync-row">
        <span>Estado de sincronización</span>
        <Badge size="sm" variant={sync?.status === 'ERROR' ? 'danger' : 'neutral'}>
          {sync?.status_label || 'Sin sincronizar'}
        </Badge>
      </div>
      <div className="mm-sync-row">
        <span>Última sincronización</span>
        <span>
          {sync?.last_sync_at
            ? formatDateTime(sync.last_sync_at)
            : 'Sin sincronizaciones'}
        </span>
      </div>
      {sync?.next_sync_at && (
        <div className="mm-sync-row">
          <span>Próxima sincronización disponible</span>
          <span>{formatDateTime(sync.next_sync_at)}</span>
        </div>
      )}
    </div>
  )
}
