import { Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { fetchMyTeam } from '../services/teams.js'
import TacticalCenter from '../components/maps/TacticalCenter.jsx'
import GrenadeLibrary from '../components/maps/GrenadeLibrary.jsx'
import MapStatistics from '../components/maps/MapStatistics.jsx'
import '../components/maps/tactics.css'
import { useAuth } from '../context/AuthContext.jsx'

import useMapDetail from '../hooks/useMapDetail.js'
import CalloutFormModal from '../components/maps/CalloutFormModal.jsx'
import MapFormModal from '../components/maps/MapFormModal.jsx'
import CalloutCanvas from '../components/maps/CalloutCanvas.jsx'
import CalloutList from '../components/maps/CalloutList.jsx'
import MapDetailHeader from '../components/maps/MapDetailHeader.jsx'
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog.jsx'
import Alert from '../components/common/Alert.jsx'

function MapDetailLoading() {
  return (
    <div className="page container">
      <p className="text-muted">Cargando mapa…</p>
    </div>
  )
}

function MapDetailError({ error }) {
  return (
    <div className="page container">
      <Alert>{error || 'Mapa no encontrado.'}</Alert>
      <Link to="/maps" className="btn btn-ghost">
        Volver a mapas
      </Link>
    </div>
  )
}

function MapDetailPanels({ detail }) {
  const { user } = useAuth()
  const { map, selected, setSelected, calloutModal, deletion } = detail

  return (
    <div className="map-detail">
      <CalloutCanvas
        map={map}
        selectedIndex={selected}
        onSelect={setSelected}
      />
      <CalloutList
        callouts={map.callouts}
        selectedIndex={selected}
        onSelect={setSelected}
        onEdit={user?.is_admin ? calloutModal.openEdit : undefined}
        onDelete={user?.is_admin ? deletion.ask : undefined}
      />
    </div>
  )
}

function MapDetailModals({ detail }) {
  const { map, calloutModal, deletion } = detail

  return (
    <>
      {calloutModal.open && (
        <CalloutFormModal
          open={calloutModal.open}
          map={map}
          callout={calloutModal.editing}
          onClose={calloutModal.close}
          onSaved={detail.load}
        />
      )}

      {detail.editOpen && (
        <MapFormModal
          open={detail.editOpen}
          map={map}
          onClose={detail.closeEdit}
          onSaved={detail.handleMapSaved}
        />
      )}

      <DeleteConfirmDialog
        deletion={deletion}
        title="Eliminar zona"
        nameKey="zone_name"
      />
    </>
  )
}

function MapDetailContent({ detail }) {
  const [tab, setTab] = useState('Overview')
  const [team, setTeam] = useState(null), [teamError, setTeamError] = useState(''), [teamLoading, setTeamLoading] = useState(true)
  useEffect(() => { fetchMyTeam().then(setTeam).catch(() => setTeamError('No pudimos consultar tu equipo.')).finally(() => setTeamLoading(false)) }, [])
  return (
    <div className="page container">
      <MapDetailHeader
        map={detail.map}
        onEdit={detail.openEdit}
        onCreateCallout={detail.calloutModal.openCreate}
      />
      <Alert>{detail.deletion.error}</Alert>
      {detail.map.description && <p className="map-library-description">{detail.map.description}</p>}
      <nav className="map-tabs" aria-label="Secciones del mapa">{['Overview', 'Estadísticas', 'Estrategias', 'Granadas', 'Callouts', 'Preparación'].map(t => <button className="btn btn-ghost" key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>{t}</button>)}</nav>
      {tab === 'Overview' && <section className="team-panel"><h2>{detail.map.name} · Centro táctico</h2><img src={detail.map.cover_url || detail.map.image_url} alt={detail.map.name} style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} /><p>{detail.map.callouts.length} callouts disponibles. Consultá estrategias, utilidad y preparación desde las pestañas del mapa.</p></section>}
      {tab === 'Callouts' && <MapDetailPanels detail={detail} />}
      {tab === 'Estadísticas' && <MapStatistics team={team} map={detail.map} />}
      {tab === 'Granadas' && <GrenadeLibrary map={detail.map} team={team} />}
      {['Estrategias', 'Preparación'].includes(tab) && (teamLoading ? <p>Cargando equipo…</p> : team ? <TacticalCenter key={`${team.id}-${detail.map.id}`} team={team} map={detail.map} preparation={tab === 'Preparación'} /> : <section className="team-panel"><Alert>{teamError}</Alert><p>Necesitás pertenecer a un equipo para consultar su centro táctico.</p><Link to="/teams">Buscar equipo</Link></section>)}
      {tab === 'Preparación' && team && <details className="team-panel"><summary>Consultar granadas y callouts durante la preparación</summary><GrenadeLibrary map={detail.map} team={team} /><MapDetailPanels detail={detail} /></details>}
      <MapDetailModals detail={detail} />
    </div>
  )
}

export default function MapDetail() {
  const { id } = useParams()
  const detail = useMapDetail(id)

  if (detail.loading) return <MapDetailLoading />
  if (detail.error || !detail.map) return <MapDetailError error={detail.error} />
  return <MapDetailContent detail={detail} />
}
