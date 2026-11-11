import Alert from '../common/Alert.jsx'
import ConfirmDialog from '../common/ConfirmDialog.jsx'
import MatchmakingAuthForm from './MatchmakingAuthForm.jsx'
import MatchmakingHistory from './MatchmakingHistory.jsx'
import MatchmakingResults from './MatchmakingResults.jsx'
import MatchmakingActions from './MatchmakingActions.jsx'
import MatchmakingStatus from './MatchmakingStatus.jsx'
import { SectionHeader, SyncSummary } from './MatchmakingSectionHeader.jsx'
import useMatchmakingSection from './useMatchmakingSection.js'

export default function MatchmakingSection({
  matchmaking,
  owner = false,
  onChange,
}) {
  const {
    section,
    notice,
    syncing,
    refreshing,
    uploading,
    confirmRevoke,
    revoking,
    setConfirmRevoke,
    handleAuthorize,
    handleSync,
    handleRefresh,
    handleUpload,
    handleRevoke,
  } = useMatchmakingSection({ matchmaking, onChange })

  if (!matchmaking || !section) return null

  const authorized = Boolean(section.authorized)
  const sync = section.sync || {}
  const showAuthForm = owner && !authorized
  const disabled = section.enabled === false

  return (
    <section className="player-panel mm-card">
      <SectionHeader section={section} />

      <Alert variant={notice?.variant}>{notice?.text}</Alert>

      <MatchmakingStatus
        section={section}
        disabled={disabled}
        sync={sync}
        owner={owner}
      />

      {authorized && (
        <>
          <SyncSummary sync={sync} />
          <MatchmakingActions
            syncing={syncing}
            refreshing={refreshing}
            uploading={uploading}
            revoking={revoking}
            disabled={disabled}
            sync={sync}
            onSync={handleSync}
            onRefresh={handleRefresh}
            onUpload={handleUpload}
            onRevoke={() => setConfirmRevoke(true)}
          />
        </>
      )}

      <MatchmakingResults section={section} authorized={authorized} />

      {showAuthForm && !disabled && (
        <MatchmakingAuthForm onAuthorize={handleAuthorize} />
      )}

      <MatchmakingHistory matches={section.recent_matches} owner={owner} />

      <p className="mm-note">
        Matchmaking oficial de CS2. Los datos de FACEIT y de Steam se muestran
        en secciones separadas y nunca se mezclan con estas métricas.
      </p>

      <ConfirmDialog
        open={confirmRevoke}
        title="Revocar autorización de matchmaking"
        message="Vas a dejar de sincronizar partidas nuevas y borraremos el código de autenticación guardado. Las partidas ya procesadas se conservan."
        confirmLabel="Revocar"
        busy={revoking}
        onCancel={() => setConfirmRevoke(false)}
        onConfirm={handleRevoke}
      />
    </section>
  )
}
