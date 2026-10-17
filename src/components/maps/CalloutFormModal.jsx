import FormField from '../common/FormField.jsx'
import ModalForm from '../common/ModalForm.jsx'
import useForm from '../../hooks/useForm.js'
import { createCallout, updateCallout } from '../../services/maps.js'
import { closeAfterSave } from '../../utils/forms.js'

const EMPTY = { zone_name: '', x_ratio: 0.5, y_ratio: 0.5 }

const toFormValues = (callout) =>
  callout
    ? {
        zone_name: callout.zone_name,
        x_ratio: callout.x_ratio,
        y_ratio: callout.y_ratio,
      }
    : EMPTY

export default function CalloutFormModal({
  open,
  map,
  callout,
  onClose,
  onSaved,
}) {
  const { form, errors, updateValues, handleChange, modalProps } = useForm({
    open,
    buildInitial: () => toFormValues(callout),
    deps: [callout],
    validate: (values) => {
      const next = {}
      if (!values.zone_name.trim())
        next.zone_name = 'El nombre de la zona es obligatorio.'
      if (values.x_ratio < 0 || values.x_ratio > 1)
        next.x_ratio = 'Debe estar entre 0 y 1.'
      if (values.y_ratio < 0 || values.y_ratio > 1)
        next.y_ratio = 'Debe estar entre 0 y 1.'
      return next
    },
    submit: (values) => {
      const payload = {
        zone_name: values.zone_name.trim(),
        x_ratio: values.x_ratio,
        y_ratio: values.y_ratio,
      }
      return callout
        ? updateCallout(map.id, callout.id, payload)
        : createCallout(map.id, payload)
    },
    onSuccess: closeAfterSave(onSaved, onClose),
    errorMessage: 'No se pudo guardar el callout. Intentalo de nuevo.',
  })

  function handleImageClick(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    updateValues({
      x_ratio: Math.max(0, Math.min(1, x)),
      y_ratio: Math.max(0, Math.min(1, y)),
    })
  }

  return (
    <ModalForm
      {...modalProps}
      title={callout ? 'Editar zona' : 'Nueva zona'}
      onClose={onClose}
      submitLabel={callout ? 'Guardar cambios' : 'Agregar zona'}
    >
      {map?.image_url && (
        <div className="callout-pick">
          <p className="callout-pick-hint">
            {callout
              ? 'Hacé clic en la imagen para reposicionar la zona.'
              : 'Hacé clic en la imagen para marcar la ubicación de la zona.'}
          </p>
          <div className="callout-pick-image" onClick={handleImageClick}>
            <img src={map.image_url} alt={map.name} />
            <span
              className="callout-pick-dot"
              style={{
                left: `${form.x_ratio * 100}%`,
                top: `${form.y_ratio * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      <FormField
        id="callout-name"
        name="zone_name"
        label="Nombre de la zona"
        value={form.zone_name}
        onChange={handleChange}
        error={errors.zone_name}
        placeholder="Ej: B Site"
      />

      <div className="callout-ratios">
        <FormField
          id="callout-x"
          name="x_ratio"
          label="Posición X (0–1)"
          type="number"
          min="0"
          max="1"
          step="0.01"
          value={form.x_ratio}
          onChange={handleChange}
          error={errors.x_ratio}
        />
        <FormField
          id="callout-y"
          name="y_ratio"
          label="Posición Y (0–1)"
          type="number"
          min="0"
          max="1"
          step="0.01"
          value={form.y_ratio}
          onChange={handleChange}
          error={errors.y_ratio}
        />
      </div>
    </ModalForm>
  )
}
