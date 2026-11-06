import { Link } from 'react-router-dom'

import Alert from '../common/Alert.jsx'
import Badge from '../common/Badge.jsx'
import PlayerAvatar from '../profile/PlayerAvatar.jsx'
import { formatInteger, formatPercent } from '../profile/format.js'
import { useOwnProfile } from '../../hooks/useProfile.js'

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

function ProfileSkeleton() {
  return (
    <div className="dashboard-profile-skeleton" aria-hidden="true">
      <span className="skeleton skeleton-avatar" />
      <span className="dashboard-profile-skeleton-copy">
        <span className="skeleton skeleton-line" style={{ width: '45%' }} />
        <span className="skeleton skeleton-line" style={{ width: '70%' }} />
      </span>
    </div>
  )
}

function XpProgress({ competitive }) {
  const current = competitive?.xp
  const remaining = competitive?.xp_to_next_level
  if (current == null || remaining == null) return null

  const total = current + remaining
  if (total <= 0) return null
  const percent = Math.min(100, Math.round((current / total) * 100))

  return (
    <div className="dashboard-xp">
      <div className="dashboard-xp-head">
        <span>Progreso de XP</span>
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

export default function DashboardProfileSummary() {
  const { data: profile, loading, error, reload } = useOwnProfile()

  return (
    <section
      className="dashboard-panel dashboard-profile-panel"
      aria-labelledby="dashboard-profile-title"
    >
      <div className="dashboard-panel-head">
        <h2 id="dashboard-profile-title">Perfil competitivo</h2>
        <Link to="/profile" className="dashboard-panel-link">
          Ver perfil
        </Link>
      </div>

      {loading && <ProfileSkeleton />}
      {!loading && error && (
        <div className="dashboard-inline-error">
          <Alert>{error}</Alert>
          <button type="button" className="btn btn-sm btn-ghost" onClick={reload}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && profile && (
        <>
          <div className="dashboard-profile-head">
            <PlayerAvatar profile={profile} size="md" />
            <div className="dashboard-profile-identity">
              <strong>{profile.display_name || profile.nickname}</strong>
              <span>@{profile.nickname}</span>
              <div className="dashboard-profile-tags">
                {profile.country && <Badge size="sm">{profile.country}</Badge>}
                <Badge
                  size="sm"
                  variant={statusVariant(profile.competitive?.status)}
                >
                  {STATUS_LABELS[profile.competitive?.status] || 'Sin clasificar'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="dashboard-profile-metrics">
            <div className="dashboard-metric">
              <span>Nivel</span>
              <strong>{formatInteger(profile.competitive?.level)}</strong>
            </div>
            <div className="dashboard-metric">
              <span>ELO</span>
              <strong>{formatInteger(profile.competitive?.elo)}</strong>
            </div>
            <div className="dashboard-metric">
              <span>Partidas</span>
              <strong>{formatInteger(profile.stats?.matches_played)}</strong>
            </div>
            <div className="dashboard-metric">
              <span>Win rate</span>
              <strong>{formatPercent(profile.stats?.win_rate)}</strong>
            </div>
          </div>

          <XpProgress competitive={profile.competitive} />
        </>
      )}
    </section>
  )
}
