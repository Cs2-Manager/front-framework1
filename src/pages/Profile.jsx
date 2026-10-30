import { useAuth } from '../context/AuthContext.jsx'
import ProfileHeader from '../components/profile/ProfileHeader.jsx'
import ProfileActions from '../components/profile/ProfileActions.jsx'
import StatCard from '../components/profile/StatCard.jsx'
import {
  AccountIcon,
  CalendarIcon,
  IdIcon,
  MailIcon,
} from '../components/profile/icons.jsx'

function formatDate(value) {
  if (!value) return 'No disponible'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No disponible'
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function buildStats(user) {
  return [
    { icon: <AccountIcon />, value: user.username, label: 'Nombre de usuario' },
    { icon: <MailIcon />, value: user.email, label: 'Correo electrónico' },
    { icon: <IdIcon />, value: `#${user.id}`, label: 'Identificador' },
    {
      icon: <CalendarIcon />,
      value: formatDate(user.created_at),
      label: 'Miembro desde',
    },
  ]
}

function ProfileLoading() {
  return (
    <div className="page container page-profile">
      <div className="profile-loading" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        <p>Cargando perfil…</p>
      </div>
    </div>
  )
}

function ProfileStats({ user }) {
  return (
    <div className="profile-stats">
      {buildStats(user).map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  )
}

function ProfileSections({ user, onLogout }) {
  return (
    <div className="profile-content">
      <section className="profile-section">
        <h2>Información de la cuenta</h2>
        <ProfileStats user={user} />
      </section>
      <section className="profile-section">
        <h2>Acciones</h2>
        <ProfileActions onLogout={onLogout} />
      </section>
    </div>
  )
}

export default function Profile() {
  const { user, logout } = useAuth()

  if (!user) return <ProfileLoading />

  return (
    <div className="page container page-profile">
      <div className="profile-card fade-in-up">
        <ProfileHeader user={user} onLogout={logout} />
        <ProfileSections user={user} onLogout={logout} />
      </div>
    </div>
  )
}
