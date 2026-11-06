import FaceitAccountCard from './FaceitAccountCard.jsx'
import FaceitLinkCard from './FaceitLinkCard.jsx'

export default function FaceitSection({ faceit, owner = false, onChange }) {
  if (!faceit) return null
  if (!faceit.linked && !owner) return null

  if (!faceit.linked) {
    return <FaceitLinkCard faceit={faceit} onChange={onChange} />
  }

  return (
    <FaceitAccountCard
      faceit={faceit}
      owner={owner}
      onChange={onChange}
    />
  )
}
