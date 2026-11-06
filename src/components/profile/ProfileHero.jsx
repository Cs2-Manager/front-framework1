import { Link } from 'react-router-dom'

import Badge from '../common/Badge.jsx'
import { formatDate, formatDateTime } from './format.js'
import PlayerAvatar from './PlayerAvatar.jsx'
import {
  ArrowLeftIcon,
  CalendarIcon,
  EditIcon,
  GlobeIcon,
  LogoutIcon,
  ShieldIcon,
} from './icons.jsx'

function VisibilityBadge({ visibility }) {
  const isPublic = visibility === 'PUBLIC'
  return (
    <Badge
      className={`player-visibility ${isPublic ? 'public' : 'private'}`}
      variant={isPublic ? 'success' : 'neutral'}
    >
      <ShieldIcon />
      {isPublic ? 'Perfil público' : 'Perfil privado'}
    </Badge>
  )
}

function ProfileMeta({ profile }) {
  return (
    <div className="player-meta">
      {profile.country && (
        <span className="player-meta-item">
          <GlobeIcon />
          {profile.country}
        </span>
      )}
      <span className="player-meta-item">
        <CalendarIcon />
        Miembro desde {formatDate(profile.member_since)}
      </span>
      <span className="player-meta-item">
        Última actividad: {formatDateTime(profile.last_active_at)}
      </span>
    </div>
  )
}

function HeroActions({ owner, onLogout }) {
  if (!owner) {
    return (
      <Link to="/players" className="btn btn-ghost">
        <ArrowLeftIcon />
        Volver a jugadores
      </Link>
    )
  }

  return (
    <div className="player-hero-actions">
      <Link to="/profile/edit" className="btn btn-primary">
        <EditIcon />
        Editar perfil
      </Link>
      {onLogout && (
        <button type="button" className="btn btn-danger" onClick={onLogout}>
          <LogoutIcon />
          Cerrar sesión
        </button>
      )}
    </div>
  )
}

export default function ProfileHero({ profile, owner = false, onLogout }) {
  const name = profile.display_name || profile.nickname

  return (
    <header className="player-hero">
      <div className="player-hero-glow" aria-hidden="true" />
      <div className="player-avatar-wrap">
        <PlayerAvatar profile={profile} size="lg" />
      </div>
      <div className="player-identity">
        <div className="player-name-row">
          <h1>{name}</h1>
          {owner && <VisibilityBadge visibility={profile.visibility} />}
        </div>
        <p className="player-nickname">@{profile.nickname}</p>
        <ProfileMeta profile={profile} />
        {profile.bio && <p className="player-bio">{profile.bio}</p>}
        {profile.steam_url && (
          <a
            className="player-steam-link"
            href={profile.steam_url}
            target="_blank"
            rel="noreferrer"
          >
            Ver perfil de Steam
          </a>
        )}
      </div>
      <div className="player-hero-actions-wrap">
        <HeroActions owner={owner} onLogout={onLogout} />
      </div>
    </header>
  )
}
