import { useEffect, useState } from 'react'

import {
  authorizeMatchmaking,
  fetchMatchmakingStatus,
  revokeMatchmaking,
  syncMatchmaking,
  uploadMatchmakingDemo,
} from '../../services/matchmaking.js'
import { getErrorMessage } from '../../utils/errors.js'
import Alert from '../common/Alert.jsx'
import Badge from '../common/Badge.jsx'
import ConfirmDialog from '../common/ConfirmDialog.jsx'
import EmptyState from '../common/EmptyState.jsx'
import { formatDateTime } from '../profile/format.js'
import MatchmakingAuthForm from './MatchmakingAuthForm.jsx'
import MatchmakingHistory from './MatchmakingHistory.jsx'
import MatchmakingMapTable from './MatchmakingMapTable.jsx'
import MatchmakingSummary from './MatchmakingSummary.jsx'
import {
  MATCHMAKING_ERRORS,
  NO_AUTHORIZATION_MESSAGE,
  SECTION_STATUS_LABELS,
  SECTION_STATUS_VARIANTS,
} from './matchmakingMessages.js'

function SectionHeader({ section }) {
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

function SyncSummary({ sync }) {
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

export default function MatchmakingSection({
  matchmaking,
  owner = false,
  onChange,
}) {
  const [section, setSection] = useState(matchmaking)
  const [notice, setNotice] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [confirmRevoke, setConfirmRevoke] = useState(false)
  const [revoking, setRevoking] = useState(false)

  useEffect(() => {
    setSection(matchmaking)
  }, [matchmaking])

  if (!matchmaking || !section) return null

  const authorized = Boolean(section.authorized)
  const sync = section.sync || {}
  const showAuthForm = owner && !authorized
  const disabled = section.enabled === false

  function flash(variant, text) {
    setNotice({ variant, text })
  }

  async function handleAuthorize(payload) {
    const updated = await authorizeMatchmaking(payload)
    setSection(updated)
    flash('success', 'Autorización guardada. El worker buscará partidas nuevas.')
    onChange?.()
  }

  async function handleSync() {
    setSyncing(true)
    setNotice(null)
    try {
      const result = await syncMatchmaking()
      if (result.matchmaking) setSection(result.matchmaking)
      if (result.sync) {
        setSection((current) => ({
          ...current,
          sync: { ...current.sync, ...result.sync },
        }))
      }
      if (result.status === 'SKIPPED') {
        flash('warning', result.sync?.message || 'La sincronización se hizo hace poco.')
      } else {
        flash(
          'success',
          result.sync?.message || 'La sincronización quedó en cola.',
        )
      }
    } catch (error) {
      flash('error', getErrorMessage(error, MATCHMAKING_ERRORS.sync))
    } finally {
      setSyncing(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    setNotice(null)
    try {
      setSection(await fetchMatchmakingStatus())
      flash('success', 'Estado actualizado.')
    } catch (error) {
      flash('error', getErrorMessage(error, MATCHMAKING_ERRORS.refresh))
    } finally {
      setRefreshing(false)
    }
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!/\.(dem|dem\.bz2)$/i.test(file.name)) {
      flash('error', 'El archivo debe ser una demo .dem o .dem.bz2.')
      return
    }

    setUploading(true)
    setNotice(null)
    try {
      await uploadMatchmakingDemo(file)
      flash(
        'success',
        'La demo se guardó. El worker la procesará y actualizará las estadísticas.',
      )
      onChange?.()
    } catch (error) {
      flash('error', getErrorMessage(error, MATCHMAKING_ERRORS.upload))
    } finally {
      setUploading(false)
    }
  }

  async function handleRevoke() {
    setRevoking(true)
    setNotice(null)
    try {
      setSection(await revokeMatchmaking())
      setConfirmRevoke(false)
      flash(
        'success',
        'Autorización revocada. Las partidas ya procesadas siguen visibles.',
      )
      onChange?.()
    } catch (error) {
      flash('error', getErrorMessage(error, MATCHMAKING_ERRORS.revoke))
    } finally {
      setRevoking(false)
    }
  }

  return (
    <section className="player-panel mm-card">
      <SectionHeader section={section} />

      <Alert variant={notice?.variant}>{notice?.text}</Alert>

      {!section.available && (
        <p className="mm-message">
          {section.message || NO_AUTHORIZATION_MESSAGE}
        </p>
      )}

      {section.unavailable_reason && section.available && (
        <Alert variant="warning">{section.unavailable_reason}</Alert>
      )}

      {disabled && (
        <Alert variant="warning">
          La sincronización de matchmaking no está habilitada en este servidor.
        </Alert>
      )}

      {authorized && (
        <>
          <SyncSummary sync={sync} />

          {owner && sync.api_configured === false && (
            <Alert variant="warning">
              La integración con Steam no está configurada en el servidor. No
              se pueden descubrir partidas nuevas.
            </Alert>
          )}
          {owner && sync.status === 'ERROR' && sync.last_sync_error && (
            <Alert variant="error">{sync.last_sync_error}</Alert>
          )}

          <div className="mm-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSync}
              disabled={syncing || !sync.can_sync || disabled}
              title={
                sync.can_sync
                  ? 'Pedir al worker que busque share codes nuevos'
                  : 'Esperá al intervalo mínimo entre sincronizaciones'
              }
            >
              {syncing ? (
                <>
                  <span className="spinner spinner-sm" aria-hidden="true" />
                  Enviando…
                </>
              ) : (
                'Sincronizar ahora'
              )}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? 'Actualizando…' : 'Actualizar estado'}
            </button>
            <label className="btn btn-ghost mm-upload">
              <input
                type="file"
                accept=".dem,.dem.bz2,.bz2"
                aria-label="Demo de matchmaking"
                className="mm-file-input"
                onChange={handleUpload}
                disabled={uploading || disabled}
              />
              {uploading ? 'Subiendo…' : 'Subir demo'}
            </label>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setConfirmRevoke(true)}
              disabled={revoking}
            >
              Revocar autorización
            </button>
          </div>
        </>
      )}

      {section.incomplete && (
        <Alert variant="warning">
          <strong>Historial incompleto.</strong>{' '}
          {section.incomplete_reason ||
            'Hay partidas sin demo procesada o con errores.'}
        </Alert>
      )}

      {section.has_data ? (
        <>
          <MatchmakingSummary summary={section.summary} />
          <MatchmakingMapTable rows={section.map_performance} />
        </>
      ) : (
        <EmptyState
          title="Todavía no hay estadísticas de matchmaking"
          message={
            authorized
              ? 'La autorización está activa. Las estadísticas aparecerán cuando el worker procese las demos de tus partidas.'
              : 'Las estadísticas se habilitan cuando el jugador autoriza la sincronización y se procesa al menos una demo oficial.'
          }
        />
      )}

      {showAuthForm && !disabled && (
        <MatchmakingAuthForm onAuthorize={handleAuthorize} />
      )}

      <MatchmakingHistory
        matches={section.recent_matches}
        owner={owner}
      />

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
