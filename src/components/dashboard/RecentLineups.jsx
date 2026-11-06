import { Link, useNavigate } from 'react-router-dom'

import EmptyState from '../common/EmptyState.jsx'

function LineupItem({ lineup }) {
  return (
    <li className="dashboard-lineup-item">
      <div className="dashboard-lineup-main">
        <Link to="/lineups" className="dashboard-lineup-title">
          {lineup.title}
        </Link>
        <span>{lineup.map_name}</span>
      </div>
      <div className="dashboard-lineup-tags">
        <span className="dashboard-tag">{lineup.type}</span>
        <span className="dashboard-tag dashboard-tag-side">{lineup.side}</span>
      </div>
    </li>
  )
}

function UtilityBreakdown({ byType }) {
  const total = byType.reduce((sum, item) => sum + item.count, 0)
  if (total === 0) return null

  return (
    <div className="dashboard-breakdown">
      <h3>Cobertura por utilidad</h3>
      <ul className="dashboard-breakdown-list">
        {byType.map(({ type, count }) => (
          <li
            key={type}
            className={`dashboard-breakdown-item${count === 0 ? ' empty' : ''}`}
          >
            <span>{type}</span>
            <strong>{count}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function RecentLineups({ lineups, byType }) {
  const navigate = useNavigate()

  return (
    <section className="dashboard-panel" aria-labelledby="dashboard-lineups-title">
      <div className="dashboard-panel-head">
        <h2 id="dashboard-lineups-title">Lineups recientes</h2>
        <Link to="/lineups" className="dashboard-panel-link">
          Ver biblioteca
        </Link>
      </div>
      {lineups.length === 0 ? (
        <EmptyState
          message="Todavía no hay lineups cargados."
          actionLabel="Crear un lineup"
          onAction={() => navigate('/lineups')}
        />
      ) : (
        <ul className="dashboard-lineup-list">
          {lineups.map((lineup) => (
            <LineupItem key={lineup.id} lineup={lineup} />
          ))}
        </ul>
      )}
      <UtilityBreakdown byType={byType} />
    </section>
  )
}
