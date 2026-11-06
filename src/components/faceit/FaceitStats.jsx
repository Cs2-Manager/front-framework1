import {
  formatInteger,
  formatNumber,
  formatPercent,
} from '../profile/format.js'
import SourceBadge from '../steam/SourceBadge.jsx'

const STAT_ROWS = [
  ['Partidas', 'matches_played', formatInteger],
  ['Victorias', 'wins', formatInteger],
  ['Derrotas', 'losses', formatInteger],
  ['Win rate', 'win_rate', formatPercent],
  ['Kills', 'kills', formatInteger],
  ['Deaths', 'deaths', formatInteger],
  ['Assists', 'assists', formatInteger],
  ['K/D', 'kd', (value) => formatNumber(value, 2)],
  ['K/R', 'kr', (value) => formatNumber(value, 2)],
  ['ADR', 'adr', (value) => formatNumber(value, 1)],
  ['Headshots', 'headshots', formatInteger],
  ['HS %', 'headshot_percentage', formatPercent],
  ['MVPs', 'mvps', formatInteger],
  ['Rondas', 'rounds_played', formatInteger],
]

export default function FaceitStats({ stats }) {
  if (!stats?.available) {
    return (
      <div className="faceit-empty">
        <p>
          FACEIT todavía no entregó estadísticas de por vida para esta cuenta.
          No completamos valores estimados.
        </p>
      </div>
    )
  }

  return (
    <div className="faceit-stats-block">
      <div className="faceit-subhead">
        <h3>Estadísticas verificadas</h3>
        <SourceBadge source={stats.source} />
      </div>
      <dl className="faceit-stats">
        {STAT_ROWS.map(([label, field, formatter]) => (
          <div key={field} className="faceit-stat">
            <dt>{label}</dt>
            <dd>{formatter(stats[field])}</dd>
          </div>
        ))}
      </dl>
      {stats.fetched_at ? (
        <p className="faceit-note">
          Última consulta a FACEIT: {new Date(stats.fetched_at).toLocaleString('es-ES')}.
        </p>
      ) : null}
    </div>
  )
}
