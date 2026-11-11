import Badge from '../common/Badge.jsx'
import { formatDateTime } from '../profile/format.js'
import { FACEIT_STATUS_LABELS } from './faceitMessages.js'

function syncVariant(status) {
  if (status === 'ERROR') return 'danger'
  if (status === 'PARTIAL') return 'warning'
  return 'neutral'
}

/**
 * Resumen del estado de sincronización FACEIT: estado, última ejecución y
 * próxima ventana disponible.
 */
export default function FaceitSyncSummary({ sync }) {
  return (
    <dl className="faceit-sync">
      <div>
        <dt>Estado</dt>
        <dd>
          <Badge size="sm" variant={syncVariant(sync?.status)}>
            {FACEIT_STATUS_LABELS[sync?.status] ||
              FACEIT_STATUS_LABELS.NEVER}
          </Badge>
        </dd>
      </div>
      <div>
        <dt>Última sincronización</dt>
        <dd>{formatDateTime(sync?.last_sync_at)}</dd>
      </div>
      {sync?.next_sync_at ? (
        <div>
          <dt>Próxima disponible</dt>
          <dd>{formatDateTime(sync.next_sync_at)}</dd>
        </div>
      ) : null}
    </dl>
  )
}
