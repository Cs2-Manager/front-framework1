import FormField from '../common/FormField.jsx'
import ModalForm from '../common/ModalForm.jsx'
import useForm from '../../hooks/useForm.js'
import { createCallout, updateCallout } from '../../services/maps.js'
import { closeAfterSave } from '../../utils/forms.js'
import {
  buildCalloutPayload,
  calloutToForm,
  ratiosFromClick,
  validateCalloutForm,
} from './calloutForm.js'

function CalloutPicker({ map, callout, form, onPick }) {
  if (!map?.image_url) return null
  const hint = callout
    ? 'Hacé clic en la imagen para reposicionar la zona.'
    : 'Hacé clic en la imagen para marcar la ubicación de la zona.'
  const dotStyle = {
    left: `${form.x_ratio * 100}%`,
    top: `${form.y_ratio * 100}%`,
  }

  return (
    <div className="callout-pick">
      <p className="callout-pick-hint">{hint}</p>
      <div className="callout-pick-image" onClick={onPick}>
        <img src={map.image_url} alt={map.name} />
        <span className="callout-pick-dot" style={dotStyle} />
      </div>
    </div>
  )
}

function CalloutFields({ form, errors, onChange }) {
  return (
    <>
      <FormField id="callout-name" name="zone_name" label="Nombre de la zona" value={form.zone_name} onChange={onChange} error={errors.zone_name} placeholder="Ej: B Site" />
      <div className="callout-ratios">
        <FormField id="callout-x" name="x_ratio" label="Posición X (0–1)" type="number" min="0" max="1" step="0.01" value={form.x_ratio} onChange={onChange} error={errors.x_ratio} />
        <FormField id="callout-y" name="y_ratio" label="Posición Y (0–1)" type="number" min="0" max="1" step="0.01" value={form.y_ratio} onChange={onChange} error={errors.y_ratio} />
      </div>
    </>
  )
}

export default function CalloutFormModal({ open, map, callout, onClose, onSaved }) {
  const { form, errors, updateValues, handleChange, modalProps } = useForm({
    open,
    buildInitial: () => calloutToForm(callout),
    deps: [callout],
    validate: validateCalloutForm,
    submit: (values) => {
      const payload = buildCalloutPayload(values)
      return callout
        ? updateCallout(map.id, callout.id, payload)
        : createCallout(map.id, payload)
    },
    onSuccess: closeAfterSave(onSaved, onClose),
    errorMessage: 'No se pudo guardar el callout. Intentalo de nuevo.',
  })

  const handleImageClick = (event) => updateValues(ratiosFromClick(event))

  return (
    <ModalForm
      {...modalProps}
      title={callout ? 'Editar zona' : 'Nueva zona'}
      onClose={onClose}
      submitLabel={callout ? 'Guardar cambios' : 'Agregar zona'}
    >
      <CalloutPicker map={map} callout={callout} form={form} onPick={handleImageClick} />
      <CalloutFields form={form} errors={errors} onChange={handleChange} />
    </ModalForm>
  )
}
