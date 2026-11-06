import Alert from '../common/Alert.jsx'
import Badge from '../common/Badge.jsx'
import Modal from '../common/Modal.jsx'
import {
  formatDateTime,
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

function DetailRow({ label, children }) {
  return (
    <div className="mm-detail-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

export default function MatchmakingMatchDetail({
  open,
  match,
  owner = false,
  loading = false,
  error = '',
  onClose,
}) {
  if (!open || !match) return null

  const status = match.status || 'AWAITING_DEMO'

  return (
    <Modal
      open={open}
      title={`Partida · ${match.map || 'Mapa desconocido'}`}
      onClose={onClose}
      size="modal-lg"
    >
      {loading && <p className="text-muted">Cargando el detalle de la partida…</p>}
      <Alert>{error}</Alert>

      <div className="mm-detail-head">
        <Badge size="sm" variant={DEMO_STATUS_VARIANTS[status] || 'neutral'}>
          {DEMO_STATUS_LABELS[status] || match.status_label || status}
        </Badge>
        <Badge size="sm" variant="neutral">
          {SOURCE_LABELS[match.source] || match.source}
        </Badge>
      </div>

      <dl className="mm-detail-grid">
        <DetailRow label="Fecha">{formatDateTime(match.played_at)}</DetailRow>
        <DetailRow label="Mapa">{match.map || 'Mapa desconocido'}</DetailRow>
        <DetailRow label="Resultado">
          <span className={`mm-result mm-result-${(match.result || '').toLowerCase()}`}>
            {RESULT_LABELS[match.result] || RESULT_LABELS.UNKNOWN}
          </span>
        </DetailRow>
        <DetailRow label="Tu equipo / rival">
          {match.team_score === null || match.team_score === undefined
            ? 'Sin marcador'
            : `${formatInteger(match.team_score)} - ${formatInteger(match.opponent_score)}`}
        </DetailRow>
        <DetailRow label="Rondas">
          {formatInteger(match.rounds_played)} jugadas ·{' '}
          {formatInteger(match.rounds_won)} ganadas ·{' '}
          {formatInteger(match.rounds_lost)} perdidas
        </DetailRow>
      </dl>

      {match.has_stats ? (
        <>
          <dl className="mm-detail-grid mm-detail-stats">
            <DetailRow label="Kills / deaths / assists">
              {`${formatInteger(match.kills)} / ${formatInteger(match.deaths)} / ${formatInteger(match.assists)}`}
            </DetailRow>
            <DetailRow label="K/D">{formatNumber(match.kd)}</DetailRow>
            <DetailRow label="ADR">{formatNumber(match.adr, 1)}</DetailRow>
            <DetailRow label="HS%">{formatPercent(match.hs_percentage)}</DetailRow>
            <DetailRow label="KAST">{formatPercent(match.kast_percentage)}</DetailRow>
            <DetailRow label="Daño total">{formatInteger(match.damage)}</DetailRow>
            <DetailRow label="Headshots">{formatInteger(match.headshot_kills)}</DetailRow>
            <DetailRow label="MVPs">{formatInteger(match.mvps)}</DetailRow>
            <DetailRow label="Clutches">{formatInteger(match.clutches)}</DetailRow>
            <DetailRow label="Opening kills">
              {formatInteger(match.opening_kills)}
            </DetailRow>
            <DetailRow label="Opening deaths">
              {formatInteger(match.opening_deaths)}
            </DetailRow>
          </dl>
          <p className="mm-note">
            Estadísticas calculadas a partir de la demo oficial de la partida.
            No se estiman valores faltantes.
          </p>
        </>
      ) : (
        <Alert variant="warning">
          Todavía no hay estadísticas de esta partida. Se completarán cuando el
          worker procese su demo oficial.
        </Alert>
      )}

      {owner && match.processing_error && (
        <Alert variant="error">{match.processing_error}</Alert>
      )}

      {owner && match.share_code && (
        <p className="mm-detail-code">
          Share code: <code>{match.share_code}</code>
        </p>
      )}
      {owner && match.processed_at && (
        <p className="mm-note">
          Procesada el {formatDateTime(match.processed_at)}
          {match.attempts ? ` · ${match.attempts} intento(s)` : ''}.
        </p>
      )}
    </Modal>
  )
}
