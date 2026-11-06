import { describe, expect, it } from 'vitest'

import {
  buildEditableMapPayload,
  buildMapPayload,
  mapToEditableForm,
  mapToForm,
  validateEditableMapForm,
  validateMapForm,
} from './mapForm.js'

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

  it('adds catalog defaults to the administrative form', () => {
    expect(mapToEditableForm(null)).toMatchObject({
      name: '',
      image_url: '',
      active_pool: false,
      category: 'COMPETITIVE',
      status: 'ACTIVE',
      slug: '',
      display_order: '',
      release_date: '',
      image_source: '',
      top_down_source: '',
      visual_version: '',
    })
  })

  it('round trips extended catalog metadata through the administrative form', () => {
    const map = {
      id: 3,
      name: 'Ancient',
      image_url: 'https://cdn.example.com/ancient.png',
      cover_url: 'https://cdn.example.com/ancient-cover.jpg',
      description: ' Selva ',
      active_pool: false,
      category: 'RESERVE',
      status: 'ARCHIVED',
      slug: 'ancient',
      display_order: 4,
      release_date: '2024-05-01',
      image_source: 'Valve',
      top_down_source: 'Valve radar',
      visual_version: 2,
    }

    expect(buildEditableMapPayload(mapToEditableForm(map))).toEqual({
      name: 'Ancient',
      image_url: 'https://cdn.example.com/ancient.png',
      active_pool: false,
      description: 'Selva',
      cover_url: 'https://cdn.example.com/ancient-cover.jpg',
      category: 'RESERVE',
      status: 'ARCHIVED',
      slug: 'ancient',
      display_order: 4,
      release_date: '2024-05-01',
      image_source: 'Valve',
      top_down_source: 'Valve radar',
      visual_version: 2,
    })
  })

  it('omits default catalog values from the administrative payload', () => {
    expect(
      buildEditableMapPayload({
        name: 'Mirage',
        image_url: 'https://cdn.example.com/mirage.png',
        active_pool: true,
        category: 'COMPETITIVE',
        status: 'ACTIVE',
        visual_version: 1,
      }),
    ).toEqual({
      name: 'Mirage',
      image_url: 'https://cdn.example.com/mirage.png',
      active_pool: true,
    })
  })

  it('includes default catalog values when editing so they can be reset', () => {
    expect(
      buildEditableMapPayload(
        {
          name: 'Mirage',
          image_url: 'https://cdn.example.com/mirage.png',
          active_pool: true,
          category: 'COMPETITIVE',
          status: 'ACTIVE',
          visual_version: 1,
          release_date: '',
          image_source: '',
          top_down_source: '',
        },
        { includeDefaults: true },
      ),
    ).toEqual({
      name: 'Mirage',
      image_url: 'https://cdn.example.com/mirage.png',
      active_pool: true,
      category: 'COMPETITIVE',
      status: 'ACTIVE',
      release_date: null,
      image_source: null,
      top_down_source: null,
      visual_version: 1,
    })
  })

  it('validates extended catalog fields', () => {
    expect(
      validateEditableMapForm({
        name: 'Mirage',
        image_url: 'https://cdn.example.com/mirage.png',
        cover_url: 'http://insecure.example.com/cover.jpg',
        release_date: 'not-a-date',
        display_order: -1,
      }),
    ).toEqual({
      cover_url: 'La portada debe ser una URL HTTPS pública.',
      release_date: 'Usá una fecha ISO válida (YYYY-MM-DD).',
      display_order: 'El orden debe ser un entero mayor o igual a 0.',
    })

    expect(
      validateEditableMapForm({
        name: 'Mirage',
        image_url: 'https://cdn.example.com/mirage.png',
        cover_url: 'https://cdn.example.com/cover.jpg',
        release_date: '2024-05-01',
        display_order: 2,
      }),
    ).toEqual({})
  })
})
