import { useEffect, useId, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function focusFirst(container) {
  if (!container) return
  const target = container.querySelector(FOCUSABLE)
  ;(target || container).focus()
}

function trapTab(event, container) {
  if (!container) return
  const nodes = Array.from(container.querySelectorAll(FOCUSABLE)).filter(
    (node) => node.offsetParent !== null || node === document.activeElement,
  )
  if (nodes.length === 0) {
    event.preventDefault()
    container.focus()
    return
  }

  const first = nodes[0]
  const last = nodes[nodes.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

/**
 * Modal accesible: diálogo, cierre con Escape y clic en el fondo,
 * bloqueo del scroll de la página y foco inicial dentro del diálogo.
 */
export default function Modal({ open, title, onClose, size = '', children }) {
  const dialogRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => focusFirst(dialogRef.current), 0)

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose?.()
        return
      }
      if (event.key === 'Tab') {
        trapTab(event, dialogRef.current)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  const className = size ? `modal ${size}` : 'modal'

  return (
    <div
      className="modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <div
        ref={dialogRef}
        className={className}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="modal-head">
          <h2 id={titleId}>{title}</h2>
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
