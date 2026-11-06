import SteamAccountCard from './SteamAccountCard.jsx'
import SteamLinkCard from './SteamLinkCard.jsx'

export default function SteamSection({ steam, owner = false, onChange }) {
  const linked = Boolean(steam?.linked)
  if (!linked && !owner) return null

  if (!linked) {
    return <SteamLinkCard steam={steam} />
  }

  return (
    <SteamAccountCard steam={steam} owner={owner} onChange={onChange} />
  )
}
