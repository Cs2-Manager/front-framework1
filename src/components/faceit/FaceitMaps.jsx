import {
  formatInteger,
  formatNumber,
  formatPercent,
} from '../profile/format.js'

export default function FaceitMaps({ maps }) {
  if (!maps?.length) {
    return (
      <div className="faceit-empty">
        <p>FACEIT no reportó estadísticas por mapa para esta cuenta.</p>
      </div>
    )
  }

  return (
    <div className="faceit-table-wrap">
      <table className="table faceit-table">
        <caption className="sr-only">Rendimiento verificado por mapa</caption>
        <thead>
          <tr>
            <th scope="col">Mapa</th>
            <th scope="col">Partidas</th>
            <th scope="col">V</th>
            <th scope="col">D</th>
            <th scope="col">Win rate</th>
            <th scope="col">K/D</th>
            <th scope="col">ADR</th>
            <th scope="col">HS %</th>
          </tr>
        </thead>
        <tbody>
          {maps.map((row) => (
            <tr key={row.map}>
              <td>{row.map}</td>
              <td>{formatInteger(row.matches_played)}</td>
              <td>{formatInteger(row.wins)}</td>
              <td>{formatInteger(row.losses)}</td>
              <td>{formatPercent(row.win_rate)}</td>
              <td>{formatNumber(row.kd, 2)}</td>
              <td>{formatNumber(row.adr, 1)}</td>
              <td>{formatPercent(row.headshot_percentage)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
