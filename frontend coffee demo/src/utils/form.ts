import type { FieldConfig, FormValue } from '../components/ui/FormFields'
import type { OptionItem } from '../types/models'
import { formatDateInput, formatDateTimeInput, formatTimeInput, toDateOnlyPayload, toDateTimePayload, toTimeSpanPayload } from './format'

type FormState = Record<string, FormValue>

function getFieldValue(field: FieldConfig, item: Record<string, unknown> | null): FormValue {
  const raw = item?.[field.name]

  if (field.type === 'checkbox') {
    return Boolean(raw)
  }

  if (field.type === 'multiselect') {
    if (Array.isArray(raw)) {
      return raw.map((value) => String(value))
    }

    return []
  }

  if (raw === null || raw === undefined) {
    return ''
  }

  if (field.type === 'date') {
    return formatDateInput(String(raw))
  }

  if (field.type === 'datetime-local') {
    return formatDateTimeInput(String(raw))
  }

  if (field.type === 'time') {
    return formatTimeInput(String(raw))
  }

  return String(raw)
}

export function getInitialFormValues(fields: FieldConfig[], item: Record<string, unknown> | null = null): FormState {
  return Object.fromEntries(fields.map((field) => [field.name, getFieldValue(field, item)])) as FormState
}

export function buildPayloadFromFields(fields: FieldConfig[], values: FormState) {
  return Object.fromEntries(
    fields.map((field) => {
      const value = values[field.name]

      if (field.type === 'checkbox') {
        return [field.name, Boolean(value)]
      }

      if (field.type === 'multiselect') {
        const selectedValues = Array.isArray(value) ? value : []
        return [
          field.name,
          selectedValues.map((entry) => (Number.isNaN(Number(entry)) ? entry : Number(entry))),
        ]
      }

      const textValue = String(value ?? '').trim()

      if (field.type === 'number') {
        if (textValue === '') {
          return [field.name, field.nullable ? null : 0]
        }

        return [field.name, Number(textValue)]
      }

      if (field.type === 'select') {
        if (textValue === '') {
          return [field.name, field.nullable ? null : '']
        }

        return [field.name, Number.isNaN(Number(textValue)) ? textValue : Number(textValue)]
      }

      if (field.type === 'date') {
        return [field.name, textValue ? toDateOnlyPayload(textValue) : (field.nullable ? null : '')]
      }

      if (field.type === 'datetime-local') {
        return [field.name, textValue ? toDateTimePayload(textValue) : (field.nullable ? null : '')]
      }

      if (field.type === 'time') {
        return [field.name, textValue ? toTimeSpanPayload(textValue) : '00:00:00']
      }

      return [field.name, textValue === '' && field.nullable ? null : textValue]
    }),
  )
}

export function validateRequiredFields(fields: FieldConfig[], values: FormState, isCreateMode = false) {
  const missing = fields.find((field) => {
    if (!(field.required || (field.requiredOnCreateOnly && isCreateMode))) {
      return false
    }

    const value = values[field.name]
    if (field.type === 'checkbox') {
      return false
    }

    if (field.type === 'multiselect') {
      return !Array.isArray(value) || value.length === 0
    }

    return String(value ?? '').trim() === ''
  })

  if (!missing) {
    return null
  }

  return `${missing.label} là bắt buộc.`
}

export function resolveOptions(field: FieldConfig, lookups: Record<string, OptionItem[]>): OptionItem[] {
  if (!field.options) return []
  return typeof field.options === 'function' ? field.options(lookups) : field.options
}
