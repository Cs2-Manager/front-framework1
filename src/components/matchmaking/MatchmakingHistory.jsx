import Alert from '../common/Alert.jsx'
import EmptyState from '../common/EmptyState.jsx'
import MatchmakingHistoryRow from './MatchmakingHistoryRow.jsx'
import MatchmakingMatchDetail from './MatchmakingMatchDetail.jsx'
import useMatchmakingHistory from '../../hooks/useMatchmakingHistory.js'

export default function MatchmakingHistory({ matches = [], owner = false }) {
  const {
    items,
    loadingAll,
    loadedAll,
    error,
    selected,
    detailOpen,
    detailLoading,
    detailError,
    handleLoadAll,
    handleOpen,
    handleCloseDetail,
  } = useMatchmakingHistory({ matches, owner })

  return (
    <div className="mm-block">
      <div className="mm-block-head">
        <div>
          <h3>Historial de partidas</h3>
          <p className="mm-note">
            Solo las demos procesadas aportan estadísticas. Las partidas
            pendientes o sin demo se muestran igual, marcadas como tales.
          </p>
        </div>
        <div className="mm-block-actions">
          <span className="player-panel-count">{items.length}</span>
          {owner && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleLoadAll}
              disabled={loadingAll}
            >
              {loadingAll ? (
                <>
                  <span className="spinner spinner-sm" aria-hidden="true" />
                  Cargando…
                </>
              ) : loadedAll ? (
                'Actualizar historial'
              ) : (
                'Ver historial completo'
              )}
            </button>
          )}
        </div>
      </div>

      <Alert>{error}</Alert>

      {items.length === 0 ? (
        <EmptyState message="Todavía no hay partidas de matchmaking registradas." />
      ) : (
        <div className="player-table-wrap">
          <table className="player-table mm-history-table">
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Mapa</th>
                <th scope="col">Resultado</th>
                <th scope="col">Equipo / rival</th>
                <th scope="col">K / D / A</th>
                <th scope="col">ADR</th>
                <th scope="col">HS%</th>
                <th scope="col">Rondas</th>
                <th scope="col">Fuente</th>
                <th scope="col">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {items.map((match) => (
                <MatchmakingHistoryRow
                  key={match.id}
                  match={match}
                  onOpen={handleOpen}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <MatchmakingMatchDetail
        open={detailOpen}
        match={selected}
        owner={owner}
        loading={detailLoading}
        error={detailError}
        onClose={handleCloseDetail}
      />
    </div>
  )
}
