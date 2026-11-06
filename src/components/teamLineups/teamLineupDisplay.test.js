import { describe, expect, it } from 'vitest'

import {
  TEAM_LINEUP_ROLE_LABELS,
  buildRosterPayload,
  lineupPlayerName,
  lineupRoleLabel,
  lineupStatusLabel,
  rosterFromLineup,
  rosterRole,
  rosterSlot,
  setRosterRole,
  setRosterSlot,
} from './teamLineupDisplay.js'
import {
  buildTeamLineupPayload,
  teamLineupToForm,
  validateTeamLineupForm,
} from './teamLineupForm.js'

function lineup() {
  return {
    name: 'Titular',
    description: 'Notas',
    starters: [
      { user: { id: 1, username: 'igl' }, role: 'IGL' },
      { user: { id: 2, username: 'awp' }, role: null },
    ],
    substitutes: [{ user: { id: 3, username: 'sub' }, role: 'FLEX' }],
  }
}

describe('team lineup display helpers', () => {
  it('labels game roles and statuses', () => {
    expect(lineupRoleLabel('ENTRY')).toBe('Entry Fragger')
    expect(lineupRoleLabel(null)).toBe('Sin rol')
    expect(lineupStatusLabel('ACTIVE')).toBe('Activa')
    expect(lineupStatusLabel('DRAFT')).toBe('Borrador')
    expect(Object.keys(TEAM_LINEUP_ROLE_LABELS)).toHaveLength(8)
  })

  it('uses public profile data for player names', () => {
    expect(lineupPlayerName({ user: { display_name: 'Ana' } })).toBe('Ana')
    expect(lineupPlayerName({ user: { nickname: 'nick' } })).toBe('nick')
    expect(lineupPlayerName({ user: { username: 'user' } })).toBe('user')
    expect(lineupPlayerName(null)).toBe('Jugador')
  })

  it('maps a lineup to an editable roster', () => {
    expect(rosterFromLineup(lineup())).toEqual({
      starters: [
        { user_id: 1, role: 'IGL' },
        { user_id: 2, role: '' },
      ],
      substitutes: [{ user_id: 3, role: 'FLEX' }],
    })
  })

  it('moves players between slots without duplicating them', () => {
    const roster = rosterFromLineup(lineup())

    const promoted = setRosterSlot(roster, 3, 'starter')
    expect(rosterSlot(promoted, 3)).toBe('starter')
    expect(promoted.substitutes).toHaveLength(0)
    expect(promoted.starters.find((entry) => entry.user_id === 3)).toEqual({
      user_id: 3,
      role: 'FLEX',
    })

    const removed = setRosterSlot(promoted, 1, '')
    expect(rosterSlot(removed, 1)).toBe('')
    expect(removed.starters).toHaveLength(2)

    const demoted = setRosterSlot(roster, 1, 'substitute')
    expect(rosterSlot(demoted, 1)).toBe('substitute')
    expect(demoted.starters.map((entry) => entry.user_id)).toEqual([2])
  })

  it('updates the role of a selected player only', () => {
    const roster = setRosterRole(rosterFromLineup(lineup()), 2, 'AWPER')

    expect(rosterRole(roster, 2)).toBe('AWPER')
    expect(rosterRole(roster, 1)).toBe('IGL')
    expect(rosterRole(roster, 3)).toBe('FLEX')
  })

  it('builds the roster payload expected by the API', () => {
    expect(
      buildRosterPayload({
        starters: [{ user_id: 1, role: 'IGL' }, { user_id: 2, role: '' }],
        substitutes: [{ user_id: 3 }],
      }),
    ).toEqual({
      starters: [
        { user_id: 1, role: 'IGL' },
        { user_id: 2, role: null },
      ],
      substitutes: [{ user_id: 3, role: null }],
    })
  })
})

describe('team lineup form helpers', () => {
  it('validates name and description', () => {
    expect(validateTeamLineupForm({ name: '' }).name).toMatch(/obligatorio/)
    expect(validateTeamLineupForm({ name: 'a' }).name).toMatch(/al menos/)
    expect(validateTeamLineupForm({ name: 'x'.repeat(81) }).name).toMatch(
      /superar/,
    )
    expect(
      validateTeamLineupForm({ name: 'Ok', description: 'x'.repeat(1001) })
        .description,
    ).toMatch(/superar/)
    expect(validateTeamLineupForm({ name: 'Ok', description: '' })).toEqual({})
  })

  it('builds a trimmed payload and maps a lineup to form values', () => {
    expect(
      buildTeamLineupPayload({ name: '  Titular  ', description: '  ' }),
    ).toEqual({ name: 'Titular', description: null })
    expect(teamLineupToForm({ name: 'A', description: 'B' })).toEqual({
      name: 'A',
      description: 'B',
    })
    expect(teamLineupToForm(null)).toEqual({ name: '', description: '' })
  })
})
