import EmptyState from '../common/EmptyState.jsx'
import {
  formatInteger,
  formatNumber,
  formatPercent,
} from '../profile/format.js'

function MapRow({ row }) {
  return (
    <tr>
      <td data-label="Mapa">{row.map || 'Mapa desconocido'}</td>
      <td data-label="Partidas">{formatInteger(row.matches_played)}</td>
      <td data-label="Victorias">{formatInteger(row.wins)}</td>
      <td data-label="Derrotas">{formatInteger(row.losses)}</td>
      <td data-label="Win rate">{formatPercent(row.win_rate)}</td>
      <td data-label="K/D">{formatNumber(row.kd)}</td>
      <td data-label="ADR">{formatNumber(row.adr, 1)}</td>
      <td data-label="KAST">{formatPercent(row.kast_percentage)}</td>
    </tr>
  )
}

export default function MatchmakingMapTable({ rows = [] }) {
  return (
    <div className="mm-block">
      <div className="mm-block-head">
        <h3>Rendimiento por mapa</h3>
        <span className="player-panel-count">{rows.length}</span>
      </div>
      {rows.length === 0 ? (
        <EmptyState message="Todavía no hay mapas con demos procesadas." />
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
                <th scope="col">KAST</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <MapRow key={row.map} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
