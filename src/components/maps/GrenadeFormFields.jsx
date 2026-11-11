import GrenadeAccessFields from './GrenadeAccessFields.jsx'
import GrenadeDescriptionFields from './GrenadeDescriptionFields.jsx'
import GrenadeEditor from './GrenadeEditor.jsx'
import { GrenadeMediaFields } from './GrenadeMediaFields.jsx'
import GrenadeMetadataFields from './GrenadeMetadataFields.jsx'

/**
 * Formulario completo de un lanzamiento: datos, editor visual de posiciones,
 * texto libre y medios de demostración.
 */
export function GrenadeFormFields({
  form,
  errors,
  handleChange,
  updateValues,
  map,
  team,
  scope,
  busy,
}) {
  return (
    <>
      <GrenadeMetadataFields
        form={form}
        errors={errors}
        handleChange={handleChange}
      />

      <GrenadeEditor
        map={map}
        value={form}
        onChange={(next) => updateValues(next)}
        readOnly={busy}
      />

      <GrenadeDescriptionFields form={form} handleChange={handleChange} />

      <GrenadeAccessFields
        form={form}
        errors={errors}
        handleChange={handleChange}
        updateValues={updateValues}
        team={team}
        scope={scope}
      />

      <GrenadeMediaFields
        form={form}
        errors={errors}
        updateValues={updateValues}
        busy={busy}
      />
    </>
  )
}
