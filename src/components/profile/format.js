export function formatDate(value) {
  if (!value) return 'Sin datos'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin datos'
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(value) {
  if (!value) return 'Sin actividad registrada'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin actividad registrada'
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—'
  }
  return Number(value).toFixed(digits)
}

export function formatPercent(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—'
  }
  return `${Number(value).toFixed(digits)}%`
}

export function formatInteger(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—'
  }
  return String(Number(value))
}
