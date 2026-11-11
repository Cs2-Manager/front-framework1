import Alert from '../common/Alert.jsx'
import { NO_AUTHORIZATION_MESSAGE } from './matchmakingMessages.js'

/**
 * Mensajes de estado previos a los controles: motivo de indisponibilidad,
 * integración deshabilitada y avisos de sincronización.
 */
export default function MatchmakingStatus({ section, disabled, sync, owner }) {
  return (
    <>
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

      {section.authorized && owner && sync.api_configured === false && (
        <Alert variant="warning">
          La integración con Steam no está configurada en el servidor. No se
          pueden descubrir partidas nuevas.
        </Alert>
      )}

      {section.authorized && owner && sync.status === 'ERROR' && sync.last_sync_error && (
        <Alert variant="error">{sync.last_sync_error}</Alert>
      )}
    </>
  )
}
