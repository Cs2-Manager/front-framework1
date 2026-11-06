import FormField from '../common/FormField.jsx'
import ModalForm from '../common/ModalForm.jsx'
import useForm from '../../hooks/useForm.js'
import { closeAfterSave } from '../../utils/forms.js'
import {
  createGrenadeLineup,
  updateGrenadeLineup,
} from '../../services/grenadeLineups.js'
import GrenadeEditor from './GrenadeEditor.jsx'
import {
  DIFFICULTY_OPTIONS,
  GRENADE_TYPE_OPTIONS,
  LINEUP_STATUS_OPTIONS,
  SIDE_OPTIONS,
  THROW_TYPE_OPTIONS,
  buildGrenadePayload,
  grenadeToForm,
  validateGrenadeForm,
} from './grenadeForm.js'

function MediaFields({ form, errors, updateValues, busy }) {
  const media = form.media || []
  const setMedia = (next) => updateValues({ media: next })

  return (
    <fieldset className="grenade-media" disabled={busy}>
      <legend>Medios de demostración</legend>
      {media.map((item, index) => (
        <div className="grenade-media-row" key={index}>
          <label>
            Tipo
            <select
              value={item.kind}
              onChange={(event) =>
                setMedia(
                  media.map((entry, position) =>
                    position === index
                      ? { ...entry, kind: event.target.value }
                      : entry,
                  ),
                )
              }
            >
              <option value="IMAGE">Imagen</option>
              <option value="VIDEO">Video</option>
            </select>
          </label>
          <label>
            URL HTTPS
            <input
              type="url"
              value={item.url}
              aria-label={`URL del medio ${index + 1}`}
              onChange={(event) =>
                setMedia(
                  media.map((entry, position) =>
                    position === index
                      ? { ...entry, url: event.target.value }
                      : entry,
                  ),
                )
              }
            />
          </label>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setMedia(media.filter((_, position) => position !== index))}
          >
            Quitar medio
          </button>
          {errors[`media-${index}`] && (
            <p className="form-error">{errors[`media-${index}`]}</p>
          )}
        </div>
      ))}
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => setMedia([...media, { kind: 'IMAGE', url: '', thumbnail_url: '' }])}
      >
        Agregar medio
      </button>
    </fieldset>
  )
}

function GrenadeFields({ form, errors, handleChange, updateValues, map, team, scope, busy }) {
  return (
    <>
      <div className="grenade-form-grid">
        <FormField
          id="grenade-title"
          name="title"
          label="Nombre"
          value={form.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="Ej: Smoke CT desde T"
        />
        <FormField
          id="grenade-type"
          name="type"
          label="Tipo de granada"
          as="select"
          value={form.type}
          onChange={handleChange}
          error={errors.type}
          options={GRENADE_TYPE_OPTIONS}
        />
        <FormField
          id="grenade-side"
          name="side"
          label="Lado"
          as="select"
          value={form.side}
          onChange={handleChange}
          error={errors.side}
          options={SIDE_OPTIONS}
        />
        <FormField
          id="grenade-difficulty"
          name="difficulty"
          label="Dificultad"
          as="select"
          value={form.difficulty}
          onChange={handleChange}
          error={errors.difficulty}
          options={DIFFICULTY_OPTIONS}
        />
        <FormField
          id="grenade-throw"
          name="throw_type"
          label="Técnica de lanzamiento"
          as="select"
          value={form.throw_type}
          onChange={handleChange}
          options={THROW_TYPE_OPTIONS}
        />
        <FormField
          id="grenade-game-version"
          name="game_version"
          label="Versión del juego"
          value={form.game_version}
          onChange={handleChange}
          placeholder="Ej: 1.40"
        />
        <FormField
          id="grenade-launch-zone"
          name="launch_zone"
          label="Zona de origen"
          value={form.launch_zone}
          onChange={handleChange}
        />
        <FormField
          id="grenade-impact-zone"
          name="impact_zone"
          label="Zona de destino"
          value={form.impact_zone}
          onChange={handleChange}
        />
        <FormField
          id="grenade-video"
          name="video_url"
          label="Video de YouTube (opcional)"
          type="url"
          value={form.video_url}
          onChange={handleChange}
          error={errors.video_url}
          placeholder="https://youtu.be/…"
        />
        <FormField
          id="grenade-image"
          name="image_url"
          label="Imagen demostrativa HTTPS (opcional)"
          type="url"
          value={form.image_url}
          onChange={handleChange}
          error={errors.image_url}
        />
        <FormField
          id="grenade-tags"
          name="tags"
          label="Etiquetas (separadas por coma)"
          value={form.tags}
          onChange={handleChange}
          placeholder="execute, ct, humo"
        />
        {scope === 'OFFICIAL' && (
          <FormField
            id="grenade-status"
            name="status"
            label="Estado de publicación"
            as="select"
            value={form.status}
            onChange={handleChange}
            options={LINEUP_STATUS_OPTIONS}
          />
        )}
        {scope === 'TEAM' && team?.members?.length > 0 && (
          <label className="form-group" htmlFor="grenade-responsible">
            Jugador responsable
            <select
              id="grenade-responsible"
              value={form.responsible_id ?? ''}
              onChange={(event) =>
                updateValues({
                  responsible_id: event.target.value
                    ? Number(event.target.value)
                    : null,
                })
              }
            >
              <option value="">Sin asignar</option>
              {team.members.map((member) => (
                <option key={member.user.id} value={member.user.id}>
                  {member.user.nickname || member.user.username}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <GrenadeEditor
        map={map}
        value={form}
        onChange={(next) => updateValues(next)}
        readOnly={busy}
      />

      <div className="grenade-form-grid">
        <FormField
          id="grenade-description"
          name="description"
          label="Descripción"
          as="textarea"
          value={form.description}
          onChange={handleChange}
          maxLength={4000}
        />
        <FormField
          id="grenade-instructions"
          name="instructions"
          label="Instrucciones de ejecución"
          as="textarea"
          value={form.instructions}
          onChange={handleChange}
          maxLength={4000}
        />
        <FormField
          id="grenade-notes"
          name="notes"
          label="Notas"
          as="textarea"
          value={form.notes}
          onChange={handleChange}
          maxLength={4000}
        />
      </div>

      <MediaFields
        form={form}
        errors={errors}
        updateValues={updateValues}
        busy={busy}
      />
    </>
  )
}

export default function GrenadeFormModal({
  open,
  map,
  team,
  lineup,
  scope = 'PERSONAL',
  onClose,
  onSaved,
}) {
  const { form, errors, handleChange, updateValues, modalProps } = useForm({
    open,
    buildInitial: () => grenadeToForm(lineup, { mapId: map?.id }),
    deps: [lineup, map?.id],
    validate: validateGrenadeForm,
    submit: (values) => {
      const payload = buildGrenadePayload(values, { scope })
      if (lineup) {
        return updateGrenadeLineup(lineup.id, {
          ...payload,
          version: lineup.version,
        })
      }
      return createGrenadeLineup(map.id, payload, scope)
    },
    onSuccess: closeAfterSave(onSaved, onClose),
    errorMessage: 'No pudimos guardar la granada. Intentalo de nuevo.',
  })

  const title = lineup ? 'Editar granada' : 'Nueva granada'
  return (
    <ModalForm
      {...modalProps}
      title={title}
      size="modal-lg"
      onClose={onClose}
      submitLabel={lineup ? 'Guardar cambios' : 'Crear granada'}
    >
      <GrenadeFields
        form={form}
        errors={errors}
        handleChange={handleChange}
        updateValues={updateValues}
        map={map}
        team={team}
        scope={scope}
        busy={modalProps.submitting}
      />
    </ModalForm>
  )
}
