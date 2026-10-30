import { validateEmail, validatePassword } from '../../utils/validation.js'

const MIN_PASSWORD_LENGTH = 6

/**
 * Errores del formulario de inicio de sesión.
 */
export function validateLogin(values) {
  const errors = {}
  const emailError = validateEmail(values.email)
  if (emailError) errors.email = emailError
  const passwordError = validatePassword(values.password)
  if (passwordError) errors.password = passwordError
  return errors
}

/**
 * Errores del formulario de registro (incluye confirmación de contraseña).
 */
export function validateRegister(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'El nombre es obligatorio.'
  const emailError = validateEmail(values.email)
  if (emailError) errors.email = emailError
  const passwordError = validatePassword(values.password, {
    minLength: MIN_PASSWORD_LENGTH,
  })
  if (passwordError) errors.password = passwordError
  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Las contraseñas no coinciden.'
  }
  return errors
}
