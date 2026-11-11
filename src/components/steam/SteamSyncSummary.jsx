import Badge from '../common/Badge.jsx'
import { formatDateTime } from '../profile/format.js'
import { STEAM_STATUS_LABELS } from './steamMessages.js'

/** Resumen del estado de sincronización Steam: estado, última y próxima. */
export default function SteamSyncSummary({ sync }) {
  const label = STEAM_STATUS_LABELS[sync?.status] || STEAM_STATUS_LABELS.NEVER
  return (
    <div className="steam-sync-summary">
      <div className="steam-sync-row">
        <span>Estado</span>
        <Badge
          size="sm"
          variant={sync?.status === 'ERROR' ? 'danger' : 'neutral'}
        >
          {label}
        </Badge>
      </div>
      <div className="steam-sync-row">
        <span>Última sincronización</span>
        <span>{formatDateTime(sync?.last_sync_at)}</span>
      </div>
      {sync?.next_sync_at && (
        <div className="steam-sync-row">
          <span>Próxima disponible</span>
          <span>{formatDateTime(sync.next_sync_at)}</span>
        </div>
      )}
    </div>
  )
}
