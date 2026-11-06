import Icon from '../common/Icon.jsx'

export function MapIcon({ size = 20 }) {
  return (
    <Icon size={size}>
      <path d="M9 20l-5.5 2V6L9 4l6 2 5.5-2v16L15 22l-6-2z" />
      <line x1="9" y1="4" x2="9" y2="20" />
      <line x1="15" y1="6" x2="15" y2="22" />
    </Icon>
  )
}

export function ZoneIcon({ size = 20 }) {
  return (
    <Icon size={size}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </Icon>
  )
}

export function LineupIcon({ size = 20 }) {
  return (
    <Icon size={size}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </Icon>
  )
}

export function WorkshopIcon({ size = 20 }) {
  return (
    <Icon size={size}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.1 2.1-2.8-2.8z" />
    </Icon>
  )
}
