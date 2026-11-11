import Alert from '../common/Alert.jsx'
import ConfirmDialog from '../common/ConfirmDialog.jsx'
import SourceBadge from './SourceBadge.jsx'
import SteamAccountActions from './SteamAccountActions.jsx'
import SteamAccountIdentity from './SteamAccountIdentity.jsx'
import SteamSyncSummary from './SteamSyncSummary.jsx'
import { STEAM_STATUS_LABELS } from './steamMessages.js'
import useSteamAccountActions from './useSteamAccountActions.js'

function statusVariant(status) {
  if (status === 'ERROR') return 'error'
  if (status === 'PARTIAL' || status === 'SKIPPED') return 'warning'
  return 'success'
}

export default function SteamAccountCard({
  steam,
  owner = false,
  onChange,
}) {
  const {
    syncing,
    confirming,
    setConfirming,
    unlinking,
    error,
    syncResult,
    handleSync,
    handleUnlink,
  } = useSteamAccountActions({ onChange })

  const account = steam?.account
  const sync = steam?.sync || {}
  if (!account) return null

  return (
    <section className="player-panel steam-card">
      <div className="player-panel-head">
        <h2>Steam</h2>
        <SourceBadge source="VERIFIED_STEAM" />
      </div>

      <SteamAccountIdentity account={account} />
      <SteamSyncSummary sync={sync} />

      {sync.status === 'ERROR' && owner && sync.last_sync_error && (
        <Alert>{sync.last_sync_error}</Alert>
      )}

      {syncResult && (
        <Alert variant={statusVariant(syncResult.status)}>
          {syncResult.message || STEAM_STATUS_LABELS[syncResult.status]}
        </Alert>
      )}
      <Alert>{error}</Alert>

      {owner && (
        <SteamAccountActions
          sync={sync}
          syncing={syncing}
          unlinking={unlinking}
          onSync={handleSync}
          onUnlink={() => setConfirming(true)}
        />
      )}

      <p className="steam-card-note">
        Los datos verificados por Steam no se pueden editar manualmente. Al
        desvincular, tu cuenta local y tu historial se conservan.
      </p>

      <ConfirmDialog
        open={confirming}
        title="Desvincular Steam"
        message="¿Querés desvincular tu cuenta de Steam? Los datos verificados dejarán de mostrarse, pero tu cuenta local no se elimina."
        confirmLabel="Desvincular"
        busy={unlinking}
        onCancel={() => setConfirming(false)}
        onConfirm={handleUnlink}
      />
    </section>
  )
}
