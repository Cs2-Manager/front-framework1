import { useNavigate } from 'react-router-dom'

import Alert from '../common/Alert.jsx'
import FormActions from '../common/FormActions.jsx'
import FormField from '../common/FormField.jsx'
import useForm from '../../hooks/useForm.js'
import { createTeam, updateTeam } from '../../services/teams.js'
import {
  TEAM_VISIBILITY_OPTIONS,
  buildTeamPayload,
  teamToForm,
  validateTeamForm,
} from './teamForm.js'

function TeamFields({ form, errors, onChange }) {
  return (
    <div className="team-form-grid">
      <FormField
        id="team-name"
        name="name"
        label="Nombre del equipo"
        value={form.name}
        onChange={onChange}
        error={errors.name}
        maxLength={80}
        required
      />
      <FormField
        id="team-tag"
        name="tag"
        label="Tag (opcional)"
        value={form.tag}
        onChange={onChange}
        error={errors.tag}
        maxLength={10}
        placeholder="ALPHA"
      />
      <FormField
        id="team-country"
        name="country"
        label="País (código ISO de 2 letras)"
        value={form.country}
        onChange={onChange}
        error={errors.country}
        maxLength={2}
        placeholder="AR"
      />
      <FormField
        id="team-logo"
        name="logo_url"
        label="URL del logo"
        type="url"
        value={form.logo_url}
        onChange={onChange}
        error={errors.logo_url}
        placeholder="https://…/logo.png"
      />
      <FormField
        as="select"
        id="team-visibility"
        name="visibility"
        label="Visibilidad"
        value={form.visibility}
        onChange={onChange}
        error={errors.visibility}
        options={TEAM_VISIBILITY_OPTIONS}
      />
      <FormField
        as="textarea"
        id="team-description"
        name="description"
        label="Descripción"
        value={form.description}
        onChange={onChange}
        error={errors.description}
        rows={4}
        maxLength={1000}
        placeholder="Contá la identidad, objetivos o historia del equipo."
      />
    </div>
  )
}

export default function TeamForm({ team = null }) {
  const navigate = useNavigate()
  const isEdit = Boolean(team)
  const { form, errors, serverError, submitting, handleChange, handleSubmit } =
    useForm({
      initial: teamToForm(team),
      validate: validateTeamForm,
      submit: (values) =>
        isEdit
          ? updateTeam(team.id, buildTeamPayload(values))
          : createTeam(buildTeamPayload(values)),
      onSuccess: (saved) => navigate(`/teams/${saved.id}`),
      errorMessage: isEdit
        ? 'No pudimos guardar el equipo. Intentalo de nuevo.'
        : 'No pudimos crear el equipo. Intentalo de nuevo.',
    })

  return (
    <form className="team-form" onSubmit={handleSubmit} noValidate>
      <Alert>{serverError}</Alert>
      <TeamFields form={form} errors={errors} onChange={handleChange} />
      <FormActions
        onCancel={() => navigate(isEdit ? `/teams/${team.id}` : '/teams')}
        label={isEdit ? 'Guardar cambios' : 'Crear equipo'}
        busy={submitting}
        busyLabel={isEdit ? 'Guardando…' : 'Creando…'}
      />
    </form>
  )
}
