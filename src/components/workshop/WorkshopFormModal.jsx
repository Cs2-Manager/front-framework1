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
import {
  buildWorkshopMapPayload,
  validateWorkshopMapForm,
  workshopMapToForm,
} from './workshopForm.js'

function WorkshopHeaderFields({ form, errors, onChange }) {
  return (
    <>
      <FormField id="workshop-title" name="title" label="Título" value={form.title} onChange={onChange} error={errors.title} placeholder="Ej: Aim Botz" />
      <FormField as="select" id="workshop-category" name="category" label="Categoría" value={form.category} onChange={onChange} error={errors.category}>
        <option value="">Seleccioná una categoría</option>
        <OptionList values={WORKSHOP_CATEGORIES} />
      </FormField>
    </>
  )
}

function WorkshopDetailFields({ form, errors, onChange }) {
  return (
    <>
      <FormField id="workshop-image" name="image_url" label="URL de la imagen" type="url" value={form.image_url} onChange={onChange} error={errors.image_url} placeholder="https://…/aim-botz.jpg" />
      <FormField id="workshop-url" name="workshop_url" label="URL de la Steam Workshop" type="url" value={form.workshop_url} onChange={onChange} error={errors.workshop_url} placeholder="https://steamcommunity.com/sharedfiles/filedetails/?id=…" />
      <FormField as="textarea" id="workshop-desc" name="description" label="Descripción" rows="3" value={form.description} onChange={onChange} placeholder="Qué se entrena y por qué la recomendamos…" />
    </>
  )
}

export default function WorkshopFormModal({ open, workshopMap, onClose, onSaved }) {
  const { form, errors, handleChange, modalProps } = useForm({
    open,
    buildInitial: () => workshopMapToForm(workshopMap),
    deps: [workshopMap],
    validate: validateWorkshopMapForm,
    submit: (values) => {
      const payload = buildWorkshopMapPayload(values)
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
      title={workshopMap ? 'Editar mapa de la Workshop' : 'Nuevo mapa de la Workshop'}
      onClose={onClose}
      submitLabel={workshopMap ? 'Guardar cambios' : 'Crear mapa'}
    >
      <WorkshopHeaderFields form={form} errors={errors} onChange={handleChange} />
      <WorkshopDetailFields form={form} errors={errors} onChange={handleChange} />
    </ModalForm>
  )
}
