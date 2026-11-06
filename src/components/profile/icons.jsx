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

export function EditIcon({ size = 16 }) {
  return (
    <Icon size={size}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </Icon>
  )
}

export function SearchIcon({ size = 16 }) {
  return (
    <Icon size={size}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Icon>
  )
}

export function ArrowLeftIcon({ size = 16 }) {
  return (
    <Icon size={size}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </Icon>
  )
}

export function TrophyIcon({ size = 20 }) {
  return (
    <Icon size={size}>
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M7 6H4a3 3 0 0 0 3 3" />
      <path d="M17 6h3a3 3 0 0 1-3 3" />
    </Icon>
  )
}

export function CrosshairIcon({ size = 20 }) {
  return (
    <Icon size={size}>
      <circle cx="12" cy="12" r="8" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <circle cx="12" cy="12" r="2" />
    </Icon>
  )
}

export function SkullIcon({ size = 20 }) {
  return (
    <Icon size={size}>
      <path d="M12 3a7 7 0 0 0-7 7c0 2.2 1 3.6 2 4.5V18h10v-3.5c1-.9 2-2.3 2-4.5a7 7 0 0 0-7-7z" />
      <circle cx="9" cy="11" r="1" />
      <circle cx="15" cy="11" r="1" />
      <path d="M10 18v3M14 18v3" />
    </Icon>
  )
}

export function AssistIcon({ size = 20 }) {
  return (
    <Icon size={size}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 4v6M13 7h6" />
    </Icon>
  )
}

export function PercentIcon({ size = 20 }) {
  return (
    <Icon size={size}>
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="7" cy="7" r="2" />
      <circle cx="17" cy="17" r="2" />
    </Icon>
  )
}

export function ChartIcon({ size = 20 }) {
  return (
    <Icon size={size}>
      <line x1="4" y1="20" x2="20" y2="20" />
      <line x1="7" y1="20" x2="7" y2="13" />
      <line x1="12" y1="20" x2="12" y2="8" />
      <line x1="17" y1="20" x2="17" y2="4" />
    </Icon>
  )
}

export function MapIcon({ size = 20 }) {
  return (
    <Icon size={size}>
      <path d="M9 20l-5.5 2V6L9 4l6 2 5.5-2v16L15 22l-6-2z" />
      <line x1="9" y1="4" x2="9" y2="20" />
      <line x1="15" y1="6" x2="15" y2="22" />
    </Icon>
  )
}

export function GlobeIcon({ size = 16 }) {
  return (
    <Icon size={size}>
      <circle cx="12" cy="12" r="9" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </Icon>
  )
}

export function LinkIcon({ size = 16 }) {
  return (
    <Icon size={size}>
      <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
    </Icon>
  )
}

export function ShieldIcon({ size = 16 }) {
  return (
    <Icon size={size}>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
    </Icon>
  )
}

export function UsersIcon({ size = 20 }) {
  return (
    <Icon size={size}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <circle cx="17" cy="9" r="2" />
      <path d="M15 20a5 5 0 0 1 6-4" />
    </Icon>
  )
}
