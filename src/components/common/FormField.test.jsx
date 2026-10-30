import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import FormField from './FormField.jsx'

describe('FormField', () => {
  it('renders a labelled text input, placeholder and error', () => {
    render(
      <FormField
        id="email"
        name="email"
        label="Email"
        value=""
        onChange={() => {}}
        error="Requerido"
        placeholder="tu@email.com"
      />,
    )

    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveAttribute('placeholder', 'tu@email.com')
    expect(input).toHaveClass('form-input', 'invalid')
    expect(screen.getByText('Requerido')).toHaveClass('form-error')
  })

  it('renders select options from the options prop', () => {
    render(
      <FormField
        as="select"
        id="type"
        name="type"
        label="Tipo"
        value="a"
        onChange={() => {}}
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
      />,
    )

    expect(screen.getByRole('option', { name: 'A' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'B' })).toBeInTheDocument()
  })

  it('renders a checkbox and forwards changes', () => {
    const onChange = vi.fn()
    render(
      <FormField
        as="checkbox"
        name="active"
        label="Activo"
        value
        onChange={onChange}
      />,
    )

    const checkbox = screen.getByLabelText('Activo')
    expect(checkbox).toBeChecked()
    fireEvent.click(checkbox)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('renders a textarea', () => {
    render(
      <FormField
        as="textarea"
        id="notes"
        name="notes"
        label="Notas"
        value="hola"
        onChange={() => {}}
      />,
    )

    expect(screen.getByLabelText('Notas').tagName).toBe('TEXTAREA')
  })
})
