import {
  clearFieldErrors,
  readFieldValue,
  useFormFields,
} from './formHelpers.js'
import { createSubmitHandler } from './formSubmit.js'

/** Estado local del formulario y actualización de valores/errores. */
export function useFormState({ initial, buildInitial, open, deps = [] }) {
  const makeInitial = () => (buildInitial ? buildInitial() : initial)
  const fields = useFormFields({ makeInitial, open, deps })

  function updateValues(values) {
    fields.setForm((prev) => ({ ...prev, ...values }))
    fields.setErrors((prev) => clearFieldErrors(prev, Object.keys(values)))
  }

  function handleChange(event) {
    const { name } = event.target
    updateValues({ [name]: readFieldValue(event.target) })
  }

  return { ...fields, updateValues, handleChange }
}

/**
 * Estado y flujo de envío para formularios (modales y páginas de auth).
 * Opciones: initial | buildInitial | open | deps | validate | submit |
 * onSuccess | errorMessage.
 */
export default function useForm(options) {
  const state = useFormState(options)
  const handleSubmit = createSubmitHandler({
    ...options,
    getForm: () => state.form,
    isSubmitting: () => state.submitting,
    setErrors: state.setErrors,
    setServerError: state.setServerError,
    setSubmitting: state.setSubmitting,
  })

  return {
    form: state.form,
    errors: state.errors,
    serverError: state.serverError,
    submitting: state.submitting,
    updateValues: state.updateValues,
    handleChange: state.handleChange,
    handleSubmit,
    modalProps: {
      open: options.open,
      serverError: state.serverError,
      submitting: state.submitting,
      onSubmit: handleSubmit,
    },
  }
}
