/**
 * Callback de éxito para modales: notifica el guardado y cierra el modal.
 */
export function closeAfterSave(onSaved, onClose) {
  return (saved) => {
    onSaved(saved)
    onClose()
  }
}
