import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from './api'
import {
  acceptInvitation,
  cancelTeamInvitation,
  createTeam,
  fetchMyInvitations,
  fetchMyTeam,
  fetchTeam,
  fetchTeamInvitations,
  fetchTeamMembers,
  fetchTeams,
  inviteTeamMember,
  leaveTeam,
  rejectInvitation,
  removeTeamMember,
  transferTeamCaptain,
  updateTeam,
  updateTeamMemberRole,
} from './teams.js'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('teams service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('loads the public directory with search and pagination', async () => {
    api.get.mockResolvedValue({
      data: { teams: [{ id: 1 }], meta: { total: 1 } },
    })

    const result = await fetchTeams({ search: ' alpha ', page: 2, perPage: 10 })

    expect(api.get).toHaveBeenCalledWith('/teams', {
      params: { search: 'alpha', page: 2, per_page: 10 },
    })
    expect(result).toEqual({ teams: [{ id: 1 }], meta: { total: 1 } })
  })

  it('omits empty directory params', async () => {
    api.get.mockResolvedValue({ data: { teams: [], meta: { total: 0 } } })

    await fetchTeams({ search: '   ' })

    expect(api.get).toHaveBeenCalledWith('/teams', { params: {} })
  })

  it('loads a team, my team and members', async () => {
    api.get
      .mockResolvedValueOnce({ data: { team: { id: 3 } } })
      .mockResolvedValueOnce({ data: { team: null } })
      .mockResolvedValueOnce({
        data: { members: [{ id: 1 }], meta: { total: 1 } },
      })

    await expect(fetchTeam(3)).resolves.toEqual({ id: 3 })
    await expect(fetchMyTeam()).resolves.toBeNull()
    await expect(fetchTeamMembers(3)).resolves.toEqual({
      members: [{ id: 1 }],
      meta: { total: 1 },
    })
    expect(api.get).toHaveBeenNthCalledWith(1, '/teams/3')
    expect(api.get).toHaveBeenNthCalledWith(2, '/teams/mine')
    expect(api.get).toHaveBeenNthCalledWith(3, '/teams/3/members')
  })

  it('creates and updates a team', async () => {
    const payload = { name: 'Alpha' }
    api.post.mockResolvedValue({ data: { team: { id: 4, ...payload } } })
    api.put.mockResolvedValue({
      data: { team: { id: 4, name: 'Alpha 2' } },
    })

    await expect(createTeam(payload)).resolves.toEqual({ id: 4, ...payload })
    await expect(updateTeam(4, { name: 'Alpha 2' })).resolves.toEqual({
      id: 4,
      name: 'Alpha 2',
    })
    expect(api.post).toHaveBeenCalledWith('/teams', payload)
    expect(api.put).toHaveBeenCalledWith('/teams/4', { name: 'Alpha 2' })
  })

  it('loads team invitations with a status filter', async () => {
    api.get.mockResolvedValue({
      data: { invitations: [{ id: 7 }], meta: { total: 1 } },
    })

    await expect(fetchTeamInvitations(4, { status: 'ALL' })).resolves.toEqual({
      invitations: [{ id: 7 }],
      meta: { total: 1 },
    })
    expect(api.get).toHaveBeenCalledWith('/teams/4/invitations', {
      params: { status: 'ALL' },
    })
  })

  it('invites a member and cancels an invitation', async () => {
    api.post.mockResolvedValue({ data: { invitation: { id: 9 } } })
    api.delete.mockResolvedValue({})

    await expect(inviteTeamMember(4, { username: 'frag' })).resolves.toEqual({
      id: 9,
    })
    await expect(cancelTeamInvitation(4, 9)).resolves.toBeUndefined()
    expect(api.post).toHaveBeenCalledWith('/teams/4/invitations', {
      username: 'frag',
    })
    expect(api.delete).toHaveBeenCalledWith('/teams/4/invitations/9')
  })

  it('manages members and captaincy', async () => {
    api.patch.mockResolvedValue({ data: { member: { role: 'COACH' } } })
    api.delete.mockResolvedValue({})
    api.post.mockResolvedValue({ data: { team: { id: 4 } } })

    await expect(updateTeamMemberRole(4, 2, 'COACH')).resolves.toEqual({
      role: 'COACH',
    })
    await expect(removeTeamMember(4, 2)).resolves.toBeUndefined()
    await expect(leaveTeam(4)).resolves.toBeUndefined()
    await expect(transferTeamCaptain(4, 2)).resolves.toEqual({ id: 4 })
    expect(api.patch).toHaveBeenCalledWith('/teams/4/members/2', {
      role: 'COACH',
    })
    expect(api.delete).toHaveBeenCalledWith('/teams/4/members/2')
    expect(api.post).toHaveBeenCalledWith('/teams/4/leave')
    expect(api.post).toHaveBeenCalledWith('/teams/4/transfer-captain', {
      user_id: 2,
    })
  })

  it('loads my invitations and responds to them', async () => {
    api.get.mockResolvedValue({
      data: { invitations: [{ id: 1 }], meta: { total: 1 } },
    })
    api.post
      .mockResolvedValueOnce({ data: { invitation: { id: 1 }, team: { id: 3 } } })
      .mockResolvedValueOnce({ data: { invitation: { id: 1 } } })

    await expect(fetchMyInvitations({ status: 'PENDING' })).resolves.toEqual({
      invitations: [{ id: 1 }],
      meta: { total: 1 },
    })
    await expect(acceptInvitation(1)).resolves.toEqual({
      invitation: { id: 1 },
      team: { id: 3 },
    })
    await expect(rejectInvitation(1)).resolves.toEqual({ id: 1 })
    expect(api.get).toHaveBeenCalledWith('/teams/invitations', {
      params: { status: 'PENDING' },
    })
    expect(api.post).toHaveBeenNthCalledWith(1, '/teams/invitations/1/accept')
    expect(api.post).toHaveBeenNthCalledWith(2, '/teams/invitations/1/reject')
  })
})
