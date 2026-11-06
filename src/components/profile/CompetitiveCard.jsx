import Badge from '../common/Badge.jsx'
import EmptyState from '../common/EmptyState.jsx'
import { formatInteger } from './format.js'
import { ChartIcon, TrophyIcon } from './icons.jsx'

const STATUS_LABELS = {
  UNRANKED: 'Sin clasificar',
  RANKED: 'Clasificado',
  INACTIVE: 'Inactivo',
}

function statusVariant(status) {
  if (status === 'RANKED') return 'success'
  if (status === 'INACTIVE') return 'warning'
  return 'neutral'
}

function StatusBadge({ status }) {
  return (
    <Badge variant={statusVariant(status)}>
      {STATUS_LABELS[status] || 'Sin clasificar'}
    </Badge>
  )
}

function CompetitiveMetric({ label, value, icon }) {
  return (
    <div className="player-metric">
      <span className="player-metric-icon" aria-hidden="true">
        {icon}
      </span>
      <div>
        <div className="player-metric-value">{value}</div>
        <div className="player-metric-label">{label}</div>
      </div>
    </div>
  )
}

function XpProgress({ competitive }) {
  const xp = competitive?.xp
  const remaining = competitive?.xp_to_next_level
  if (xp == null || remaining == null) return null

  const total = xp + remaining
  if (total <= 0) return null
  const percent = Math.min(100, Math.round((xp / total) * 100))

  return (
    <div className="player-xp">
      <div className="player-xp-head">
        <span>Progreso al siguiente nivel</span>
        <strong>{percent}%</strong>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="Progreso de XP"
      >
        <span className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export default function CompetitiveCard({ competitive }) {
  const status = competitive?.status || 'UNRANKED'
  const hasData =
    competitive &&
    (competitive.elo != null ||
      competitive.level != null ||
      competitive.xp != null ||
      competitive.ranking_position != null)

  return (
    <section className="player-panel">
      <div className="player-panel-head">
        <h2>Rango competitivo</h2>
        <StatusBadge status={status} />
      </div>

      {!hasData ? (
        <EmptyState message="Todavía no hay datos competitivos verificados. El nivel, ELO y XP aparecerán cuando exista una fuente real." />
      ) : (
        <>
          <div className="player-metrics">
            <CompetitiveMetric
              label="Nivel"
              value={formatInteger(competitive.level)}
              icon={<ChartIcon />}
            />
            <CompetitiveMetric
              label="ELO"
              value={formatInteger(competitive.elo)}
              icon={<TrophyIcon />}
            />
            <CompetitiveMetric
              label="XP"
              value={formatInteger(competitive.xp)}
              icon={<ChartIcon />}
            />
            {competitive.xp_to_next_level != null && (
              <CompetitiveMetric
                label="XP para subir"
                value={formatInteger(competitive.xp_to_next_level)}
                icon={<ChartIcon />}
              />
            )}
            {competitive.ranking_position != null && (
              <CompetitiveMetric
                label="Ranking"
                value={`#${formatInteger(competitive.ranking_position)}`}
                icon={<TrophyIcon />}
              />
            )}
          </div>
          <XpProgress competitive={competitive} />
        </>
      )}
    </section>
  )
}
