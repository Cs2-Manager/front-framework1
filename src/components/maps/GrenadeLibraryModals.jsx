import ConfirmDialog from '../common/ConfirmDialog.jsx'
import GrenadeFormModal from './GrenadeFormModal.jsx'
import GrenadeHistoryPanel from './GrenadeHistoryPanel.jsx'
import { ProposeModal } from './GrenadeProposeModal.jsx'

/** Modales de la biblioteca: alta/edición, propuesta, historial y borrado. */
export default function GrenadeLibraryModals({
  map,
  team,
  formState,
  onCloseForm,
  proposalTarget,
  onCloseProposal,
  onSendProposal,
  historyTarget,
  onCloseHistory,
  onRestore,
  deleteTarget,
  onCloseDelete,
  onDelete,
  busy,
}) {
  return (
    <>
      {formState && (
        <GrenadeFormModal
          open
          map={map}
          team={team}
          lineup={formState.lineup}
          scope={formState.scope}
          onClose={onCloseForm}
          onSaved={onCloseForm}
        />
      )}

      <ProposeModal
        target={proposalTarget}
        busy={busy}
        onCancel={onCloseProposal}
        onConfirm={onSendProposal}
      />

      <GrenadeHistoryPanel
        open={Boolean(historyTarget)}
        lineup={historyTarget}
        busy={busy}
        onClose={onCloseHistory}
        onRestore={onRestore}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar granada"
        message={`¿Eliminar ${deleteTarget?.title || 'esta granada'}?`}
        busy={busy}
        onCancel={onCloseDelete}
        onConfirm={() => onDelete(deleteTarget)}
      />
    </>
  )
}
