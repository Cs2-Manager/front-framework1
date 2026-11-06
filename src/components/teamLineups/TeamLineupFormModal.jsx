import FormField from '../common/FormField.jsx'
import { useEffect, useState } from 'react'
import { fetchMaps } from '../../services/maps.js'
import ModalForm from '../common/ModalForm.jsx'
import useForm from '../../hooks/useForm.js'
import {
  createTeamLineup,
  updateTeamLineup,
} from '../../services/teamLineups.js'
import { closeAfterSave } from '../../utils/forms.js'
import {
  buildTeamLineupPayload,
  teamLineupToForm,
  validateTeamLineupForm,
} from './teamLineupForm.js'

export default function TeamLineupFormModal({
  open,
  teamId,
  lineup,
  onClose,
  onSaved,
}) {
  const [maps, setMaps] = useState([])
  const [mapError, setMapError] = useState('')
  useEffect(() => {
    if (open) fetchMaps().then(setMaps).catch(() => setMapError('No se pudieron cargar los mapas.'))
  }, [open])
  const { form, errors, handleChange, modalProps } = useForm({
    open,
    buildInitial: () => teamLineupToForm(lineup),
    deps: [lineup],
    validate: validateTeamLineupForm,
    submit: (values) => {
      const payload = buildTeamLineupPayload(values)
      return lineup
        ? updateTeamLineup(teamId, lineup.id, payload)
        : createTeamLineup(teamId, payload)
    },
    onSuccess: closeAfterSave(onSaved, onClose),
    errorMessage:
      'No pudimos guardar la alineación. Intentalo de nuevo.',
  })

  return (
    <ModalForm
      {...modalProps}
      title={lineup ? 'Editar alineación' : 'Nueva alineación'}
      onClose={onClose}
      submitLabel={lineup ? 'Guardar cambios' : 'Crear alineación'}
    >
      <FormField
        id="team-lineup-name"
        name="name"
        label="Nombre"
        value={form.name}
        onChange={handleChange}
        error={errors.name}
        maxLength={80}
        placeholder="Ej: Alineación titular"
        required
      />
      <FormField
        as="textarea"
        id="team-lineup-description"
        name="description"
        label="Descripción (opcional)"
        rows="3"
        value={form.description}
        onChange={handleChange}
        error={errors.description}
        placeholder="Notas sobre esta alineación…"
      />
      <label htmlFor="lineup-map">Mapa asociado</label>
      <select id="lineup-map" name="map_id" value={form.map_id || ''} onChange={handleChange} disabled={lineup?.is_primary}>
        <option value="">General (todos los mapas)</option>
        {maps.map(map => <option key={map.id} value={map.id}>{map.name}</option>)}
      </select>
      {mapError && <p role="alert">{mapError}</p>}
      <FormField as="textarea" name="notes" label="Notas tácticas" value={form.notes || ''} onChange={handleChange} error={errors.notes} maxLength={4000} />
    </ModalForm>
  )
}
