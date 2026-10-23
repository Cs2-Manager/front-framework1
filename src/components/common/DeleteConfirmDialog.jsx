import ConfirmDialog from './ConfirmDialog.jsx'

/**
 * Envuelve ConfirmDialog para el patrón de borrado de una colección.
 * `deletion` proviene de useDelete (pending, busy, cancel, confirm).
 */
export default function DeleteConfirmDialog({
  deletion,
  title,
  nameKey = 'title',
  suffix = '',
}) {
  const { pending, busy, cancel, confirm } = deletion

  return (
    <ConfirmDialog
      open={Boolean(pending)}
      title={title}
      message={
        pending
          ? `¿Seguro que querés eliminar «${pending[nameKey]}»?${suffix}`
          : ''
      }
      busy={busy}
      onCancel={cancel}
      onConfirm={confirm}
    />
  )
}
