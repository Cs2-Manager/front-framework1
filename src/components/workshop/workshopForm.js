import { validateUrl } from '../../utils/validation.js'

const WORKSHOP_URL_REGEX = /^https?:\/\/.+/i

export const EMPTY_WORKSHOP_FORM = {
  title: '',
  category: '',
  description: '',
  image_url: '',
  workshop_url: '',
}

export function workshopMapToForm(workshopMap) {
  if (!workshopMap) return EMPTY_WORKSHOP_FORM
  return {
    title: workshopMap.title,
    category: workshopMap.category,
    description: workshopMap.description,
    image_url: workshopMap.image_url,
    workshop_url: workshopMap.workshop_url,
  }
}

export function validateWorkshopMapForm(values) {
  const errors = {}
  if (!values.title.trim()) errors.title = 'El título es obligatorio.'
  if (!values.category) errors.category = 'Seleccioná una categoría.'
  if (!values.image_url.trim())
    errors.image_url = 'La URL de la imagen es obligatoria.'

  const urlError = validateUrl(values.workshop_url, {
    requiredMessage: 'La URL de la Workshop es obligatoria.',
    invalidMessage: 'Ingresá una URL válida (http/https).',
    isValid: (value) => WORKSHOP_URL_REGEX.test(value),
  })
  if (urlError) errors.workshop_url = urlError
  return errors
}

export function buildWorkshopMapPayload(values) {
  return {
    title: values.title.trim(),
    category: values.category,
    description: values.description.trim(),
    image_url: values.image_url.trim(),
    workshop_url: values.workshop_url.trim(),
  }
}
