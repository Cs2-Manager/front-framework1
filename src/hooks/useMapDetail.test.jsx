import { renderHook, waitFor, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import useMapDetail, { useMapEditing, useMapLoader } from './useMapDetail.js'
import { deleteCallout, fetchMap } from '../services/maps.js'

vi.mock('../services/maps.js', () => ({
  deleteCallout: vi.fn(),
  fetchMap: vi.fn(),
}))

describe('useMapDetail hooks', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('loads a map and notifies the caller', async () => {
    fetchMap.mockResolvedValue({ id: 3, name: 'Mirage' })
    const onLoaded = vi.fn()

    const { result } = renderHook(() => useMapLoader(3, onLoaded))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(fetchMap).toHaveBeenCalledWith(3)
    expect(result.current.map).toEqual({ id: 3, name: 'Mirage' })
    expect(result.current.error).toBe('')
    expect(onLoaded).toHaveBeenCalled()
  })

  it('reports a load error without throwing', async () => {
    fetchMap.mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useMapLoader(3, vi.fn()))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.map).toBeNull()
    expect(result.current.error).toBe(
      'No se pudo cargar el mapa. Intentalo de nuevo.',
    )
  })

  it('opens and closes the edit modal and applies saved changes', async () => {
    const setMap = vi.fn()
    const { result } = renderHook(() => useMapEditing(setMap))

    act(() => result.current.openEdit())
    expect(result.current.editOpen).toBe(true)

    act(() => result.current.handleMapSaved({ id: 1, name: 'Nuevo' }))
    expect(setMap).toHaveBeenCalledWith({ id: 1, name: 'Nuevo' })
    expect(result.current.editOpen).toBe(false)

    act(() => result.current.openEdit())
    act(() => result.current.closeEdit())
    expect(result.current.editOpen).toBe(false)
  })

  it('exposes selection, modal and deletion helpers', async () => {
    fetchMap.mockResolvedValue({ id: 3, name: 'Mirage' })
    deleteCallout.mockResolvedValue({})

    const { result } = renderHook(() => useMapDetail(3))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.selected).toBe(0)

    act(() => result.current.setSelected(2))
    expect(result.current.selected).toBe(2)

    act(() => result.current.calloutModal.openCreate())
    expect(result.current.calloutModal.open).toBe(true)
    act(() => result.current.calloutModal.close())

    act(() => result.current.deletion.ask({ id: 9 }))
    await act(async () => {
      await result.current.deletion.confirm()
    })
    expect(deleteCallout).toHaveBeenCalledWith(3, 9)
    // Tras borrar se recarga el mapa y la selección vuelve al primer callout.
    await waitFor(() => expect(fetchMap).toHaveBeenCalledTimes(2))
    expect(result.current.selected).toBe(0)
  })

  it('keeps the deletion error visible when the request fails', async () => {
    fetchMap.mockResolvedValue({ id: 3 })
    deleteCallout.mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useMapDetail(3))

    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.deletion.ask({ id: 9 }))
    await act(async () => {
      await result.current.deletion.confirm()
    })
    expect(result.current.deletion.error).toBe(
      'No se pudo eliminar la zona. Intentalo de nuevo.',
    )
  })
})
