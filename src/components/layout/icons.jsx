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

export function InboxIcon({ size = 16 }) {
  return (
    <Icon size={size} className="icon">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
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

export function BellIcon({ size = 18 }) {
  return (
    <Icon size={size} className="icon">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </Icon>
  )
}
