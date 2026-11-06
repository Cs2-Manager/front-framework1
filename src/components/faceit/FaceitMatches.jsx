import {
  formatDate,
  formatInteger,
  formatNumber,
  formatPercent,
} from '../profile/format.js'
import Badge from '../common/Badge.jsx'
import { FACEIT_RESULT_LABELS } from './faceitMessages.js'

function resultVariant(result) {
  if (result === 'WIN') return 'success'
  if (result === 'LOSS') return 'danger'
  return 'neutral'
}

export default function FaceitMatches({ matches }) {
  if (!matches?.length) {
    return (
      <div className="faceit-empty">
        <p>
          Todavía no hay partidas de FACEIT sincronizadas. Ejecutá una
          sincronización para importar el historial reciente.
        </p>
      </div>
    )
  }

  return (
    <div className="faceit-table-wrap">
      <table className="table faceit-table">
        <caption className="sr-only">Partidas verificadas de FACEIT</caption>
        <thead>
          <tr>
            <th scope="col">Fecha</th>
            <th scope="col">Mapa</th>
            <th scope="col">Resultado</th>
            <th scope="col">Marcador</th>
            <th scope="col">K/D</th>
            <th scope="col">ADR</th>
            <th scope="col">HS %</th>
            <th scope="col">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <tr key={match.match_id}>
              <td>{formatDate(match.played_at)}</td>
              <td>{match.map || '—'}</td>
              <td>
                <Badge size="sm" variant={resultVariant(match.result)}>
                  {FACEIT_RESULT_LABELS[match.result] || match.result}
                </Badge>
              </td>
              <td>{match.score || '—'}</td>
              <td>{formatNumber(match.stats?.kd, 2)}</td>
              <td>{formatNumber(match.stats?.adr, 1)}</td>
              <td>{formatPercent(match.stats?.headshot_percentage)}</td>
              <td>
                {match.faceit_url ? (
                  <a
                    href={match.faceit_url}
                    target="_blank"
                    rel="noreferrer"
                    className="faceit-link"
                  >
                    Ver en FACEIT
                  </a>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
