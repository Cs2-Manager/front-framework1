import { useState } from 'react'

import {
  startFaceitOauth,
  syncFaceit,
  unlinkFaceit,
} from '../../services/faceit.js'
import { getErrorMessage } from '../../utils/errors.js'
import Alert from '../common/Alert.jsx'
import Badge from '../common/Badge.jsx'
import ConfirmDialog from '../common/ConfirmDialog.jsx'
import { formatDateTime } from '../profile/format.js'
import SourceBadge from '../steam/SourceBadge.jsx'
import FaceitElo from './FaceitElo.jsx'
import FaceitMaps from './FaceitMaps.jsx'
import FaceitMatches from './FaceitMatches.jsx'
import FaceitStats from './FaceitStats.jsx'
import {
  FACEIT_LINK_LABELS,
  FACEIT_STATUS_LABELS,
  faceitSyncVariant,
} from './faceitMessages.js'

const SYNC_ERROR = 'No pudimos sincronizar con FACEIT. Intentalo de nuevo.'
const UNLINK_ERROR =
  'No pudimos desvincular la cuenta de FACEIT. Intentalo de nuevo.'
const OAUTH_ERROR =
  'No pudimos iniciar la verificación con FACEIT Connect.'

function Identity({ account }) {
  return (
    <div className="faceit-identity">
      <div className="faceit-avatar" aria-hidden="true">
        {account.avatar_url ? <img src={account.avatar_url} alt="" /> : null}
      </div>
      <div className="faceit-identity-copy">
        <p className="faceit-nickname">
          {account.nickname || 'Jugador FACEIT'}
        </p>
        <p className="faceit-meta">
          {account.elo != null ? `ELO ${account.elo}` : 'ELO no disponible'}
          {account.skill_level != null
            ? ` · Nivel ${account.skill_level}`
            : ''}
          {account.region ? ` · ${account.region}` : ''}
        </p>
        <p className="faceit-meta">
          <Badge
            size="sm"
            variant={account.verified ? 'success' : 'warning'}
          >
            {FACEIT_LINK_LABELS[account.link_status] || account.link_status}
          </Badge>
        </p>
        {account.steam_id ? (
          <p className="faceit-meta">
            SteamID64: <code>{account.steam_id}</code>
          </p>
        ) : null}
        {account.faceit_url ? (
          <a
            className="faceit-link"
            href={account.faceit_url}
            target="_blank"
            rel="noreferrer"
          >
            Ver perfil en FACEIT
          </a>
        ) : null}
      </div>
    </div>
  )
}

function SyncSummary({ sync }) {
  return (
    <dl className="faceit-sync">
      <div>
        <dt>Estado</dt>
        <dd>
          <Badge
            size="sm"
            variant={
              sync?.status === 'ERROR'
                ? 'danger'
                : sync?.status === 'PARTIAL'
                  ? 'warning'
                  : 'neutral'
            }
          >
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

export default function FaceitAccountCard({
  faceit,
  owner = false,
  onChange,
}) {
  const [syncing, setSyncing] = useState(false)
  const [unlinking, setUnlinking] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const [syncResult, setSyncResult] = useState(null)

  const account = faceit?.account
  const sync = faceit?.sync || {}
  if (!account) return null

  async function handleSync() {
    setSyncing(true)
    setError('')
    setSyncResult(null)
    try {
      const result = await syncFaceit()
      setSyncResult(result)
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
      await unlinkFaceit()
      setConfirming(false)
      onChange?.()
    } catch (err) {
      setError(getErrorMessage(err, UNLINK_ERROR))
    } finally {
      setUnlinking(false)
    }
  }

  async function handleVerify() {
    setVerifying(true)
    setError('')
    try {
      const url = await startFaceitOauth()
      window.location.assign(url)
    } catch (err) {
      setError(getErrorMessage(err, OAUTH_ERROR))
      setVerifying(false)
    }
  }

  return (
    <section className="player-panel faceit-card">
      <div className="player-panel-head">
        <h2>FACEIT</h2>
        <SourceBadge source="VERIFIED_FACEIT" />
      </div>

      <Identity account={account} />
      <SyncSummary sync={sync} />

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
        <div className="faceit-card-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSync}
            disabled={syncing || !sync.can_sync}
            title={
              sync.can_sync
                ? 'Consultar FACEIT y actualizar estadísticas e historial'
                : 'Esperá al intervalo mínimo entre sincronizaciones'
            }
          >
            {syncing ? (
              <>
                <span className="spinner spinner-sm" aria-hidden="true" />
                Sincronizando…
              </>
            ) : (
              'Sincronizar FACEIT'
            )}
          </button>
          {!account.verified && sync.oauth_configured ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleVerify}
              disabled={verifying}
            >
              {verifying
                ? 'Redirigiendo…'
                : 'Verificar con FACEIT Connect'}
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setConfirming(true)}
            disabled={unlinking}
          >
            Desvincular
          </button>
        </div>
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
