import FormField from '../common/FormField.jsx'
import ModalForm from '../common/ModalForm.jsx'
import OptionList from '../common/OptionList.jsx'
import useForm from '../../hooks/useForm.js'
import { createLineup, GRENADE_TYPES, SIDES, updateLineup } from '../../services/lineups.js'
import { closeAfterSave } from '../../utils/forms.js'
import {
  buildLineupPayload,
  lineupToForm,
  validateLineupForm,
} from './lineupForm.js'

function LineupMetaFields({ maps, form, errors, onChange }) {
  return (
    <div className="lineup-form-grid">
      <FormField as="select" id="lineup-map" name="map_id" label="Mapa" value={form.map_id} onChange={onChange} error={errors.map_id}>
        <option value="">Seleccioná un mapa</option>
        {maps.map((map) => (
          <option key={map.id} value={map.id}>{map.name}</option>
        ))}
      </FormField>
      <FormField as="select" id="lineup-type" name="type" label="Tipo" value={form.type} onChange={onChange} error={errors.type}>
        <option value="">Seleccioná el tipo</option>
        <OptionList values={GRENADE_TYPES} />
      </FormField>
      <FormField as="select" id="lineup-side" name="side" label="Bando" value={form.side} onChange={onChange} error={errors.side}>
        <option value="">Seleccioná el bando</option>
        <OptionList values={SIDES} />
      </FormField>
    </div>
  )
}

function LineupDetailFields({ form, errors, onChange }) {
  return (
    <>
      <FormField id="lineup-title" name="title" label="Título" value={form.title} onChange={onChange} error={errors.title} placeholder="Ej: Smoke de CT hacia el sitio B" />
      <FormField id="lineup-video" name="video_url" label="URL del video (YouTube)" type="url" value={form.video_url} onChange={onChange} error={errors.video_url} placeholder="https://www.youtube.com/watch?v=…" />
      <FormField as="textarea" id="lineup-desc" name="description" label="Descripción" rows="3" value={form.description} onChange={onChange} placeholder="Pasos, notas o utilidades necesarias…" />
    </>
  )
}

export default function LineupFormModal({ open, maps, lineup, onClose, onSaved }) {
  const { form, errors, handleChange, modalProps } = useForm({
    open,
    buildInitial: () => lineupToForm(lineup, maps),
    deps: [lineup, maps],
    validate: validateLineupForm,
    submit: (values) => {
      const payload = buildLineupPayload(values)
      return lineup ? updateLineup(lineup.id, payload) : createLineup(payload)
    },
    onSuccess: closeAfterSave(onSaved, onClose),
    errorMessage: 'No se pudo guardar el lineup. Intentalo de nuevo.',
  })

  return (
    <ModalForm
      {...modalProps}
      title={lineup ? 'Editar lineup' : 'Nuevo lineup'}
      onClose={onClose}
      submitLabel={lineup ? 'Guardar cambios' : 'Crear lineup'}
    >
      <LineupMetaFields maps={maps} form={form} errors={errors} onChange={handleChange} />
      <LineupDetailFields form={form} errors={errors} onChange={handleChange} />
    </ModalForm>
  )
}
