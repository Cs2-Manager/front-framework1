import useFaceitDiscovery from './useFaceitDiscovery.js'
import Alert from '../common/Alert.jsx'
import SourceBadge from '../steam/SourceBadge.jsx'

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
  const {
    discovering, linking, redirecting, discovery, error,
    handleDiscover, handleLink, handleOauth,
  } = useFaceitDiscovery(onChange)

  const configured = Boolean(faceit?.configured)
  const oauthConfigured = Boolean(faceit?.oauth_configured)

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
