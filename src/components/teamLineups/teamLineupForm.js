const MIN_NAME = 2
const MAX_NAME = 80
const MAX_DESCRIPTION = 1000

function text(value) {
  return (value || '').trim()
}

export function validateTeamLineupForm(values) {
  const errors = {}
  const name = text(values.name)
  const description = values.description || ''

  if (!name) {
    errors.name = 'El nombre de la alineación es obligatorio.'
  } else if (name.length < MIN_NAME) {
    errors.name = `El nombre debe tener al menos ${MIN_NAME} caracteres.`
  } else if (name.length > MAX_NAME) {
    errors.name = `El nombre no puede superar los ${MAX_NAME} caracteres.`
  } else if (/[\u0000-\u001f]/.test(name)) {
    errors.name = 'El nombre contiene caracteres inválidos.'
  }

  if (description.length > MAX_DESCRIPTION) {
    errors.description = `La descripción no puede superar los ${MAX_DESCRIPTION} caracteres.`
  }

  return errors
}

export function buildTeamLineupPayload(values) {
  return {
    name: text(values.name),
    description: text(values.description) || null,
    ...('map_id' in values ? { map_id: values.map_id ? Number(values.map_id) : null } : {}),
    ...('notes' in values ? { notes: text(values.notes) } : {}),
  }
}

export function teamLineupToForm(lineup) {
  return {
    name: lineup?.name || '',
    description: lineup?.description || '',
    ...(lineup && 'map_id' in lineup ? { map_id: lineup.map_id || '' } : {}),
    ...(lineup && 'notes' in lineup ? { notes: lineup.notes || '' } : {}),
  }
}
