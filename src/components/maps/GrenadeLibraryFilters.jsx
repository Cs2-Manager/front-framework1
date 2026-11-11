import { useCallback } from 'react'

import {
  DIFFICULTY_OPTIONS,
  GRENADE_TYPE_OPTIONS,
  SIDE_OPTIONS,
} from './grenadeForm.js'

export function LibraryFilters({ scope, filters, onChange, isAdmin, status, onStatusChange }) {
  const change = useCallback((event) => {
    const { name, value, type, checked } = event.target
    onChange({ ...filters, [name]: type === 'checkbox' ? checked : value })
  }, [filters, onChange])

  return (
    <div className="tactical-toolbar grenade-library-filters">
      <label>
        Buscar granada
        <input
          type="search"
          name="q"
          value={filters.q}
          onChange={change}
          placeholder="Nombre de la granada…"
        />
      </label>
      <label>
        Tipo
        <select name="type" value={filters.type} onChange={change}>
          <option value="">Todos</option>
          {GRENADE_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Lado
        <select name="side" value={filters.side} onChange={change}>
          <option value="">Todos</option>
          {SIDE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Dificultad
        <select name="difficulty" value={filters.difficulty} onChange={change}>
          <option value="">Todas</option>
          {DIFFICULTY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {scope === 'OFFICIAL' && isAdmin && (
        <label>
          Estado
          <select value={status} onChange={(event) => onStatusChange(event.target.value)}>
            <option value="ALL">Todos</option>
            <option value="DRAFT">Borradores</option>
            <option value="PUBLISHED">Publicadas</option>
            <option value="ARCHIVED">Archivadas</option>
          </select>
        </label>
      )}
      <label className="grenade-favorite-filter">
        <input
          type="checkbox"
          name="favorite"
          checked={filters.favorite}
          onChange={change}
        />
        Solo favoritos
      </label>
    </div>
  )
}
