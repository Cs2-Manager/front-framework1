import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import useWorkshopTabs, {
  ALL_TAB,
  TABS,
  countByCategory,
  emptyMessageFor,
  filterByTab,
} from './useWorkshopTabs.js'

const maps = [
  { id: 1, category: 'Aim' },
  { id: 2, category: 'Aim' },
  { id: 3, category: 'Recoil' },
]

describe('useWorkshopTabs', () => {
  it('builds the tab list from the catalogue', () => {
    expect(TABS).toEqual([ALL_TAB, 'Aim', 'Recoil', 'Crosshair', 'HUD', 'Warmup'])
  })

  it('counts maps per category including the total', () => {
    expect(countByCategory(maps)).toEqual({
      [ALL_TAB]: 3,
      Aim: 2,
      Recoil: 1,
      Crosshair: 0,
      HUD: 0,
      Warmup: 0,
    })
  })

  it('filters by the active tab', () => {
    expect(filterByTab(maps, ALL_TAB)).toEqual(maps)
    expect(filterByTab(maps, 'Aim')).toEqual([maps[0], maps[1]])
    expect(filterByTab(maps, 'HUD')).toEqual([])
  })

  it('selects the empty message for the active tab', () => {
    expect(emptyMessageFor(ALL_TAB)).toBe(
      'Todavía no hay mapas de la Workshop cargados.',
    )
    expect(emptyMessageFor('Aim')).toBe(
      'No hay mapas en la categoría «Aim» todavía.',
    )
  })

  it('reacts to tab changes and exposes visible maps', () => {
    const { result } = renderHook(() => useWorkshopTabs(maps))

    expect(result.current.activeTab).toBe(ALL_TAB)
    expect(result.current.visibleMaps).toEqual(maps)

    act(() => result.current.setActiveTab('Recoil'))

    expect(result.current.activeTab).toBe('Recoil')
    expect(result.current.visibleMaps).toEqual([maps[2]])
    expect(result.current.counts.Recoil).toBe(1)
  })
})
