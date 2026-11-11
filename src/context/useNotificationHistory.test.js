import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import useNotificationHistory from './useNotificationHistory.js'
import { markNotificationRead, markAllNotificationsRead } from '../services/notifications.js'

vi.mock('../services/notifications.js', () => ({
  fetchNotifications: vi.fn(), markNotificationRead: vi.fn(), markAllNotificationsRead: vi.fn(),
}))

function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

function startPendingRead(mode) {
  const pending = deferred()
  markNotificationRead.mockReturnValue(pending.promise)
  markAllNotificationsRead.mockReturnValue(pending.promise)
  const { result } = renderHook(() => useNotificationHistory())
  let completion
  act(() => {
    completion = mode === 'single'
      ? result.current.markRead({ notification_id: 1 })
      : result.current.markAllRead()
  })
  return { result, pending, completion }
}

describe('notification history session isolation', () => {
  beforeEach(() => vi.resetAllMocks())

  it.each(['single', 'all'])('ignores a late %s read response from the previous session', async mode => {
    const { result, pending, completion } = startPendingRead(mode)
    act(() => {
      result.current.reset()
      result.current.receive({ event_id: 'new-session', notification_id: 2, read: false })
    })
    await act(async () => {
      pending.resolve({ notification: { read_at: '2026-11-10T10:00:00Z' }, unreadCount: 17 })
      await completion
    })
    expect(result.current.unreadCount).toBe(1)
    expect(result.current.notifications).toMatchObject([{ event_id: 'new-session', read: false }])
    expect(result.current.error).toBe('')
  })

  it.each(['single', 'all'])('ignores a late %s read error after logout', async mode => {
    const { result, pending, completion } = startPendingRead(mode)
    act(() => {
      result.current.reset()
    })
    await act(async () => {
      pending.reject(new Error('old session'))
      await completion
    })
    expect(result.current.error).toBe('')
    expect(result.current.unreadCount).toBe(0)
    expect(result.current.notifications).toEqual([])
  })
})
