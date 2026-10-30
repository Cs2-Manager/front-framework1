import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import useForm from './useForm.js'

const submitEvent = () => ({ preventDefault: vi.fn() })

describe('useForm', () => {
  it('exposes the initial values and submit props', () => {
    const { result } = renderHook(() =>
      useForm({ initial: { name: 'a' }, submit: vi.fn() }),
    )

    expect(result.current.form).toEqual({ name: 'a' })
    expect(result.current.errors).toEqual({})
    expect(result.current.serverError).toBe('')
    expect(result.current.submitting).toBe(false)
    expect(result.current.modalProps.onSubmit).toBeTypeOf('function')
  })

  it('derives the form from buildInitial and resets when deps change', () => {
    const { result, rerender } = renderHook(
      ({ item }) =>
        useForm({
          buildInitial: () => ({ name: item }),
          deps: [item],
          submit: vi.fn(),
        }),
      { initialProps: { item: 'a' } },
    )

    expect(result.current.form).toEqual({ name: 'a' })
    rerender({ item: 'b' })
    expect(result.current.form).toEqual({ name: 'b' })
  })

  it('handles text, number and checkbox changes and clears their errors', () => {
    const { result } = renderHook(() =>
      useForm({
        initial: { text: '', count: 1, flag: false },
        submit: vi.fn(),
      }),
    )

    act(() => {
      result.current.handleChange({
        target: { name: 'text', type: 'text', value: 'hola' },
      })
    })
    expect(result.current.form.text).toBe('hola')

    act(() => {
      result.current.handleChange({
        target: { name: 'count', type: 'number', value: '3' },
      })
    })
    expect(result.current.form.count).toBe(3)

    act(() => {
      result.current.handleChange({
        target: { name: 'count', type: 'number', value: '' },
      })
    })
    expect(result.current.form.count).toBe('')

    act(() => {
      result.current.handleChange({
        target: { name: 'flag', type: 'checkbox', checked: true, value: 'on' },
      })
    })
    expect(result.current.form.flag).toBe(true)

    act(() => {
      result.current.updateValues({ text: 'adios' })
    })
    expect(result.current.form.text).toBe('adios')
    expect(result.current.errors.text).toBeUndefined()
  })

  it('does not submit when validation fails', async () => {
    const submit = vi.fn()
    const { result } = renderHook(() =>
      useForm({
        initial: { name: '' },
        validate: (values) => (values.name ? {} : { name: 'Requerido' }),
        submit,
      }),
    )

    await act(async () => {
      await result.current.handleSubmit(submitEvent())
    })

    expect(submit).not.toHaveBeenCalled()
    expect(result.current.errors).toEqual({ name: 'Requerido' })
  })

  it('submits valid values and calls onSuccess', async () => {
    const submit = vi.fn().mockResolvedValue({ id: 1 })
    const onSuccess = vi.fn()
    const { result } = renderHook(() =>
      useForm({ initial: { name: 'a' }, submit, onSuccess }),
    )

    await act(async () => {
      await result.current.handleSubmit(submitEvent())
    })

    expect(submit).toHaveBeenCalledWith({ name: 'a' })
    expect(onSuccess).toHaveBeenCalledWith({ id: 1 })
    expect(result.current.submitting).toBe(false)
  })

  it('maps server field errors back to the form', async () => {
    const submit = vi
      .fn()
      .mockRejectedValue({ response: { data: { fields: { name: 'Inválido' } } } })
    const { result } = renderHook(() =>
      useForm({ initial: { name: 'a' }, submit }),
    )

    await act(async () => {
      await result.current.handleSubmit(submitEvent())
    })

    expect(result.current.errors).toEqual({ name: 'Inválido' })
    expect(result.current.serverError).toBe('')
  })

  it('uses the API message as the server error fallback', async () => {
    const submit = vi
      .fn()
      .mockRejectedValue({ response: { data: { error: 'boom' } } })
    const { result } = renderHook(() =>
      useForm({ initial: {}, submit, errorMessage: 'fallback' }),
    )

    await act(async () => {
      await result.current.handleSubmit(submitEvent())
    })

    expect(result.current.serverError).toBe('boom')
  })
})
