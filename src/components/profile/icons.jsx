import Icon from '../common/Icon.jsx'

export function AccountIcon() {
  return (
    <Icon>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="M5 20a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4" />
      <line x1="15" y1="10" x2="19" y2="10" />
      <line x1="15" y1="14" x2="19" y2="14" />
    </Icon>
  )
}

export function MailIcon() {
  return (
    <Icon>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </Icon>
  )
}

export function IdIcon() {
  return (
    <Icon>
      <path d="M4 7h16" />
      <path d="M4 12h10" />
      <path d="M4 17h7" />
    </Icon>
  )
}

export function CalendarIcon() {
  return (
    <Icon>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </Icon>
  )
}

export function HomeIcon() {
  return (
    <Icon size={16}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </Icon>
  )
}

export function WrenchIcon() {
  return (
    <Icon size={16}>
      <path d="m14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.1-2.1z" />
    </Icon>
  )
}

export function LogoutIcon() {
  return (
    <Icon size={16}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </Icon>
  )
}
