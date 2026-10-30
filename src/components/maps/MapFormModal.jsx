import FormField from '../common/FormField.jsx'
import ModalForm from '../common/ModalForm.jsx'
import useForm from '../../hooks/useForm.js'
import { createMap, updateMap } from '../../services/maps.js'
import { closeAfterSave } from '../../utils/forms.js'
import { buildMapPayload, mapToForm, validateMapForm } from './mapForm.js'

function MapFields({ form, errors, onChange }) {
  return (
    <>
      <FormField id="map-name" name="name" label="Nombre" value={form.name} onChange={onChange} error={errors.name} placeholder="Ej: Mirage" />
      <FormField id="map-image" name="image_url" label="URL de la imagen" type="url" value={form.image_url} onChange={onChange} error={errors.image_url} placeholder="https://…/mirage.jpg" />
      <FormField as="checkbox" name="active_pool" label="En el map pool activo" value={form.active_pool} onChange={onChange} />
    </>
  )
}

export default function MapFormModal({ open, map, onClose, onSaved }) {
  const { form, errors, handleChange, modalProps } = useForm({
    open,
    buildInitial: () => mapToForm(map),
    deps: [map],
    validate: validateMapForm,
    submit: (values) => {
      const payload = buildMapPayload(values)
      return map ? updateMap(map.id, payload) : createMap(payload)
    },
    onSuccess: closeAfterSave(onSaved, onClose),
    errorMessage: 'No se pudo guardar el mapa. Intentalo de nuevo.',
  })

  return (
    <ModalForm
      {...modalProps}
      title={map ? 'Editar mapa' : 'Nuevo mapa'}
      onClose={onClose}
      submitLabel={map ? 'Guardar cambios' : 'Crear mapa'}
    >
      <MapFields form={form} errors={errors} onChange={handleChange} />
    </ModalForm>
  )
}
