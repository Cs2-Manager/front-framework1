import EmptyState from '../common/EmptyState.jsx'
import SourceBadge from '../steam/SourceBadge.jsx'
import { formatInteger, formatNumber, formatPercent } from './format.js'

function MapRow({ row }) {
  return (
    <tr>
      <td data-label="Mapa">{row.map?.name || 'Mapa desconocido'}</td>
      <td data-label="Partidas">{formatInteger(row.matches_played)}</td>
      <td data-label="Victorias">{formatInteger(row.wins)}</td>
      <td data-label="Derrotas">{formatInteger(row.losses)}</td>
      <td data-label="Win rate">{formatPercent(row.win_rate)}</td>
      <td data-label="K/D">{formatNumber(row.kd)}</td>
      <td data-label="ADR">{formatNumber(row.adr, 1)}</td>
    </tr>
  )
}

export default function MapPerformance({ rows = [] }) {
  return (
    <section className="player-panel">
      <div className="player-panel-head">
        <h2>Rendimiento por mapa</h2>
        {rows.length > 0 && (
          <>
            <SourceBadge source={rows[0]?.source || 'MANUAL'} />
            <span className="player-panel-count">{rows.length}</span>
          </>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState message="Todavía no hay rendimiento por mapa. Se calculará a partir de partidas reales con mapa asociado." />
      ) : (
        <div className="player-table-wrap">
          <table className="player-table">
            <thead>
              <tr>
                <th scope="col">Mapa</th>
                <th scope="col">Partidas</th>
                <th scope="col">Victorias</th>
                <th scope="col">Derrotas</th>
                <th scope="col">Win rate</th>
                <th scope="col">K/D</th>
                <th scope="col">ADR</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <MapRow key={row.map?.id} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
