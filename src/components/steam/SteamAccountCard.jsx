import { useState } from 'react'

import { syncSteam, unlinkSteam } from '../../services/steam.js'
import { getErrorMessage } from '../../utils/errors.js'
import Alert from '../common/Alert.jsx'
import Badge from '../common/Badge.jsx'
import ConfirmDialog from '../common/ConfirmDialog.jsx'
import { formatDateTime } from '../profile/format.js'
import SourceBadge from './SourceBadge.jsx'
import SteamIcon from './SteamIcon.jsx'
import { STEAM_STATUS_LABELS } from './steamMessages.js'

const VISIBILITY_LABELS = {
  PUBLIC: 'Perfil público',
  FRIENDS_ONLY: 'Solo amigos',
  PRIVATE: 'Perfil privado',
  UNKNOWN: 'Visibilidad desconocida',
}

const SYNC_ERROR =
  'No pudimos sincronizar con Steam. Intentalo de nuevo.'
const UNLINK_ERROR =
  'No pudimos desvincular la cuenta de Steam. Intentalo de nuevo.'

function statusVariant(status) {
  if (status === 'ERROR') return 'error'
  if (status === 'PARTIAL' || status === 'SKIPPED') return 'warning'
  return 'success'
}

function AccountIdentity({ account }) {
  return (
    <div className="steam-account">
      <div className="steam-avatar" aria-hidden="true">
        {account.avatar_url ? (
          <img src={account.avatar_url} alt="" />
        ) : (
          <SteamIcon size={28} />
        )}
      </div>
      <div className="steam-account-copy">
        <p className="steam-persona">{account.persona_name || 'Jugador de Steam'}</p>
        {account.profile_url ? (
          <a
            className="steam-profile-link"
            href={account.profile_url}
            target="_blank"
            rel="noreferrer"
          >
            Ver perfil en Steam
          </a>
        ) : null}
        <p className="steam-account-meta">
          SteamID64: <code>{account.steam_id}</code>
        </p>
        <p className="steam-account-meta">
          {VISIBILITY_LABELS[account.community_visibility] ||
            VISIBILITY_LABELS.UNKNOWN}
        </p>
        <p className="steam-account-meta">
          Vinculada el {formatDateTime(account.linked_at)}
        </p>
      </div>
    </div>
  )
}

function SyncSummary({ sync }) {
  const label = STEAM_STATUS_LABELS[sync?.status] || STEAM_STATUS_LABELS.NEVER
  return (
    <div className="steam-sync-summary">
      <div className="steam-sync-row">
        <span>Estado</span>
        <Badge size="sm" variant={sync?.status === 'ERROR' ? 'danger' : 'neutral'}>
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

export default function SteamAccountCard({
  steam,
  owner = false,
  onChange,
}) {
  const [syncing, setSyncing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [unlinking, setUnlinking] = useState(false)
  const [error, setError] = useState('')
  const [syncResult, setSyncResult] = useState(null)

  const account = steam?.account
  const sync = steam?.sync || {}
  if (!account) return null

  async function handleSync() {
    setSyncing(true)
    setError('')
    setSyncResult(null)
    try {
      const result = await syncSteam()
      setSyncResult(result.sync)
      onChange?.()
    } catch (err) {
      setError(getErrorMessage(err, SYNC_ERROR))
    } finally {
      setSyncing(false)
    }
  }

  async function handleUnlink() {
    setUnlinking(true)
    setError('')
    try {
      await unlinkSteam()
      setConfirming(false)
      onChange?.()
    } catch (err) {
      setError(getErrorMessage(err, UNLINK_ERROR))
    } finally {
      setUnlinking(false)
    }
  }

  return (
    <section className="player-panel steam-card">
      <div className="player-panel-head">
        <h2>Steam</h2>
        <SourceBadge source="VERIFIED_STEAM" />
      </div>

      <AccountIdentity account={account} />
      <SyncSummary sync={sync} />

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
        <div className="steam-card-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSync}
            disabled={syncing || !sync.can_sync}
            title={
              sync.can_sync
                ? 'Consultar Steam y actualizar el tiempo de juego'
                : 'Esperá al intervalo mínimo entre sincronizaciones'
            }
          >
            {syncing ? (
              <>
                <span className="spinner spinner-sm" aria-hidden="true" />
                Sincronizando…
              </>
            ) : (
              'Sincronizar datos'
            )}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setConfirming(true)}
            disabled={unlinking}
          >
            Desvincular
          </button>
        </div>
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
