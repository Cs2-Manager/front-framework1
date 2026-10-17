import FormField from '../common/FormField.jsx'
import ModalForm from '../common/ModalForm.jsx'
import OptionList from '../common/OptionList.jsx'
import useForm from '../../hooks/useForm.js'
import { createLineup, GRENADE_TYPES, SIDES, updateLineup } from '../../services/lineups.js'
import { extractYoutubeId } from '../../utils/video.js'
import { closeAfterSave } from '../../utils/forms.js'
import { validateUrl } from '../../utils/validation.js'

const EMPTY = {
  map_id: '',
  type: '',
  side: '',
  title: '',
  description: '',
  video_url: '',
}

const toFormValues = (lineup, maps) =>
  lineup
    ? {
        map_id: String(lineup.map_id),
        type: lineup.type,
        side: lineup.side,
        title: lineup.title,
        description: lineup.description,
        video_url: lineup.video_url,
      }
    : { ...EMPTY, map_id: maps[0] ? String(maps[0].id) : '' }

export default function LineupFormModal({ open, maps, lineup, onClose, onSaved }) {
  const { form, errors, handleChange, modalProps } = useForm({
      open,
      buildInitial: () => toFormValues(lineup, maps),
      deps: [lineup, maps],
      validate: (values) => {
        const next = {}
        if (!values.map_id) next.map_id = 'Seleccioná un mapa.'
        if (!values.type) next.type = 'Seleccioná el tipo de granada.'
        if (!values.side) next.side = 'Seleccioná el bando.'
        if (!values.title.trim()) next.title = 'El título es obligatorio.'
        const urlError = validateUrl(values.video_url, {
          requiredMessage: 'La URL del video es obligatoria.',
          invalidMessage: 'Ingresá un enlace válido de YouTube.',
          isValid: extractYoutubeId,
        })
        if (urlError) next.video_url = urlError
        return next
      },
      submit: (values) => {
        const payload = {
          map_id: Number(values.map_id),
          type: values.type,
          side: values.side,
          title: values.title.trim(),
          description: values.description.trim(),
          video_url: values.video_url.trim(),
        }
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
      <div className="lineup-form-grid">
        <FormField
          as="select"
          id="lineup-map"
          name="map_id"
          label="Mapa"
          value={form.map_id}
          onChange={handleChange}
          error={errors.map_id}
        >
          <option value="">Seleccioná un mapa</option>
          {maps.map((map) => (
            <option key={map.id} value={map.id}>
              {map.name}
            </option>
          ))}
        </FormField>

        <FormField
          as="select"
          id="lineup-type"
          name="type"
          label="Tipo"
          value={form.type}
          onChange={handleChange}
          error={errors.type}
        >
          <option value="">Seleccioná el tipo</option>
          <OptionList values={GRENADE_TYPES} />
        </FormField>

        <FormField
          as="select"
          id="lineup-side"
          name="side"
          label="Bando"
          value={form.side}
          onChange={handleChange}
          error={errors.side}
        >
          <option value="">Seleccioná el bando</option>
          <OptionList values={SIDES} />
        </FormField>
      </div>

      <FormField
        id="lineup-title"
        name="title"
        label="Título"
        value={form.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Ej: Smoke de CT hacia el sitio B"
      />

      <FormField
        id="lineup-video"
        name="video_url"
        label="URL del video (YouTube)"
        type="url"
        value={form.video_url}
        onChange={handleChange}
        error={errors.video_url}
        placeholder="https://www.youtube.com/watch?v=…"
      />

      <FormField
        as="textarea"
        id="lineup-desc"
        name="description"
        label="Descripción"
        rows="3"
        value={form.description}
        onChange={handleChange}
        placeholder="Pasos, notas o utilidades necesarias…"
      />
    </ModalForm>
  )
}
