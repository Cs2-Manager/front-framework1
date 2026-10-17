import FormField from '../common/FormField.jsx'
import ModalForm from '../common/ModalForm.jsx'
import useForm from '../../hooks/useForm.js'
import { createMap, updateMap } from '../../services/maps.js'
import { closeAfterSave } from '../../utils/forms.js'

const EMPTY = { name: '', image_url: '', active_pool: false }

const toFormValues = (map) =>
  map
    ? { name: map.name, image_url: map.image_url, active_pool: map.active_pool }
    : EMPTY

export default function MapFormModal({ open, map, onClose, onSaved }) {
  const { form, errors, handleChange, modalProps } = useForm({
      open,
      buildInitial: () => toFormValues(map),
      deps: [map],
      validate: (values) => {
        const next = {}
        if (!values.name.trim()) next.name = 'El nombre es obligatorio.'
        if (!values.image_url.trim())
          next.image_url = 'La URL de la imagen es obligatoria.'
        return next
      },
      submit: (values) => {
        const payload = {
          name: values.name.trim(),
          image_url: values.image_url.trim(),
          active_pool: values.active_pool,
        }
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
      <FormField
        id="map-name"
        name="name"
        label="Nombre"
        value={form.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="Ej: Mirage"
      />
      <FormField
        id="map-image"
        name="image_url"
        label="URL de la imagen"
        type="url"
        value={form.image_url}
        onChange={handleChange}
        error={errors.image_url}
        placeholder="https://…/mirage.jpg"
      />
      <FormField
        as="checkbox"
        name="active_pool"
        label="En el map pool activo"
        value={form.active_pool}
        onChange={handleChange}
      />
    </ModalForm>
  )
}
