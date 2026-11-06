import { describe, expect, it } from 'vitest'

import {
  SOCIAL_PLATFORMS,
  buildProfilePayload,
  profileToForm,
  validateProfileForm,
} from './profileForm.js'

function emptyForm(overrides = {}) {
  return {
    nickname: 'FragMachine',
    display_name: '',
    country: '',
    bio: '',
    avatar_url: '',
    steam_url: '',
    visibility: 'PRIVATE',
    ...Object.fromEntries(SOCIAL_PLATFORMS.map((platform) => [platform.key, ''])),
    ...overrides,
  }
}

describe('profileForm', () => {
  it('accepts a minimal valid form', () => {
    expect(validateProfileForm(emptyForm())).toEqual({})
  })

  it('requires the competitive nickname', () => {
    expect(validateProfileForm(emptyForm({ nickname: '   ' }))).toEqual({
      nickname: 'El nickname competitivo es obligatorio.',
    })
  })

  it('rejects an oversized nickname and bio', () => {
    const errors = validateProfileForm(
      emptyForm({ nickname: 'x'.repeat(81), bio: 'y'.repeat(501) }),
    )

    expect(errors.nickname).toContain('80')
    expect(errors.bio).toContain('500')
  })

  it('rejects control characters and invalid countries', () => {
    const errors = validateProfileForm(
      emptyForm({ nickname: 'bad\u0007name', country: 'ARG' }),
    )

    expect(errors.nickname).toBe('El nickname contiene caracteres inválidos.')
    expect(errors.country).toContain('2 letras')
  })

  it('accepts a two letter country in any case', () => {
    expect(validateProfileForm(emptyForm({ country: 'ar' }))).toEqual({})
  })

  it('rejects invalid visibility values', () => {
    expect(validateProfileForm(emptyForm({ visibility: 'TEAM' }))).toEqual({
      visibility: 'Elegí una visibilidad válida.',
    })
  })

  it('rejects non http(s) URLs and URL credentials', () => {
    const errors = validateProfileForm(
      emptyForm({
        avatar_url: 'javascript:alert(1)',
        twitch: 'https://user:pass@twitch.tv/x',
      }),
    )

    expect(errors.avatar_url).toBe('La URL debe usar http o https.')
    expect(errors.twitch).toBe('La URL no puede incluir credenciales.')
  })

  it('restricts the Steam link to steamcommunity.com', () => {
    const invalid = validateProfileForm(
      emptyForm({ steam_url: 'https://example.com/steam' }),
    )
    expect(invalid.steam_url).toBe(
      'La URL debe pertenecer a steamcommunity.com.',
    )

    const valid = validateProfileForm(
      emptyForm({ steam_url: 'https://steamcommunity.com/id/tester' }),
    )
    expect(valid).toEqual({})
  })

  it('builds a normalized payload and clears empty social links', () => {
    const payload = buildProfilePayload(
      emptyForm({
        display_name: '  Frag Machine  ',
        country: 'ar',
        bio: '  Hola  ',
        avatar_url: 'https://cdn.example.com/a.png',
        steam_url: 'https://steamcommunity.com/id/tester',
        visibility: 'PUBLIC',
        twitch: ' https://twitch.tv/tester ',
      }),
    )

    expect(payload).toEqual({
      nickname: 'FragMachine',
      display_name: 'Frag Machine',
      country: 'AR',
      bio: 'Hola',
      avatar_url: 'https://cdn.example.com/a.png',
      steam_url: 'https://steamcommunity.com/id/tester',
      visibility: 'PUBLIC',
      social_links: {
        twitch: 'https://twitch.tv/tester',
        youtube: '',
        x: '',
        instagram: '',
        discord: '',
      },
    })
  })

  it('maps an existing profile to form values', () => {
    const form = profileToForm({
      nickname: 'Frag',
      display_name: 'Frag Machine',
      country: 'AR',
      bio: 'Bio',
      avatar_url: 'https://cdn.example.com/a.png',
      steam_url: 'https://steamcommunity.com/id/tester',
      visibility: 'PUBLIC',
      social_links: { twitch: 'https://twitch.tv/tester' },
    })

    expect(form).toEqual({
      nickname: 'Frag',
      display_name: 'Frag Machine',
      country: 'AR',
      bio: 'Bio',
      avatar_url: 'https://cdn.example.com/a.png',
      steam_url: 'https://steamcommunity.com/id/tester',
      visibility: 'PUBLIC',
      twitch: 'https://twitch.tv/tester',
      youtube: '',
      x: '',
      instagram: '',
      discord: '',
    })
  })

  it('defaults missing profile values', () => {
    expect(profileToForm({})).toMatchObject({
      nickname: '',
      visibility: 'PRIVATE',
      twitch: '',
    })
  })
})
