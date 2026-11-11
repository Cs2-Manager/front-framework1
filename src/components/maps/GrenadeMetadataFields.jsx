import FormField from '../common/FormField.jsx'
import {
  DIFFICULTY_OPTIONS,
  GRENADE_TYPE_OPTIONS,
  SIDE_OPTIONS,
  THROW_TYPE_OPTIONS,
} from './grenadeForm.js'

/** Datos básicos del lanzamiento: nombre, tipo, lado y técnica. */
export default function GrenadeMetadataFields({ form, errors, handleChange }) {
  return (
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
    </div>
  )
}
