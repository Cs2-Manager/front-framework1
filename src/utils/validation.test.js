import { describe, expect, it } from 'vitest'

import {
  EMAIL_REGEX,
  isValidEmail,
  validateEmail,
  validatePassword,
  validateUrl,
} from './validation.js'

describe('validation', () => {
  it('exposes an email regex and validates addresses', () => {
    expect(EMAIL_REGEX.test('ana@example.com')).toBe(true)
    expect(isValidEmail('ana@example.com')).toBe(true)
    expect(isValidEmail('ana@example')).toBe(false)
    expect(isValidEmail('sin-arroba.com')).toBe(false)
  })

  it('validates emails with required and format messages', () => {
    expect(validateEmail('')).toBe('El email es obligatorio.')
    expect(validateEmail('   ')).toBe('El email es obligatorio.')
    expect(validateEmail('nope')).toBe('Ingresá un email válido.')
    expect(validateEmail('ana@example.com')).toBeUndefined()
  })

  it('validates passwords with an optional minimum length', () => {
    expect(validatePassword('')).toBe('La contraseña es obligatoria.')
    expect(validatePassword('abc', { minLength: 6 })).toBe(
      'Debe tener al menos 6 caracteres.',
    )
    expect(validatePassword('abcdef', { minLength: 6 })).toBeUndefined()
    expect(validatePassword('a')).toBeUndefined()
  })

  it('validates urls with required, invalid and valid cases', () => {
    const options = {
      requiredMessage: 'Requerida.',
      invalidMessage: 'Inválida.',
      isValid: (value) => value.startsWith('https://'),
    }
    expect(validateUrl('', options)).toBe('Requerida.')
    expect(validateUrl('http://x', options)).toBe('Inválida.')
    expect(validateUrl('https://x', options)).toBeUndefined()
    expect(validateUrl('cualquier-cosa')).toBeUndefined()
  })
})
