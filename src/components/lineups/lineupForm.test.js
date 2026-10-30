import { describe, expect, it } from 'vitest'

import {
  buildLineupPayload,
  lineupToForm,
  validateLineupForm,
} from './lineupForm.js'

const MAPS = [{ id: 3, name: 'Mirage' }]

const VALID = {
  map_id: '3',
  type: 'Smoke',
  side: 'CT',
  title: '  Smoke  ',
  description: '  nota  ',
  video_url: ' https://youtu.be/dQw4w9WgXcQ ',
}

describe('lineupForm', () => {
  it('builds an empty form with the first map preselected', () => {
    expect(lineupToForm(null, MAPS)).toEqual({
      map_id: '3',
      type: '',
      side: '',
      title: '',
      description: '',
      video_url: '',
    })
    expect(lineupToForm(null, [])).toMatchObject({ map_id: '' })
  })

  it('maps a lineup into form values', () => {
    expect(
      lineupToForm({
        id: 1,
        map_id: 3,
        type: 'Smoke',
        side: 'CT',
        title: 'T',
        description: 'D',
        video_url: 'u',
      }),
    ).toEqual({
      map_id: '3',
      type: 'Smoke',
      side: 'CT',
      title: 'T',
      description: 'D',
      video_url: 'u',
    })
  })

  it('returns no errors for a valid lineup', () => {
    expect(validateLineupForm(VALID)).toEqual({})
  })

  it('reports missing fields and invalid video urls', () => {
    expect(
      validateLineupForm({
        map_id: '',
        type: '',
        side: '',
        title: '  ',
        video_url: '',
      }),
    ).toEqual({
      map_id: 'Seleccioná un mapa.',
      type: 'Seleccioná el tipo de granada.',
      side: 'Seleccioná el bando.',
      title: 'El título es obligatorio.',
      video_url: 'La URL del video es obligatoria.',
    })

    expect(
      validateLineupForm({ ...VALID, video_url: 'https://vimeo.com/1' })
        .video_url,
    ).toBe('Ingresá un enlace válido de YouTube.')
  })

  it('trims strings and converts the map id in the payload', () => {
    expect(buildLineupPayload(VALID)).toEqual({
      map_id: 3,
      type: 'Smoke',
      side: 'CT',
      title: 'Smoke',
      description: 'nota',
      video_url: 'https://youtu.be/dQw4w9WgXcQ',
    })
  })
})
