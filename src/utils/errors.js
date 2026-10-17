/**
 * Extrae un mensaje legible de un error de axios.
 * La API responde con `{ error }` o `{ message }`; se prioriza `error`.
 */
export function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    fallback ||
    'Ocurrió un error inesperado.'
  )
}
