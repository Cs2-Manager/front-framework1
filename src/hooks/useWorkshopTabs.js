import { useMemo, useState } from 'react'

import { WORKSHOP_CATEGORIES } from '../services/workshopMaps.js'

export const ALL_TAB = 'Todas'
export const TABS = [ALL_TAB, ...WORKSHOP_CATEGORIES]

export function countByCategory(maps) {
  const counts = { [ALL_TAB]: maps.length }
  for (const category of WORKSHOP_CATEGORIES) {
    counts[category] = maps.filter((map) => map.category === category).length
  }
  return counts
}

export function filterByTab(maps, activeTab) {
  if (activeTab === ALL_TAB) return maps
  return maps.filter((map) => map.category === activeTab)
}

export function emptyMessageFor(activeTab) {
  if (activeTab === ALL_TAB) {
    return 'Todavía no hay mapas de la Workshop cargados.'
  }
  return `No hay mapas en la categoría «${activeTab}» todavía.`
}

/**
 * Pestañas, conteos y visibilidad de los mapas de la Workshop.
 */
export default function useWorkshopTabs(maps) {
  const [activeTab, setActiveTab] = useState(ALL_TAB)
  const counts = useMemo(() => countByCategory(maps), [maps])
  const visibleMaps = useMemo(() => filterByTab(maps, activeTab), [maps, activeTab])

  return {
    activeTab,
    setActiveTab,
    counts,
    visibleMaps,
    emptyMessage: emptyMessageFor(activeTab),
  }
}
