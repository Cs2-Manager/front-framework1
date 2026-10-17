import Icon from '../common/Icon.jsx'

export function UserIcon({ size = 16 }) {
  return (
    <Icon size={size} className="icon">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Icon>
  )
}

export function LogoutIcon({ size = 16 }) {
  return (
    <Icon size={size} className="icon">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </Icon>
  )
}

export function ChevronIcon({ open = false }) {
  return (
    <Icon size={16} className={`profile-chevron ${open ? 'open' : ''}`}>
      <polyline points="6 9 12 15 18 9" />
    </Icon>
  )
}
