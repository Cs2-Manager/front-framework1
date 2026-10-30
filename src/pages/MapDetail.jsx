import { Link, useParams } from 'react-router-dom'

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
        onEdit={calloutModal.openEdit}
        onDelete={deletion.ask}
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
  return (
    <div className="page container">
      <MapDetailHeader
        map={detail.map}
        onEdit={detail.openEdit}
        onCreateCallout={detail.calloutModal.openCreate}
      />
      <Alert>{detail.deletion.error}</Alert>
      <MapDetailPanels detail={detail} />
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
