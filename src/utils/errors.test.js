import { describe, expect, it } from 'vitest'

import { getErrorMessage } from './errors.js'

describe('getErrorMessage', () => {
  it('prefers the API "error" field', () => {
    const error = { response: { data: { error: 'boom', message: 'other' } } }
    expect(getErrorMessage(error, 'fallback')).toBe('boom')
  })

  it('falls back to the API "message" field', () => {
    const error = { response: { data: { message: 'mensaje' } } }
    expect(getErrorMessage(error, 'fallback')).toBe('mensaje')
  })

  it('uses the fallback when there is no API data', () => {
    expect(getErrorMessage({}, 'fallback')).toBe('fallback')
  })

  it('uses a default text when nothing is available', () => {
    expect(getErrorMessage(null)).toBe('Ocurrió un error inesperado.')
  })
})
