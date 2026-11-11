import { describe, expect, it } from 'vitest'

import { validateLogin, validateRegister } from './authValidation.js'

describe('auth validation', () => {
  it('accepts a valid login payload', () => {
    expect(
      validateLogin({ email: 'user@example.test', password: 'secret' }),
    ).toEqual({})
  })

  it('requires an email and a password to log in', () => {
    expect(validateLogin({ email: '  ', password: '' })).toEqual({
      email: 'El email es obligatorio.',
      password: 'La contraseña es obligatoria.',
    })
  })

  it('rejects an invalid email format', () => {
    expect(
      validateLogin({ email: 'not-an-email', password: 'secret' }),
    ).toEqual({ email: 'Ingresá un email válido.' })
  })

  it('accepts a complete registration', () => {
    expect(
      validateRegister({
        name: 'Frag',
        email: 'frag@example.test',
        password: 'secret123',
        confirmPassword: 'secret123',
      }),
    ).toEqual({})
  })

  it('requires the display name', () => {
    expect(
      validateRegister({
        name: '   ',
        email: 'frag@example.test',
        password: 'secret123',
        confirmPassword: 'secret123',
      }),
    ).toEqual({ name: 'El nombre es obligatorio.' })
  })

  it('enforces the minimum password length', () => {
    expect(
      validateRegister({
        name: 'Frag',
        email: 'frag@example.test',
        password: '123',
        confirmPassword: '123',
      }),
    ).toEqual({ password: 'Debe tener al menos 6 caracteres.' })
  })

  it('detects mismatched password confirmation', () => {
    expect(
      validateRegister({
        name: 'Frag',
        email: 'frag@example.test',
        password: 'secret123',
        confirmPassword: 'different',
      }),
    ).toEqual({ confirmPassword: 'Las contraseñas no coinciden.' })
  })

  it('accumulates every field error at once', () => {
    expect(
      validateRegister({
        name: '',
        email: 'bad',
        password: '123',
        confirmPassword: '456',
      }),
    ).toEqual({
      name: 'El nombre es obligatorio.',
      email: 'Ingresá un email válido.',
      password: 'Debe tener al menos 6 caracteres.',
      confirmPassword: 'Las contraseñas no coinciden.',
    })
  })
})
