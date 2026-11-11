import { useEffect, useState } from 'react'

import Modal from '../common/Modal.jsx'

export function ProposeModal({ target, busy, onCancel, onConfirm }) {
  const [note, setNote] = useState('')

  useEffect(() => {
    setNote('')
  }, [target])

  if (!target) return null

  return (
    <Modal
      open={Boolean(target)}
      title={`Proponer “${target.title}” al equipo`}
      onClose={onCancel}
    >
      <p className="text-muted">
        Se enviará una copia inmutable de esta granada al equipo. Un capitán o
        entrenador deberá aprobarla para crear la versión compartida.
      </p>
      <label className="form-group" htmlFor="grenade-proposal-note">
        Nota para el equipo (opcional)
        <textarea
          id="grenade-proposal-note"
          value={note}
          maxLength={2000}
          onChange={(event) => setNote(event.target.value)}
        />
      </label>
      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy}
          onClick={() => onConfirm(note)}
        >
          {busy ? 'Enviando…' : 'Enviar propuesta'}
        </button>
      </div>
    </Modal>
  )
}
