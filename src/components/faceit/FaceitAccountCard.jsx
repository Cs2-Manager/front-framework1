import Alert from '../common/Alert.jsx'
import Badge from '../common/Badge.jsx'
import ConfirmDialog from '../common/ConfirmDialog.jsx'
import SourceBadge from '../steam/SourceBadge.jsx'
import FaceitAccountActions from './FaceitAccountActions.jsx'
import FaceitAccountIdentity from './FaceitAccountIdentity.jsx'
import FaceitElo from './FaceitElo.jsx'
import FaceitMaps from './FaceitMaps.jsx'
import FaceitMatches from './FaceitMatches.jsx'
import FaceitStats from './FaceitStats.jsx'
import FaceitSyncSummary from './FaceitSyncSummary.jsx'
import { FACEIT_STATUS_LABELS, faceitSyncVariant } from './faceitMessages.js'
import useFaceitAccountActions from './useFaceitAccountActions.js'

export default function FaceitAccountCard({
  faceit,
  owner = false,
  onChange,
}) {
  const {
    syncing,
    unlinking,
    verifying,
    confirming,
    setConfirming,
    error,
    syncResult,
    handleSync,
    handleUnlink,
    handleVerify,
  } = useFaceitAccountActions({ onChange })

  const account = faceit?.account
  const sync = faceit?.sync || {}
  if (!account) return null

  return (
    <section className="player-panel faceit-card">
      <div className="player-panel-head">
        <h2>FACEIT</h2>
        <SourceBadge source="VERIFIED_FACEIT" />
      </div>

      <FaceitAccountIdentity account={account} />
      <FaceitSyncSummary sync={sync} />

      {sync.status === 'ERROR' && owner && sync.last_error ? (
        <Alert variant="warning">{sync.last_error}</Alert>
      ) : null}

      {syncResult ? (
        <Alert variant={faceitSyncVariant(syncResult.status)}>
          {syncResult.message ||
            FACEIT_STATUS_LABELS[syncResult.status] ||
            'Sincronización completada.'}
        </Alert>
      ) : null}

      <Alert>{error}</Alert>

      {owner ? (
        <FaceitAccountActions
          sync={sync}
          account={account}
          syncing={syncing}
          verifying={verifying}
          unlinking={unlinking}
          onSync={handleSync}
          onVerify={handleVerify}
          onUnlink={() => setConfirming(true)}
        />
      ) : null}

      <FaceitStats stats={faceit.stats} />

      <div className="faceit-subhead">
        <h3>Partidas recientes</h3>
        <Badge size="sm" variant="neutral">
          {faceit.recent_matches?.length || 0}
        </Badge>
      </div>
      <FaceitMatches matches={faceit.recent_matches} />

      <div className="faceit-subhead">
        <h3>Rendimiento por mapa</h3>
      </div>
      <FaceitMaps maps={faceit.map_stats} />

      <div className="faceit-subhead">
        <h3>Historial de ELO</h3>
      </div>
      <FaceitElo snapshots={faceit.elo_history} />

      <p className="faceit-note">
        Datos obtenidos de la Data API oficial de FACEIT. No se mezclan con
        Steam ni con estadísticas manuales. Al desvincular, el historial de
        FACEIT se elimina; tu cuenta local se conserva.
      </p>

      <ConfirmDialog
        open={confirming}
        title="Desvincular FACEIT"
        message="¿Querés desvincular tu cuenta de FACEIT? Se eliminarán el historial, las estadísticas y los snapshots de ELO asociados. Tu cuenta local no se elimina."
        confirmLabel="Desvincular"
        busy={unlinking}
        onCancel={() => setConfirming(false)}
        onConfirm={handleUnlink}
      />
    </section>
  )
}
