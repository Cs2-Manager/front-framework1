import EmptyState from '../common/EmptyState.jsx'
import SourceBadge from '../steam/SourceBadge.jsx'
import StatCard from './StatCard.jsx'
import { formatInteger, formatNumber, formatPercent } from './format.js'
import {
  AssistIcon,
  ChartIcon,
  CrosshairIcon,
  PercentIcon,
  SkullIcon,
  TrophyIcon,
} from './icons.jsx'

function buildStats(stats) {
  return [
    {
      icon: <CrosshairIcon />,
      value: formatInteger(stats.kills),
      label: 'Kills',
      hint: 'Eliminaciones totales',
    },
    {
      icon: <SkullIcon />,
      value: formatInteger(stats.deaths),
      label: 'Deaths',
      hint: 'Muertes totales',
    },
    {
      icon: <AssistIcon />,
      value: formatInteger(stats.assists),
      label: 'Assists',
      hint: 'Asistencias totales',
    },
    {
      icon: <CrosshairIcon />,
      value: formatNumber(stats.kd),
      label: 'K/D',
      hint: 'Kills por muerte',
    },
    {
      icon: <ChartIcon />,
      value: formatNumber(stats.kr),
      label: 'K/R',
      hint: 'Kills por ronda',
    },
    {
      icon: <SkullIcon />,
      value: formatNumber(stats.adr, 1),
      label: 'ADR',
      hint: 'Daño promedio por ronda',
    },
    {
      icon: <PercentIcon />,
      value: formatPercent(stats.headshot_percentage),
      label: 'HS%',
      hint: 'Porcentaje de headshots',
    },
    {
      icon: <TrophyIcon />,
      value: formatInteger(stats.matches_played),
      label: 'Partidas',
      hint: 'Partidas registradas',
    },
    {
      icon: <TrophyIcon />,
      value: formatInteger(stats.wins),
      label: 'Victorias',
      hint: 'Partidas ganadas',
    },
    {
      icon: <SkullIcon />,
      value: formatInteger(stats.losses),
      label: 'Derrotas',
      hint: 'Partidas perdidas',
    },
    {
      icon: <AssistIcon />,
      value: formatPercent(stats.win_rate),
      label: 'Win rate',
      hint: 'Porcentaje de victorias',
    },
  ]
}

export default function StatsGrid({ stats }) {
  return (
    <section className="player-panel">
      <div className="player-panel-head">
        <h2>Estadísticas CS2</h2>
        {stats?.has_data && <SourceBadge source={stats.source || 'MANUAL'} />}
      </div>

      {!stats?.has_data ? (
        <EmptyState message="Todavía no hay estadísticas de CS2 registradas. Se mostrarán cuando se carguen partidas reales." />
      ) : (
        <div className="player-stats-grid">
          {buildStats(stats).map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      )}
    </section>
  )
}
