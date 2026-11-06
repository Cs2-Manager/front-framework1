import { describe, expect, it } from 'vitest'

import {
  buildTeamPayload,
  teamToForm,
  validateTeamForm,
} from './teamForm.js'
import {
  canCancelTeamInvitation,
  canManageMember,
  teamInitials,
} from './teamDisplay.js'

function values(overrides = {}) {
  return {
    name: 'Alpha Wolves',
    tag: 'AW',
    logo_url: '',
    description: '',
    country: 'AR',
    visibility: 'PUBLIC',
    ...overrides,
  }
}

describe('teamForm', () => {
  it('accepts a valid team', () => {
    expect(validateTeamForm(values())).toEqual({})
  })

  it('validates name, tag, country, visibility and logo URL', () => {
    const errors = validateTeamForm(
      values({
        name: ' ',
        tag: '!',
        country: 'ARG',
        visibility: 'TEAM',
        logo_url: 'javascript:alert(1)',
      }),
    )

    expect(errors.name).toMatch(/obligatorio/)
    expect(errors.tag).toMatch(/tag/)
    expect(errors.country).toMatch(/2 letras/)
    expect(errors.visibility).toMatch(/visibilidad/)
    expect(errors.logo_url).toMatch(/http/)
  })

  it('rejects too long descriptions and short names', () => {
    const errors = validateTeamForm(
      values({ name: 'A', description: 'x'.repeat(1001) }),
    )

    expect(errors.name).toMatch(/al menos 2/)
    expect(errors.description).toMatch(/1000/)
  })

  it('normalizes the payload', () => {
    expect(
      buildTeamPayload(
        values({
          name: '  Alpha  ',
          tag: ' aw ',
          country: ' ar ',
          description: '  ',
          logo_url: '',
        }),
      ),
    ).toEqual({
      name: 'Alpha',
      tag: 'AW',
      country: 'AR',
      description: null,
      logo_url: null,
      visibility: 'PUBLIC',
    })
  })

  it('maps a team to form values', () => {
    expect(
      teamToForm({
        name: 'Alpha',
        tag: 'AW',
        country: 'AR',
        description: 'Hola',
        logo_url: 'https://example.com/logo.png',
        visibility: 'PRIVATE',
      }),
    ).toEqual({
      name: 'Alpha',
      tag: 'AW',
      country: 'AR',
      description: 'Hola',
      logo_url: 'https://example.com/logo.png',
      visibility: 'PRIVATE',
    })
  })
})

describe('teamDisplay', () => {
  it('builds initials from the team name', () => {
    expect(teamInitials('Alpha Wolves')).toBe('AW')
    expect(teamInitials('Alpha')).toBe('AL')
    expect(teamInitials('')).toBe('CS')
  })

  it('allows coaches to cancel only their own invitations', () => {
    const team = {
      my_role: 'COACH',
      permissions: { can_manage_invitations: true },
    }
    const own = { invited_by: { id: 2 } }
    const foreign = { invited_by: { id: 3 } }

    expect(canCancelTeamInvitation(team, own, 2)).toBe(true)
    expect(canCancelTeamInvitation(team, foreign, 2)).toBe(false)
    expect(canCancelTeamInvitation({ ...team, my_role: 'CAPTAIN' }, foreign, 2)).toBe(true)
    expect(
      canCancelTeamInvitation(
        { my_role: 'PLAYER', permissions: { can_manage_invitations: false } },
        own,
        2,
      ),
    ).toBe(false)
  })

  it('does not allow managing the captain or yourself', () => {
    const team = { permissions: { can_change_roles: true } }
    expect(canManageMember(team, { role: 'CAPTAIN', user: { id: 2 } }, 1)).toBe(false)
    expect(canManageMember(team, { role: 'PLAYER', user: { id: 1 } }, 1)).toBe(false)
    expect(canManageMember(team, { role: 'PLAYER', user: { id: 2 } }, 1)).toBe(true)
  })
})
