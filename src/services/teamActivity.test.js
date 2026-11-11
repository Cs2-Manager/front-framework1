import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from './api'
import { fetchTeamActivity } from './teamActivity.js'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('team activity service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('loads the first page with the default page size', async () => {
    api.get.mockResolvedValue({
      data: {
        activities: [{ id: 1 }],
        meta: { total: 1, page: 1, per_page: 20 },
      },
    })

    await expect(fetchTeamActivity(4)).resolves.toEqual({
      activities: [{ id: 1 }],
      meta: { total: 1, page: 1, per_page: 20 },
    })
    expect(api.get).toHaveBeenCalledWith('/teams/4/activity', {
      params: { page: 1, per_page: 20 },
    })
  })

  it('forwards explicit pagination', async () => {
    api.get.mockResolvedValue({ data: { activities: [], meta: { total: 0 } } })

    await fetchTeamActivity(4, { page: 3, perPage: 5 })

    expect(api.get).toHaveBeenCalledWith('/teams/4/activity', {
      params: { page: 3, per_page: 5 },
    })
  })

  it('normalises a response without activities or meta', async () => {
    api.get.mockResolvedValue({ data: {} })

    await expect(
      fetchTeamActivity(9, { page: 2, perPage: 10 }),
    ).resolves.toEqual({
      activities: [],
      meta: { total: 0, page: 2, per_page: 10 },
    })
  })

  it('rejects when the caller is not a current member', async () => {
    api.get.mockRejectedValue(new Error('403 private'))

    await expect(fetchTeamActivity(4)).rejects.toThrow('403 private')
  })
})
