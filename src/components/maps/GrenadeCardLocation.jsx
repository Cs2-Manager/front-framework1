import { locationModel } from './grenadeCardModel.js'

function GrenadeCardZones({ zones }) {
  return (
    <p className="grenade-card-zones">
      {zones.launch} → {zones.impact}
    </p>
  )
}

function GrenadeCardCoordinates({ launch, impact }) {
  return (
    <p className="grenade-card-coordinates">
      {launch && <span>Origen {launch}</span>}
      {impact && <span>Destino {impact}</span>}
    </p>
  )
}

export default function GrenadeCardLocation({ item }) {
  const { zones, launch, impact } = locationModel(item)
  return (
    <>
      {zones && <GrenadeCardZones zones={zones} />}
      {(launch || impact) && (
        <GrenadeCardCoordinates launch={launch} impact={impact} />
      )}
    </>
  )
}
