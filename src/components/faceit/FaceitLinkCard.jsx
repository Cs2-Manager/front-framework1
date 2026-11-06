import { useState } from 'react'

import {
  discoverFaceit,
  linkFaceit,
  startFaceitOauth,
} from '../../services/faceit.js'
import { getErrorMessage } from '../../utils/errors.js'
import Alert from '../common/Alert.jsx'
import SourceBadge from '../steam/SourceBadge.jsx'

const DISCOVER_ERROR =
  'No pudimos consultar FACEIT. Intentalo de nuevo.'
const LINK_ERROR =
  'No pudimos vincular la cuenta de FACEIT. Intentalo de nuevo.'
const OAUTH_ERROR =
  'No pudimos iniciar la vinculación con FACEIT Connect.'

function PlayerPreview({ player }) {
  return (
    <div className="faceit-preview">
      <div className="faceit-avatar" aria-hidden="true">
        {player.avatar_url ? <img src={player.avatar_url} alt="" /> : null}
      </div>
      <div>
        <p className="faceit-nickname">{player.nickname || 'Jugador FACEIT'}</p>
        <p className="faceit-meta">
          {player.elo != null ? `ELO ${player.elo}` : 'ELO no disponible'}
          {player.skill_level != null
            ? ` · Nivel ${player.skill_level}`
            : ''}
        </p>
        {player.country ? (
          <p className="faceit-meta">Región: {player.country}</p>
        ) : null}
      </div>
    </div>
  )
}

export default function FaceitLinkCard({ faceit, onChange }) {
  const [discovering, setDiscovering] = useState(false)
  const [linking, setLinking] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [discovery, setDiscovery] = useState(null)
  const [error, setError] = useState('')

  const configured = Boolean(faceit?.configured)
  const oauthConfigured = Boolean(faceit?.oauth_configured)

  async function handleDiscover() {
    setDiscovering(true)
    setError('')
    setDiscovery(null)
    try {
      setDiscovery(await discoverFaceit())
    } catch (err) {
      setError(getErrorMessage(err, DISCOVER_ERROR))
    } finally {
      setDiscovering(false)
    }
  }

  async function handleLink() {
    setLinking(true)
    setError('')
    try {
      await linkFaceit(discovery?.player?.player_id)
      setDiscovery(null)
      onChange?.()
    } catch (err) {
      setError(getErrorMessage(err, LINK_ERROR))
    } finally {
      setLinking(false)
    }
  }

  async function handleOauth() {
    setRedirecting(true)
    setError('')
    try {
      const url = await startFaceitOauth()
      window.location.assign(url)
    } catch (err) {
      setError(getErrorMessage(err, OAUTH_ERROR))
      setRedirecting(false)
    }
  }

  return (
    <section className="player-panel faceit-card">
      <div className="player-panel-head">
        <h2>FACEIT</h2>
        <SourceBadge source="VERIFIED_FACEIT" />
      </div>

      {!configured ? (
        <Alert variant="warning">
          {faceit?.message ||
            'FACEIT no está configurado en este servidor. Un administrador debe definir FACEIT_API_KEY.'}
        </Alert>
      ) : (
        <p className="text-muted">
          Vinculá tu cuenta de FACEIT para importar estadísticas verificadas,
          historial de partidas y ELO. La identidad se descubre desde tu
          SteamID verificado o se verifica con FACEIT Connect.
        </p>
      )}

      <Alert>{error}</Alert>

      {discovery?.found && (
        <div className="faceit-discovery">
          <PlayerPreview player={discovery.player} />
          {discovery.claimed ? (
            <Alert variant="warning">{discovery.message}</Alert>
          ) : discovery.linked ? (
            <Alert variant="success">
              Esta cuenta ya está vinculada a tu perfil.
            </Alert>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleLink}
              disabled={linking}
            >
              {linking ? 'Vinculando…' : 'Vincular esta cuenta'}
            </button>
          )}
        </div>
      )}

      {discovery && !discovery.found && (
        <Alert variant="warning">
          {discovery.message ||
            'No encontramos una cuenta FACEIT asociada a tu SteamID.'}
        </Alert>
      )}

      {configured && (
        <div className="faceit-card-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDiscover}
            disabled={discovering || linking}
          >
            {discovering ? 'Buscando…' : 'Descubrir desde Steam'}
          </button>
          {oauthConfigured && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleOauth}
              disabled={redirecting}
            >
              {redirecting ? 'Redirigiendo…' : 'Verificar con FACEIT Connect'}
            </button>
          )}
        </div>
      )}

      <p className="faceit-note">
        Solo se guardan datos públicos que FACEIT entrega mediante su Data API
        oficial. Los secretos de la integración permanecen en el backend.
      </p>
    </section>
  )
}
