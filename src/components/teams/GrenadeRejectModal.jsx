import { useEffect, useState } from 'react'

import Modal from '../common/Modal.jsx'

/** Diálogo para rechazar una propuesta con un motivo opcional. */
export default function GrenadeRejectModal({
  target,
  busy,
  onCancel,
  onConfirm,
}) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    setReason('')
  }, [target])

  if (!target) return null

  return (
    <Modal
      open={Boolean(target)}
      title={`Rechazar “${target.snapshot?.title || 'propuesta'}”`}
      onClose={onCancel}
    >
      <label className="form-group" htmlFor="grenade-reject-reason">
        Motivo del rechazo (opcional)
        <textarea
          id="grenade-reject-reason"
          value={reason}
          maxLength={2000}
          onChange={(event) => setReason(event.target.value)}
        />
      </label>
      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-danger"
          disabled={busy}
          onClick={() => onConfirm(reason)}
        >
          {busy ? 'Rechazando…' : 'Rechazar propuesta'}
        </button>
      </div>
    </Modal>
  )
}
