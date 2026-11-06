import Alert from '../common/Alert.jsx'
import Badge from '../common/Badge.jsx'
import { formatDateTime, formatNumber } from '../profile/format.js'
import SourceBadge from './SourceBadge.jsx'

const OWNERSHIP_LABELS = {
  OWNED: 'En biblioteca',
  PRIVATE: 'Biblioteca privada',
  NOT_AVAILABLE: 'Sin datos de Steam',
  UNKNOWN: 'Desconocido',
}

function formatPlaytime(minutes) {
  if (minutes === null || minutes === undefined) return '—'
  return `${formatNumber(minutes / 60, 1)} h`
}

function PlaytimeRow({ label, children }) {
  return (
    <div className="steam-cs2-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

export default function SteamCs2Panel({ steam }) {
  if (!steam?.linked) return null

  const cs2 = steam.cs2 || {}
  const statsAvailable = Boolean(cs2.stats_available)

  return (
    <section className="player-panel steam-cs2-panel">
      <div className="player-panel-head">
        <h2>CS2 · Steam</h2>
        <SourceBadge source={cs2.source || 'UNAVAILABLE'} />
      </div>

      {cs2.playtime_available ? (
        <dl className="steam-cs2-grid">
          <PlaytimeRow label="Tiempo de juego total">
            <strong>{formatPlaytime(cs2.playtime_forever_minutes)}</strong>
          </PlaytimeRow>
          <PlaytimeRow label="Últimas dos semanas">
            {formatPlaytime(cs2.playtime_two_weeks_minutes)}
          </PlaytimeRow>
          <PlaytimeRow label="Última partida registrada en Steam">
            {formatDateTime(cs2.last_played_at)}
          </PlaytimeRow>
          <PlaytimeRow label="Propiedad">
            <Badge size="sm" variant="success">
              {OWNERSHIP_LABELS[cs2.ownership] || OWNERSHIP_LABELS.UNKNOWN}
            </Badge>
          </PlaytimeRow>
        </dl>
      ) : (
        <Alert variant="warning">
          {cs2.unavailable_reason ||
            'Steam no devolvió el tiempo de juego de CS2 para esta cuenta.'}
        </Alert>
      )}

      <div className="steam-cs2-stats">
        <div>
          <h3>Estadísticas de juego y historial de partidas</h3>
          <p className="text-muted">
            {statsAvailable
              ? 'Datos disponibles desde una fuente verificada.'
              : 'La Web API oficial de Steam no expone kills, deaths, ADR, rangos ni historial de partidas de CS2. No completamos estos valores de forma estimada.'}
          </p>
        </div>
        <Badge size="sm" variant={statsAvailable ? 'success' : 'neutral'}>
          {statsAvailable ? 'Disponible' : 'No disponible'}
        </Badge>
      </div>

      {cs2.fetched_at && (
        <p className="steam-card-note">
          Datos consultados el {formatDateTime(cs2.fetched_at)}.
        </p>
      )}
    </section>
  )
}
