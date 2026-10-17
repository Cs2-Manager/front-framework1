import Modal from './Modal.jsx'

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  busy = false,
  onCancel,
  onConfirm,
}) {
  if (!open) return null

  return (
    <Modal open={open} title={title} onClose={onCancel} size="modal-sm">
      <p>{message}</p>
      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? 'Eliminando…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
