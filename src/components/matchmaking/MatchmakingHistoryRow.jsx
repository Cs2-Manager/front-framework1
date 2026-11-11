import Badge from '../common/Badge.jsx'
import {
  formatDate,
  formatInteger,
  formatNumber,
  formatPercent,
} from '../profile/format.js'
import {
  DEMO_STATUS_LABELS,
  DEMO_STATUS_VARIANTS,
  RESULT_LABELS,
  SOURCE_LABELS,
} from './matchmakingMessages.js'

/** Fila del historial con métricas solo cuando la demo fue procesada. */
export default function MatchmakingHistoryRow({ match, onOpen }) {
  const status = match.status || 'AWAITING_DEMO'
  const hasStats = Boolean(match.has_stats)
  const label = match.map || 'Mapa desconocido'

  return (
    <tr>
      <td data-label="Fecha">{formatDate(match.played_at)}</td>
      <td data-label="Mapa">{label}</td>
      <td data-label="Resultado">
        <span
          className={`mm-result mm-result-${(match.result || '').toLowerCase()}`}
        >
          {RESULT_LABELS[match.result] || RESULT_LABELS.UNKNOWN}
        </span>
      </td>
      <td data-label="Equipo / rival">
        {match.team_score === null || match.team_score === undefined
          ? '—'
          : `${formatInteger(match.team_score)} - ${formatInteger(match.opponent_score)}`}
      </td>
      <td data-label="K / D / A">
        {hasStats
          ? `${formatInteger(match.kills)} / ${formatInteger(match.deaths)} / ${formatInteger(match.assists)}`
          : '—'}
      </td>
      <td data-label="ADR">{hasStats ? formatNumber(match.adr, 1) : '—'}</td>
      <td data-label="HS%">
        {hasStats ? formatPercent(match.hs_percentage) : '—'}
      </td>
      <td data-label="Rondas">{formatInteger(match.rounds_played)}</td>
      <td data-label="Fuente">
        <div className="mm-source">
          <Badge size="sm" variant={DEMO_STATUS_VARIANTS[status] || 'neutral'}>
            {DEMO_STATUS_LABELS[status] || match.status_label || status}
          </Badge>
          <span className="mm-source-label">
            {SOURCE_LABELS[match.source] || match.source}
          </span>
        </div>
      </td>
      <td data-label="Detalle">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          aria-label={`Ver detalle de la partida en ${label}`}
          onClick={() => onOpen(match)}
        >
          Ver
        </button>
      </td>
    </tr>
  )
}
