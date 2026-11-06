import { useEffect, useState } from 'react'

import {
  fetchMatchmakingMatches,
  fetchMatchmakingMatch,
} from '../../services/matchmaking.js'
import { getErrorMessage } from '../../utils/errors.js'
import Alert from '../common/Alert.jsx'
import Badge from '../common/Badge.jsx'
import EmptyState from '../common/EmptyState.jsx'
import {
  formatDate,
  formatInteger,
  formatNumber,
  formatPercent,
} from '../profile/format.js'
import MatchmakingMatchDetail from './MatchmakingMatchDetail.jsx'
import {
  DEMO_STATUS_LABELS,
  DEMO_STATUS_VARIANTS,
  MATCHMAKING_ERRORS,
  RESULT_LABELS,
  SOURCE_LABELS,
} from './matchmakingMessages.js'

function MatchRow({ match, onOpen }) {
  const status = match.status || 'AWAITING_DEMO'
  const hasStats = Boolean(match.has_stats)
  const label = match.map || 'Mapa desconocido'

  return (
    <tr>
      <td data-label="Fecha">{formatDate(match.played_at)}</td>
      <td data-label="Mapa">{label}</td>
      <td data-label="Resultado">
        <span className={`mm-result mm-result-${(match.result || '').toLowerCase()}`}>
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

export default function MatchmakingHistory({ matches = [], owner = false }) {
  const [items, setItems] = useState(matches)
  const [loadingAll, setLoadingAll] = useState(false)
  const [loadedAll, setLoadedAll] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  useEffect(() => {
    setItems(matches)
  }, [matches])

  async function handleLoadAll() {
    setLoadingAll(true)
    setError('')
    try {
      const data = await fetchMatchmakingMatches({ limit: 100 })
      setItems(data.matches || [])
      setLoadedAll(true)
    } catch (err) {
      setError(getErrorMessage(err, MATCHMAKING_ERRORS.history))
    } finally {
      setLoadingAll(false)
    }
  }

  async function handleOpen(match) {
    setSelected(match)
    setDetailOpen(true)
    setDetailError('')
    if (!owner) return

    setDetailLoading(true)
    try {
      const data = await fetchMatchmakingMatch(match.id)
      setSelected(data.match)
    } catch (err) {
      setDetailError(getErrorMessage(err, MATCHMAKING_ERRORS.detail))
    } finally {
      setDetailLoading(false)
    }
  }

  function handleCloseDetail() {
    setDetailOpen(false)
    setSelected(null)
    setDetailError('')
  }

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
                <MatchRow key={match.id} match={match} onOpen={handleOpen} />
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
