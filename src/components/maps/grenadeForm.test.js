import { describe, expect, it } from 'vitest'

import {
  EMPTY_GRENADE_FORM,
  buildGrenadePayload,
  grenadeToForm,
  isNormalizedPoint,
  validateGrenadeForm,
} from './grenadeForm.js'

const validForm = {
  ...EMPTY_GRENADE_FORM,
  map_id: 2,
  title: 'Smoke CT',
  launch_position: [0.25, 0.4],
  impact_position: [0.7, 0.8],
}

describe('grenadeForm', () => {
  it('builds an empty form bound to the current map', () => {
    expect(grenadeToForm(null, { mapId: 9 })).toEqual({
      ...EMPTY_GRENADE_FORM,
      map_id: 9,
    })
  })

  it('maps legacy types, sides and positions into canonical form values', () => {
    const form = grenadeToForm({
      map_id: 3,
      title: 'Flash A',
      type: 'Flashbang',
      grenade_type: 'FLASH',
      side: 'TR',
      difficulty: 'HARD',
      position: [0.1, 0.2],
      tags: ['execute', 'a'],
      media: [{ kind: 'VIDEO', url: 'https://example.com/a.mp4' }],
    })

    expect(form).toMatchObject({
      map_id: 3,
      title: 'Flash A',
      type: 'FLASH',
      side: 'T',
      difficulty: 'HARD',
      impact_position: [0.1, 0.2],
      tags: 'execute, a',
      media: [
        {
          kind: 'VIDEO',
          url: 'https://example.com/a.mp4',
          thumbnail_url: '',
        },
      ],
    })
  })

  it('validates normalized coordinates within the 0..1 range', () => {
    expect(isNormalizedPoint([0, 1])).toBe(true)
    expect(isNormalizedPoint([0.5, 0.5])).toBe(true)
    expect(isNormalizedPoint([-0.1, 0.5])).toBe(false)
    expect(isNormalizedPoint([0.5, 1.1])).toBe(false)
    expect(isNormalizedPoint([0.5, '0.5'])).toBe(false)
    expect(isNormalizedPoint(null)).toBe(false)
  })

  it('rejects missing required fields and invalid media', () => {
    const errors = validateGrenadeForm({
      ...EMPTY_GRENADE_FORM,
      title: ' ',
      video_url: 'https://vimeo.com/1',
      image_url: 'http://example.com/a.png',
      launch_position: [2, 0],
      media: [{ kind: 'IMAGE', url: '' }],
    })

    expect(errors.title).toBeTruthy()
    expect(errors.video_url).toBeTruthy()
    expect(errors.image_url).toBeTruthy()
    expect(errors.launch_position).toBeTruthy()
    expect(errors['media-0']).toBeTruthy()
  })

  it('accepts a complete valid form', () => {
    expect(validateGrenadeForm(validForm)).toEqual({})
    expect(
      validateGrenadeForm({
        ...validForm,
        video_url: 'https://youtu.be/dQw4w9WgXcQ',
        image_url: 'https://cdn.example.com/demo.png',
      }),
    ).toEqual({})
  })

  it('builds a trimmed payload with parsed tags and no empty media', () => {
    const payload = buildGrenadePayload(
      {
        ...validForm,
        title: '  Smoke CT  ',
        description: '  desde T  ',
        tags: 'execute, , ct ',
        media: [
          { kind: 'IMAGE', url: ' https://cdn.example.com/a.png ' },
          { kind: 'VIDEO', url: '   ' },
        ],
      },
      { scope: 'PERSONAL' },
    )

    expect(payload).toMatchObject({
      map_id: 2,
      title: 'Smoke CT',
      description: 'desde T',
      tags: ['execute', 'ct'],
      launch_position: [0.25, 0.4],
      impact_position: [0.7, 0.8],
      position: [0.7, 0.8],
      media: [
        {
          kind: 'IMAGE',
          url: 'https://cdn.example.com/a.png',
          thumbnail_url: null,
        },
      ],
    })
    expect(payload).not.toHaveProperty('status')
    expect(payload).not.toHaveProperty('responsible_id')
  })

  it('only sends publication status for official lineups and responsible for team ones', () => {
    expect(
      buildGrenadePayload({ ...validForm, status: 'DRAFT' }, { scope: 'OFFICIAL' }),
    ).toMatchObject({ status: 'DRAFT' })

    expect(
      buildGrenadePayload(
        { ...validForm, responsible_id: 4 },
        { scope: 'TEAM' },
      ),
    ).toMatchObject({ responsible_id: 4 })
  })
})
