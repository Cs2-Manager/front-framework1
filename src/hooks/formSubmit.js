import { applySubmitError, runValidation } from './formHelpers.js'

/** Crea el manejador de envío: valida, ejecuta `submit` y enruta errores. */
export function createSubmitHandler({
  getForm,
  validate,
  submit,
  onSuccess,
  errorMessage,
  setErrors,
  setServerError,
  setSubmitting,
  isSubmitting,
}) {
  return async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting()) return

    const nextErrors = runValidation(validate, getForm())
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    setServerError('')
    try {
      const result = await submit(getForm())
      onSuccess?.(result)
    } catch (err) {
      applySubmitError(err, { setErrors, setServerError, errorMessage })
    } finally {
      setSubmitting(false)
    }
  }
}
