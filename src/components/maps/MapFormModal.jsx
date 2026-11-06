import FormField from '../common/FormField.jsx'
import ModalForm from '../common/ModalForm.jsx'
import useForm from '../../hooks/useForm.js'
import { createMap, updateMap } from '../../services/maps.js'
import { closeAfterSave } from '../../utils/forms.js'
import {
  MAP_CATEGORY_OPTIONS,
  MAP_STATUS_OPTIONS,
  buildEditableMapPayload,
  mapToEditableForm,
  validateEditableMapForm,
} from './mapForm.js'

function MapFields({ form, errors, onChange }) {
  return (
    <>
      <FormField id="map-name" name="name" label="Nombre" value={form.name} onChange={onChange} error={errors.name} placeholder="Ej: Mirage" />
      <FormField id="map-image" name="image_url" label="URL de la imagen" type="url" value={form.image_url} onChange={onChange} error={errors.image_url} placeholder="https://…/mirage.jpg" />
      <p className="text-muted">La imagen táctica conserva las posiciones de los callouts. La portada es independiente.</p>
      <FormField id="map-cover" name="cover_url" label="URL de portada (opcional)" type="url" value={form.cover_url || ''} onChange={onChange} error={errors.cover_url} />
      <FormField id="map-description" name="description" label="Descripción" as="textarea" value={form.description || ''} onChange={onChange} error={errors.description} maxLength={4000} />
      <FormField as="checkbox" name="active_pool" label="En el map pool activo" value={form.active_pool} onChange={onChange} />
      <fieldset className="map-catalog-fields">
        <legend>Metadatos del catálogo</legend>
        <FormField id="map-category" name="category" label="Categoría" as="select" value={form.category || 'COMPETITIVE'} onChange={onChange} options={MAP_CATEGORY_OPTIONS} />
        <FormField id="map-status" name="status" label="Estado" as="select" value={form.status || 'ACTIVE'} onChange={onChange} options={MAP_STATUS_OPTIONS} />
        <FormField id="map-slug" name="slug" label="Slug (opcional)" value={form.slug || ''} onChange={onChange} placeholder="mirage" />
        <FormField id="map-display-order" name="display_order" label="Orden de catálogo" type="number" min="0" step="1" value={form.display_order ?? ''} onChange={onChange} error={errors.display_order} />
        <FormField id="map-release-date" name="release_date" label="Fecha de lanzamiento" type="date" value={form.release_date || ''} onChange={onChange} error={errors.release_date} />
        <FormField id="map-image-source" name="image_source" label="Fuente de la imagen" value={form.image_source || ''} onChange={onChange} />
        <FormField id="map-top-down-source" name="top_down_source" label="Fuente del plano táctico" value={form.top_down_source || ''} onChange={onChange} />
        <FormField id="map-visual-version" name="visual_version" label="Versión visual" type="number" min="1" step="1" value={form.visual_version ?? ''} onChange={onChange} />
      </fieldset>
    </>
  )
}

export default function MapFormModal({ open, map, onClose, onSaved }) {
  const { form, errors, handleChange, modalProps } = useForm({
    open,
    buildInitial: () => mapToEditableForm(map),
    deps: [map],
    validate: validateEditableMapForm,
    submit: (values) => {
      const payload = buildEditableMapPayload(values, {
        includeDefaults: Boolean(map),
      })
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
