export const EMPTY_CALLOUT_FORM = { zone_name: '', x_ratio: 0.5, y_ratio: 0.5 }

export function calloutToForm(callout) {
  if (!callout) return EMPTY_CALLOUT_FORM
  return {
    zone_name: callout.zone_name,
    x_ratio: callout.x_ratio,
    y_ratio: callout.y_ratio,
  }
}

export function validateCalloutForm(values) {
  const errors = {}
  if (!values.zone_name.trim())
    errors.zone_name = 'El nombre de la zona es obligatorio.'
  if (!isRatio(values.x_ratio)) errors.x_ratio = 'Debe estar entre 0 y 1.'
  if (!isRatio(values.y_ratio)) errors.y_ratio = 'Debe estar entre 0 y 1.'
  return errors
}

export function buildCalloutPayload(values) {
  return {
    zone_name: values.zone_name.trim(),
    x_ratio: values.x_ratio,
    y_ratio: values.y_ratio,
  }
}

/**
 * Convierte las coordenadas de un clic sobre la imagen en ratios 0–1.
 */
export function ratiosFromClick({ clientX, clientY, currentTarget }) {
  const rect = currentTarget.getBoundingClientRect()
  return {
    x_ratio: clamp01((clientX - rect.left) / rect.width),
    y_ratio: clamp01((clientY - rect.top) / rect.height),
  }
}

function isRatio(value) {
  return value >= 0 && value <= 1
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value))
}
