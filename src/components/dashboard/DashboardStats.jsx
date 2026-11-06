import StatCard from '../profile/StatCard.jsx'
import { LineupIcon, MapIcon, WorkshopIcon, ZoneIcon } from './icons.jsx'

function categoryLabel(count) {
  return count === 1 ? '1 categoría' : `${count} categorías`
}

function buildStats({ maps, lineups, workshop_maps: workshop }) {
  const usedTypes = lineups.by_type.filter((item) => item.count > 0).length

  return [
    {
      icon: <MapIcon />,
      value: maps.total,
      label: 'Mapas',
      hint: `${maps.active_pool} en pool activo`,
    },
    {
      icon: <ZoneIcon />,
      value: maps.callouts,
      label: 'Zonas / callouts',
      hint: maps.total ? `En ${maps.total} mapas` : 'Sin mapas cargados',
    },
    {
      icon: <LineupIcon />,
      value: lineups.total,
      label: 'Lineups',
      hint: `${usedTypes} de ${lineups.by_type.length} utilidades`,
    },
    {
      icon: <WorkshopIcon />,
      value: workshop.total,
      label: 'Mapas de Workshop',
      hint: categoryLabel(workshop.categories),
    },
  ]
}

export default function DashboardStats({ summary }) {
  return (
    <section className="dashboard-section" aria-labelledby="dashboard-stats-title">
      <h2 id="dashboard-stats-title" className="dashboard-section-title">
        Resumen de la biblioteca
      </h2>
      <div className="dashboard-stats">
        {buildStats(summary).map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </section>
  )
}
