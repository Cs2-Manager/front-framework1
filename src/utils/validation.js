export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value) {
  return EMAIL_REGEX.test(value)
}

export function validateEmail(value) {
  if (!value.trim()) return 'El email es obligatorio.'
  if (!isValidEmail(value)) return 'Ingresá un email válido.'
  return undefined
}

export function validatePassword(value, { minLength } = {}) {
  if (!value) return 'La contraseña es obligatoria.'
  if (minLength && value.length < minLength) {
    return `Debe tener al menos ${minLength} caracteres.`
  }
  return undefined
}

export function validateUrl(value, { requiredMessage, invalidMessage, isValid } = {}) {
  if (!value.trim()) return requiredMessage
  if (isValid && !isValid(value.trim())) return invalidMessage
  return undefined
}
