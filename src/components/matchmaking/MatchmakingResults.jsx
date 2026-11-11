import Alert from '../common/Alert.jsx'
import EmptyState from '../common/EmptyState.jsx'
import MatchmakingMapTable from './MatchmakingMapTable.jsx'
import MatchmakingSummary from './MatchmakingSummary.jsx'

/**
 * Resultado agregado de las demos procesadas: aviso de historial incompleto,
 * resumen ponderado y rendimiento por mapa. Si no hay datos muestra el estado
 * vacío con un mensaje adaptado a si la autorización está activa.
 */
export default function MatchmakingResults({ section, authorized }) {
  return (
    <>
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
    </>
  )
}
