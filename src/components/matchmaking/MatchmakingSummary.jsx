import StatCard from '../profile/StatCard.jsx'
import {
  AssistIcon,
  ChartIcon,
  CrosshairIcon,
  PercentIcon,
  SkullIcon,
  TrophyIcon,
} from '../profile/icons.jsx'
import {
  formatInteger,
  formatNumber,
  formatPercent,
} from '../profile/format.js'

function buildStats(summary) {
  return [
    {
      icon: <TrophyIcon />,
      value: formatInteger(summary.matches_played),
      label: 'Partidas',
      hint: 'Demos procesadas',
    },
    {
      icon: <PercentIcon />,
      value: formatPercent(summary.win_rate),
      label: 'Win rate',
      hint: `${formatInteger(summary.wins)} V / ${formatInteger(summary.losses)} D`,
    },
    {
      icon: <CrosshairIcon />,
      value: `${formatInteger(summary.kills)} / ${formatInteger(summary.deaths)} / ${formatInteger(summary.assists)}`,
      label: 'K / D / A',
      hint: 'Totales de las demos procesadas',
    },
    {
      icon: <ChartIcon />,
      value: formatNumber(summary.kd),
      label: 'K/D',
      hint: 'Kills dividido muertes',
    },
    {
      icon: <ChartIcon />,
      value: formatNumber(summary.adr, 1),
      label: 'ADR',
      hint: 'Daño por ronda (ponderado)',
    },
    {
      icon: <PercentIcon />,
      value: formatPercent(summary.hs_percentage),
      label: 'HS%',
      hint: 'Headshots sobre kills',
    },
    {
      icon: <PercentIcon />,
      value: formatPercent(summary.kast_percentage),
      label: 'KAST',
      hint: 'Rondas con kill, asistencia, supervivencia o trade',
    },
    {
      icon: <TrophyIcon />,
      value: formatInteger(summary.mvps),
      label: 'MVP',
      hint: 'MVPs de las rondas',
    },
    {
      icon: <CrosshairIcon />,
      value: formatInteger(summary.opening_kills),
      label: 'Opening kills',
      hint: 'Primeras muertes de ronda',
    },
    {
      icon: <SkullIcon />,
      value: formatInteger(summary.opening_deaths),
      label: 'Opening deaths',
      hint: 'Primeras muertes recibidas',
    },
    {
      icon: <AssistIcon />,
      value: formatInteger(summary.clutches),
      label: 'Clutches',
      hint: 'Rondas 1vX ganadas',
    },
    {
      icon: <ChartIcon />,
      value: formatInteger(summary.rounds_played),
      label: 'Rondas',
      hint: `${formatInteger(summary.rounds_won)} ganadas / ${formatInteger(summary.rounds_lost)} perdidas`,
    },
  ]
}

export default function MatchmakingSummary({ summary }) {
  return (
    <div className="mm-summary">
      <div className="mm-summary-head">
        <h3>Acumulados de matchmaking</h3>
        <span className="mm-summary-note">
          Suma de numeradores y denominadores; no se promedian porcentajes.
        </span>
      </div>
      <div className="player-stats-grid">
        {buildStats(summary).map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  )
}
