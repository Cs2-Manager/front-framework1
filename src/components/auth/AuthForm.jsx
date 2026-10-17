import Alert from '../common/Alert.jsx'

export default function AuthForm({
  title,
  subtitle,
  notice,
  serverError,
  submitting,
  submitLabel,
  submittingLabel,
  onSubmit,
  footer,
  children,
}) {
  return (
    <div className="page container page-auth">
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <h1>{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>

        {notice}
        <Alert>{serverError}</Alert>

        {children}

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="spinner spinner-sm" aria-hidden="true" />
              {submittingLabel}
            </>
          ) : (
            submitLabel
          )}
        </button>

        <p className="auth-switch">{footer}</p>
      </form>
    </div>
  )
}
