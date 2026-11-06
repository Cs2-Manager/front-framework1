import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from './api'
import { fetchDashboardSummary } from './dashboard.js'

vi.mock('./api', () => ({ default: { get: vi.fn() } }))

describe('dashboard service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('requests the dashboard endpoint and returns its payload', async () => {
    const dashboard = { summary: { maps: { total: 1 } } }
    api.get.mockResolvedValue({ data: { dashboard } })

    await expect(fetchDashboardSummary()).resolves.toEqual(dashboard)
    expect(api.get).toHaveBeenCalledWith('/dashboard')
  })
})
