import { describe, expect, it } from 'vitest'

import {
  buildCalloutPayload,
  calloutToForm,
  ratiosFromClick,
  validateCalloutForm,
} from './calloutForm.js'

describe('calloutForm', () => {
  it('builds an empty form centered on the image', () => {
    expect(calloutToForm(null)).toEqual({
      zone_name: '',
      x_ratio: 0.5,
      y_ratio: 0.5,
    })
  })

  it('maps a callout into form values', () => {
    expect(
      calloutToForm({ zone_name: 'B Site', x_ratio: 0.2, y_ratio: 0.8 }),
    ).toEqual({ zone_name: 'B Site', x_ratio: 0.2, y_ratio: 0.8 })
  })

  it('validates the zone name and ratio bounds', () => {
    expect(
      validateCalloutForm({ zone_name: ' ', x_ratio: -0.1, y_ratio: 1.1 }),
    ).toEqual({
      zone_name: 'El nombre de la zona es obligatorio.',
      x_ratio: 'Debe estar entre 0 y 1.',
      y_ratio: 'Debe estar entre 0 y 1.',
    })

    expect(
      validateCalloutForm({ zone_name: 'B Site', x_ratio: 0, y_ratio: 1 }),
    ).toEqual({})
  })

  it('trims the payload and keeps the ratios', () => {
    expect(
      buildCalloutPayload({ zone_name: '  B Site  ', x_ratio: 0.2, y_ratio: 0.8 }),
    ).toEqual({ zone_name: 'B Site', x_ratio: 0.2, y_ratio: 0.8 })
  })

  it('converts a click into ratios and clamps them', () => {
    const currentTarget = {
      getBoundingClientRect: () => ({
        left: 10,
        top: 20,
        width: 200,
        height: 100,
      }),
    }

    expect(
      ratiosFromClick({ clientX: 60, clientY: 45, currentTarget }),
    ).toEqual({ x_ratio: 0.25, y_ratio: 0.25 })

    expect(
      ratiosFromClick({ clientX: 1000, clientY: -100, currentTarget }),
    ).toEqual({ x_ratio: 1, y_ratio: 0 })
  })
})
