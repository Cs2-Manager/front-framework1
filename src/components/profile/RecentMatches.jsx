import EmptyState from '../common/EmptyState.jsx'
import SourceBadge from '../steam/SourceBadge.jsx'
import { formatDate, formatNumber, formatPercent } from './format.js'

const RESULT_LABELS = {
  WIN: 'Victoria',
  LOSS: 'Derrota',
  DRAW: 'Empate',
}

const TYPE_LABELS = {
  COMPETITIVE: 'Competitivo',
  PRACTICE: 'Práctica',
  OTHER: 'Otro',
}

function MatchRow({ match }) {
  return (
    <tr>
      <td data-label="Fecha">{formatDate(match.played_at)}</td>
      <td data-label="Mapa">{match.map?.name || 'Sin mapa'}</td>
      <td data-label="Resultado">
        <span className={`player-result ${match.result?.toLowerCase()}`}>
          {RESULT_LABELS[match.result] || match.result}
        </span>
      </td>
      <td data-label="Tipo">
        {TYPE_LABELS[match.match_type] || match.match_type}
      </td>
      <td data-label="K / D / A">
        {match.kills} / {match.deaths} / {match.assists}
      </td>
      <td data-label="ADR">{formatNumber(match.adr, 1)}</td>
      <td data-label="HS%">{formatPercent(match.headshot_percentage)}</td>
    </tr>
  )
}

export default function RecentMatches({ matches = [] }) {
  return (
    <section className="player-panel">
      <div className="player-panel-head">
        <h2>Historial reciente</h2>
        {matches.length > 0 && (
          <>
            <SourceBadge source={matches[0]?.source || 'MANUAL'} />
            <span className="player-panel-count">{matches.length}</span>
          </>
        )}
      </div>

      {matches.length === 0 ? (
        <EmptyState message="Todavía no hay partidas registradas. El historial aparecerá cuando se carguen resultados reales." />
      ) : (
        <div className="player-table-wrap">
          <table className="player-table">
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Mapa</th>
                <th scope="col">Resultado</th>
                <th scope="col">Tipo</th>
                <th scope="col">K / D / A</th>
                <th scope="col">ADR</th>
                <th scope="col">HS%</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <MatchRow key={match.id} match={match} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
