import { describe, expect, it } from 'vitest'

import {
  buildWorkshopMapPayload,
  validateWorkshopMapForm,
  workshopMapToForm,
} from './workshopForm.js'

const VALID = {
  title: '  Aim Botz  ',
  category: 'Aim',
  description: '  entrena  ',
  image_url: '  x.jpg  ',
  workshop_url: '  https://steamcommunity.com/sharedfiles/filedetails/?id=1  ',
}

describe('workshopForm', () => {
  it('builds an empty form when there is no item', () => {
    expect(workshopMapToForm(null)).toEqual({
      title: '',
      category: '',
      description: '',
      image_url: '',
      workshop_url: '',
    })
  })

  it('maps an item into form values', () => {
    expect(
      workshopMapToForm({
        title: 'Aim Botz',
        category: 'Aim',
        description: 'd',
        image_url: 'i.jpg',
        workshop_url: 'https://x',
      }),
    ).toEqual({
      title: 'Aim Botz',
      category: 'Aim',
      description: 'd',
      image_url: 'i.jpg',
      workshop_url: 'https://x',
    })
  })

  it('validates required fields and the workshop url', () => {
    expect(
      validateWorkshopMapForm({
        title: ' ',
        category: '',
        image_url: '',
        workshop_url: '',
      }),
    ).toEqual({
      title: 'El título es obligatorio.',
      category: 'Seleccioná una categoría.',
      image_url: 'La URL de la imagen es obligatoria.',
      workshop_url: 'La URL de la Workshop es obligatoria.',
    })

    expect(
      validateWorkshopMapForm({ ...VALID, workshop_url: 'ftp://x' })
        .workshop_url,
    ).toBe('Ingresá una URL válida (http/https).')

    expect(validateWorkshopMapForm(VALID)).toEqual({})
  })

  it('trims strings in the payload', () => {
    expect(buildWorkshopMapPayload(VALID)).toEqual({
      title: 'Aim Botz',
      category: 'Aim',
      description: 'entrena',
      image_url: 'x.jpg',
      workshop_url:
        'https://steamcommunity.com/sharedfiles/filedetails/?id=1',
    })
  })
})
