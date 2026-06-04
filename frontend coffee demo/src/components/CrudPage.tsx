import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import type { TableColumn } from './ui/Table'
import { Table } from './ui/Table'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'
import { FormField, type FieldConfig, type FormValue } from './ui/FormFields'
import { EmptyView, ErrorView, LoadingView } from './ui/StateViews'
import { getInitialFormValues, validateRequiredFields } from '../utils/form'
import type { OptionItem } from '../types/models'

type FormState = Record<string, FormValue>

export interface CrudPageConfig<TItem> {
  title: string
  description?: string
  addButtonLabel?: string
  emptyText?: string
  searchPlaceholder?: string
  allowCreate?: boolean
  allowEdit?: boolean
  deleteLabel?: string
  rowKey: (row: TItem) => string | number
  columns: Array<TableColumn<TItem>>
  fields: FieldConfig[]
  fetchItems: () => Promise<TItem[]>
  createItem?: (payload: Record<string, unknown>) => Promise<unknown>
  updateItem?: (id: number, payload: Record<string, unknown>) => Promise<unknown>
  deleteItem?: (id: number) => Promise<unknown>
  mapItemToForm: (item: TItem) => FormState
  buildPayload: (form: FormState) => Record<string, unknown>
  searchableFields?: Array<(row: TItem) => string>
  lookupLoaders?: Record<string, () => Promise<OptionItem[]>>
  createButtonNote?: string
  footerNote?: string
}

type Props<TItem> = {
  config: CrudPageConfig<TItem>
}

export function CrudPage<TItem>({ config }: Props<TItem>) {
  const [items, setItems] = useState<TItem[]>([])
  const [lookups, setLookups] = useState<Record<string, OptionItem[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TItem | null>(null)
  const [formState, setFormState] = useState<FormState>(getInitialFormValues(config.fields))
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [rows, lookupEntries] = await Promise.all([
        config.fetchItems(),
        Promise.all(
          Object.entries(config.lookupLoaders ?? {}).map(async ([key, loader]) => [key, await loader()] as const),
        ),
      ])
      setItems(rows)
      setLookups(Object.fromEntries(lookupEntries))
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Không thể tải dữ liệu.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items
    const query = search.toLowerCase()
    const fields = config.searchableFields ?? []
    if (fields.length === 0) return items
    return items.filter((item) => fields.some((getValue) => getValue(item).toLowerCase().includes(query)))
  }, [items, search, config.searchableFields])

  const tableColumns = useMemo(
    () => [
      ...config.columns,
      {
        key: 'actions',
        label: 'Thao tác',
        render: (row: TItem) => (
          <div className="flex flex-wrap items-center gap-2">
            {config.allowEdit !== false && config.updateItem ? (
              <Button type="button" variant="secondary" onClick={() => openEdit(row)}>
                <Pencil size={16} />
                Sửa
              </Button>
            ) : null}
            {config.deleteItem ? (
              <Button type="button" variant="danger" onClick={() => handleDelete(row)}>
                <Trash2 size={16} />
                {config.deleteLabel ?? 'Xóa'}
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [config.columns, config.allowEdit, config.deleteItem, config.deleteLabel, config.updateItem],
  )

  function openCreate() {
    setEditingItem(null)
    setFormState(getInitialFormValues(config.fields))
    setFormError(null)
    setIsModalOpen(true)
  }

  function openEdit(item: TItem) {
    setEditingItem(item)
    const nextForm = config.mapItemToForm(item)
    for (const field of config.fields) {
      if (field.type === 'password') {
        nextForm[field.name] = ''
      }
    }
    setFormState(nextForm)
    setFormError(null)
    setIsModalOpen(true)
  }

  function updateField(name: string, value: FormValue) {
    setFormState((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateRequiredFields(config.fields, formState, !editingItem)
    if (validationError) {
      setFormError(validationError)
      return
    }

    const payload = config.buildPayload(formState)
    setSaving(true)
    setFormError(null)

    try {
      if (editingItem) {
        if (!config.updateItem) throw new Error('Chức năng cập nhật chưa được hỗ trợ.')
        await config.updateItem(config.rowKey(editingItem) as number, payload)
      } else {
        if (!config.createItem) throw new Error('Chức năng thêm mới chưa được hỗ trợ.')
        await config.createItem(payload)
      }
      setIsModalOpen(false)
      await loadData()
    } catch (error_) {
      setFormError(error_ instanceof Error ? error_.message : 'Không thể lưu dữ liệu.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: TItem) {
    if (!config.deleteItem) return
    const label = config.deleteLabel ?? 'Xóa'
    const confirmed = window.confirm(`${label} bản ghi này?`)
    if (!confirmed) return

    try {
      await config.deleteItem(config.rowKey(item) as number)
      await loadData()
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Không thể xóa dữ liệu.')
    }
  }

  return (
    <section className="space-y-5">
      <div className="glass-panel rounded-3xl p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{config.title}</h2>
            {config.description ? <p className="text-sm leading-6 text-slate-600">{config.description}</p> : null}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                className="w-full min-w-[260px] rounded-2xl border border-slate-200 bg-white/90 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-coffee-500 focus:ring-4 focus:ring-coffee-100"
                placeholder={config.searchPlaceholder ?? 'Tìm kiếm...'}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            {config.allowCreate !== false && config.createItem ? (
              <Button type="button" onClick={openCreate}>
                <Plus size={16} />
                {config.addButtonLabel ?? 'Thêm mới'}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {loading ? <LoadingView /> : error ? <ErrorView message={error} /> : null}

      {!loading && !error ? (
        filteredItems.length > 0 ? (
          <Table columns={tableColumns} emptyText={config.emptyText} rowKey={config.rowKey} rows={filteredItems} />
        ) : (
          <EmptyView message={config.emptyText ?? 'Không có dữ liệu'} />
        )
      ) : null}

      {config.footerNote ? <p className="text-xs text-slate-500">{config.footerNote}</p> : null}

      <Modal
        open={isModalOpen}
        title={editingItem ? `Cập nhật ${config.title.toLowerCase()}` : `Thêm ${config.title.toLowerCase()}`}
        onClose={() => setIsModalOpen(false)}
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            {config.fields.map((field) => (
              <FormField
                key={field.name}
                field={field}
                lookups={lookups}
                value={formState[field.name] ?? ''}
                onChange={updateField}
              />
            ))}
          </div>

          {formError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</p> : null}

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button disabled={saving} type="submit">
              {saving ? 'Đang lưu...' : editingItem ? 'Cập nhật' : 'Lưu'}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
