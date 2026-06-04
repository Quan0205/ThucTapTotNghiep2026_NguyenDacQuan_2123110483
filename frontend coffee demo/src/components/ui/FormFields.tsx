import type { ReactNode } from 'react'
import type { OptionItem } from '../../types/models'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'password'

export type FormValue = string | boolean | string[]

export interface FieldConfig {
  name: string
  label: string
  type: FieldType
  required?: boolean
  requiredOnCreateOnly?: boolean
  placeholder?: string
  step?: number
  min?: number
  max?: number
  rows?: number
  nullable?: boolean
  helpText?: string
  options?: OptionItem[] | ((lookups: Record<string, OptionItem[]>) => OptionItem[])
  renderSuffix?: ReactNode
}

type Props = {
  field: FieldConfig
  value: FormValue
  onChange: (name: string, value: FormValue) => void
  lookups?: Record<string, OptionItem[]>
}

export function FormField({ field, value, onChange, lookups = {} }: Props) {
  const options = typeof field.options === 'function' ? field.options(lookups) : field.options
  const commonClass =
    'mt-1 w-full rounded-xl border border-coffee-200 bg-white/90 px-3 py-2 text-sm text-coffee-900 outline-none transition placeholder:text-stone-400 focus:border-coffee-500 focus:ring-4 focus:ring-coffee-100'

  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-3 rounded-2xl border border-coffee-100 bg-coffee-50/60 px-4 py-3">
        <input
          checked={Boolean(value)}
          className="h-4 w-4 rounded border-coffee-300 text-coffee-700 focus:ring-coffee-500"
          type="checkbox"
          onChange={(event) => onChange(field.name, event.target.checked)}
        />
        <span className="text-sm font-semibold text-coffee-900">{field.label}</span>
      </label>
    )
  }

  return (
    <label className="block">
      <span className="text-sm font-semibold text-coffee-900">
        {field.label}
        {field.required || field.requiredOnCreateOnly ? <span className="ml-1 text-rose-600">*</span> : null}
      </span>
      {field.type === 'textarea' ? (
        <textarea
          className={commonClass}
          placeholder={field.placeholder}
          rows={field.rows ?? 4}
          value={String(value ?? '')}
          onChange={(event) => onChange(field.name, event.target.value)}
        />
      ) : field.type === 'select' ? (
        <select className={commonClass} value={String(value ?? '')} onChange={(event) => onChange(field.name, event.target.value)}>
          <option value="">Chọn {field.label.toLowerCase()}</option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === 'multiselect' ? (
        <select
          multiple
          className={`${commonClass} min-h-36`}
          value={Array.isArray(value) ? value : []}
          onChange={(event) =>
            onChange(
              field.name,
              Array.from(event.target.selectedOptions, (option) => option.value),
            )
          }
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="relative">
          <input
            className={commonClass}
            max={field.max}
            min={field.min}
            placeholder={field.placeholder}
            step={field.step}
            type={field.type}
            value={String(value ?? '')}
            onChange={(event) => onChange(field.name, event.target.value)}
          />
          {field.renderSuffix ? <div className="absolute inset-y-0 right-3 flex items-center">{field.renderSuffix}</div> : null}
        </div>
      )}
      {field.helpText ? <p className="mt-1 text-xs text-stone-500">{field.helpText}</p> : null}
    </label>
  )
}
