import FormField from '../common/FormField.jsx'

/** Texto libre del lanzamiento: descripción, instrucciones y notas. */
export default function GrenadeDescriptionFields({
  form,
  handleChange,
}) {
  return (
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
  )
}
