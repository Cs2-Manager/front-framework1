import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from './api'
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from './notifications.js'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('notifications service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('loads the notification history with pagination and defaults', async () => {
    api.get.mockResolvedValue({
      data: {
        notifications: [{ id: 1 }],
        meta: { total: 1, page: 1, per_page: 20 },
        unread_count: 3,
      },
    })

    await expect(fetchNotifications()).resolves.toEqual({
      notifications: [{ id: 1 }],
      meta: { total: 1, page: 1, per_page: 20 },
      unreadCount: 3,
    })
    expect(api.get).toHaveBeenCalledWith('/notifications', {
      params: { page: 1, per_page: 20 },
    })
  })

  it('forwards an explicit page and page size', async () => {
    api.get.mockResolvedValue({ data: {} })

    await fetchNotifications({ page: 4, perPage: 5 })

    expect(api.get).toHaveBeenCalledWith('/notifications', {
      params: { page: 4, per_page: 5 },
    })
  })

  it('falls back to empty collections when the backend omits fields', async () => {
    api.get.mockResolvedValue({ data: {} })

    await expect(fetchNotifications({ page: 2, perPage: 10 })).resolves.toEqual({
      notifications: [],
      meta: { total: 0, page: 2, per_page: 10 },
      unreadCount: 0,
    })
  })

  it('reads the unread counter', async () => {
    api.get.mockResolvedValue({ data: { unread_count: 7 } })

    await expect(fetchUnreadCount()).resolves.toBe(7)
    expect(api.get).toHaveBeenCalledWith('/notifications/unread-count')
  })

  it('returns zero when the unread counter is missing', async () => {
    api.get.mockResolvedValue({ data: {} })

    await expect(fetchUnreadCount()).resolves.toBe(0)
  })

  it('marks a single notification as read', async () => {
    api.post.mockResolvedValue({
      data: { notification: { id: 9, read: true }, unread_count: 2 },
    })

    await expect(markNotificationRead(9)).resolves.toEqual({
      notification: { id: 9, read: true },
      unreadCount: 2,
    })
    expect(api.post).toHaveBeenCalledWith('/notifications/9/read')
  })

  it('marks every notification as read', async () => {
    api.post.mockResolvedValue({ data: { updated: 5, unread_count: 0 } })

    await expect(markAllNotificationsRead()).resolves.toEqual({
      updated: 5,
      unreadCount: 0,
    })
    expect(api.post).toHaveBeenCalledWith('/notifications/read-all')
  })

  it('propagates HTTP errors instead of hiding them', async () => {
    api.get.mockRejectedValue(new Error('403 private'))

    await expect(fetchNotifications()).rejects.toThrow('403 private')
  })
})
