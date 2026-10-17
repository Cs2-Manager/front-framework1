export default function Modal({ open, title, onClose, size = '', children }) {
  if (!open) return null

  const className = size ? `modal ${size}` : 'modal'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={className} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
