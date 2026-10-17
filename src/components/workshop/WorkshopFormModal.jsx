import FormField from '../common/FormField.jsx'
import ModalForm from '../common/ModalForm.jsx'
import OptionList from '../common/OptionList.jsx'
import useForm from '../../hooks/useForm.js'
import {
  createWorkshopMap,
  updateWorkshopMap,
  WORKSHOP_CATEGORIES,
} from '../../services/workshopMaps.js'
import { closeAfterSave } from '../../utils/forms.js'
import { validateUrl } from '../../utils/validation.js'

const EMPTY = {
  title: '',
  category: '',
  description: '',
  image_url: '',
  workshop_url: '',
}

const toFormValues = (workshopMap) =>
  workshopMap
    ? {
        title: workshopMap.title,
        category: workshopMap.category,
        description: workshopMap.description,
        image_url: workshopMap.image_url,
        workshop_url: workshopMap.workshop_url,
      }
    : EMPTY

export default function WorkshopFormModal({
  open,
  workshopMap,
  onClose,
  onSaved,
}) {
  const { form, errors, handleChange, modalProps } = useForm({
      open,
      buildInitial: () => toFormValues(workshopMap),
      deps: [workshopMap],
      validate: (values) => {
        const next = {}
        if (!values.title.trim()) next.title = 'El título es obligatorio.'
        if (!values.category) next.category = 'Seleccioná una categoría.'
        if (!values.image_url.trim())
          next.image_url = 'La URL de la imagen es obligatoria.'
        const urlError = validateUrl(values.workshop_url, {
          requiredMessage: 'La URL de la Workshop es obligatoria.',
          invalidMessage: 'Ingresá una URL válida (http/https).',
          isValid: (value) => /^https?:\/\/.+/i.test(value),
        })
        if (urlError) next.workshop_url = urlError
        return next
      },
      submit: (values) => {
        const payload = {
          title: values.title.trim(),
          category: values.category,
          description: values.description.trim(),
          image_url: values.image_url.trim(),
          workshop_url: values.workshop_url.trim(),
        }
        return workshopMap
          ? updateWorkshopMap(workshopMap.id, payload)
          : createWorkshopMap(payload)
      },
      onSuccess: closeAfterSave(onSaved, onClose),
      errorMessage: 'No se pudo guardar el mapa de la Workshop. Intentalo de nuevo.',
    })

  return (
    <ModalForm
      {...modalProps}
      title={
        workshopMap ? 'Editar mapa de la Workshop' : 'Nuevo mapa de la Workshop'
      }
      onClose={onClose}
      submitLabel={workshopMap ? 'Guardar cambios' : 'Crear mapa'}
    >
      <FormField
        id="workshop-title"
        name="title"
        label="Título"
        value={form.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Ej: Aim Botz"
      />

      <FormField
        as="select"
        id="workshop-category"
        name="category"
        label="Categoría"
        value={form.category}
        onChange={handleChange}
        error={errors.category}
      >
        <option value="">Seleccioná una categoría</option>
        <OptionList values={WORKSHOP_CATEGORIES} />
      </FormField>

      <FormField
        id="workshop-image"
        name="image_url"
        label="URL de la imagen"
        type="url"
        value={form.image_url}
        onChange={handleChange}
        error={errors.image_url}
        placeholder="https://…/aim-botz.jpg"
      />

      <FormField
        id="workshop-url"
        name="workshop_url"
        label="URL de la Steam Workshop"
        type="url"
        value={form.workshop_url}
        onChange={handleChange}
        error={errors.workshop_url}
        placeholder="https://steamcommunity.com/sharedfiles/filedetails/?id=…"
      />

      <FormField
        as="textarea"
        id="workshop-desc"
        name="description"
        label="Descripción"
        rows="3"
        value={form.description}
        onChange={handleChange}
        placeholder="Qué se entrena y por qué la recomendamos…"
      />
    </ModalForm>
  )
}
