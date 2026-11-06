import { useEffect, useState } from 'react'

function initialFor(profile) {
  const source = profile?.nickname || profile?.username || '?'
  return source.charAt(0).toUpperCase()
}

export default function PlayerAvatar({ profile, size = 'md' }) {
  const [failed, setFailed] = useState(false)
  const avatarUrl = profile?.avatar_url

  useEffect(() => {
    setFailed(false)
  }, [avatarUrl])

  if (avatarUrl && !failed) {
    return (
      <img
        className={`player-avatar player-avatar-${size}`}
        src={avatarUrl}
        alt={`Avatar de ${profile?.nickname || profile?.username || 'jugador'}`}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div className={`player-avatar player-avatar-${size}`} aria-hidden="true">
      {initialFor(profile)}
    </div>
  )
}
