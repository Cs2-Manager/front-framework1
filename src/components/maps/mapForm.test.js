import { describe, expect, it } from 'vitest'

import { buildMapPayload, mapToForm, validateMapForm } from './mapForm.js'

describe('mapForm', () => {
  it('builds an empty form when there is no map', () => {
    expect(mapToForm(null)).toEqual({
      name: '',
      image_url: '',
      active_pool: false,
    })
  })

  it('maps a map into form values', () => {
    expect(
      mapToForm({ name: 'Mirage', image_url: 'x.jpg', active_pool: true }),
    ).toEqual({ name: 'Mirage', image_url: 'x.jpg', active_pool: true })
  })

  it('requires name and image url', () => {
    expect(validateMapForm({ name: '  ', image_url: ' ' })).toEqual({
      name: 'El nombre es obligatorio.',
      image_url: 'La URL de la imagen es obligatoria.',
    })
    expect(
      validateMapForm({ name: 'Mirage', image_url: 'x.jpg' }),
    ).toEqual({})
  })

  it('trims strings and preserves active_pool', () => {
    expect(
      buildMapPayload({
        name: '  Mirage  ',
        image_url: '  x.jpg  ',
        active_pool: true,
      }),
    ).toEqual({ name: 'Mirage', image_url: 'x.jpg', active_pool: true })
  })
})
