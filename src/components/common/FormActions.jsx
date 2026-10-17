export default function FormActions({
  onCancel,
  label,
  busy = false,
  busyLabel = 'Guardando…',
  type = 'submit',
}) {
  return (
    <div className="modal-actions">
      <button type="button" className="btn btn-ghost" onClick={onCancel}>
        Cancelar
      </button>
      <button type={type} className="btn btn-primary" disabled={busy}>
        {busy ? busyLabel : label}
      </button>
    </div>
  )
}
