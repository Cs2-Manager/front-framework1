import ModalForm from '../common/ModalForm.jsx'
import useForm from '../../hooks/useForm.js'
import { closeAfterSave } from '../../utils/forms.js'
import {
  createGrenadeLineup,
  updateGrenadeLineup,
} from '../../services/grenadeLineups.js'
import {
  buildGrenadePayload,
  grenadeToForm,
  validateGrenadeForm,
} from './grenadeForm.js'
import { GrenadeFormFields } from './GrenadeFormFields.jsx'

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
      <GrenadeFormFields
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
