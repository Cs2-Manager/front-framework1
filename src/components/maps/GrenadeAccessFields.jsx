import FormField from '../common/FormField.jsx'
import { LINEUP_STATUS_OPTIONS } from './grenadeForm.js'

/** Medios, etiquetas y metadatos de publicación/responsable. */
export default function GrenadeAccessFields({
  form,
  errors,
  handleChange,
  updateValues,
  team,
  scope,
}) {
  return (
    <div className="grenade-form-grid">
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
  )
}
