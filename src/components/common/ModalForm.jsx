import Alert from './Alert.jsx'
import FormActions from './FormActions.jsx'
import Modal from './Modal.jsx'

/**
 * Modal con formulario: alerta de error de servidor, campos (children) y acciones.
 */
export default function ModalForm({
  open,
  title,
  size,
  onClose,
  serverError,
  submitting,
  submitLabel,
  onSubmit,
  children,
}) {
  return (
    <Modal open={open} title={title} onClose={onClose} size={size}>
      <form onSubmit={onSubmit} noValidate>
        <Alert>{serverError}</Alert>
        {children}
        <FormActions
          onCancel={onClose}
          busy={submitting}
          label={submitLabel}
        />
      </form>
    </Modal>
  )
}
