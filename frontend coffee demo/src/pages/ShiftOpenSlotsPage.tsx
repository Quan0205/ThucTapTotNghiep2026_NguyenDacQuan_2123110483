import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Pencil, Plus, Store, Trash2 } from 'lucide-react'
import { api } from '../api/coffeeApi'
import type { OptionItem, ShiftOpenSlot } from '../types/models'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { LoadingView, ErrorView, EmptyView } from '../components/ui/StateViews'
import { formatDate, formatTimeInput, toDateOnlyPayload } from '../utils/format'

type ShiftOpenSlotForm = {
  branchId: string
  shiftId: string
  slotDate: string
  capacity: string
  note: string
}

type BulkShiftOpenSlotForm = {
  branchIds: string[]
  shiftIds: string[]
  slotDates: string[]
  capacity: string
  note: string
}

function toKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function mondayOf(date: Date) {
  const clone = new Date(date)
  const day = clone.getDay() === 0 ? 7 : clone.getDay()
  clone.setDate(clone.getDate() - (day - 1))
  clone.setHours(0, 0, 0, 0)
  return clone
}

function addDays(date: Date, days: number) {
  const clone = new Date(date)
  clone.setDate(clone.getDate() + days)
  return clone
}

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
}

export function ShiftOpenSlotsPage() {
  const [items, setItems] = useState<ShiftOpenSlot[]>([])
  const [branchOptions, setBranchOptions] = useState<OptionItem[]>([])
  const [shiftOptions, setShiftOptions] = useState<OptionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState(() => toKey(mondayOf(new Date())))
  const [selectedDay, setSelectedDay] = useState(() => toKey(new Date()))
  const [branchFilter, setBranchFilter] = useState('')
  const [shiftFilter, setShiftFilter] = useState('')
  const [singleOpen, setSingleOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [singleForm, setSingleForm] = useState<ShiftOpenSlotForm>({
    branchId: '',
    shiftId: '',
    slotDate: '',
    capacity: '1',
    note: '',
  })
  const [bulkForm, setBulkForm] = useState<BulkShiftOpenSlotForm>({
    branchIds: [],
    shiftIds: [],
    slotDates: [],
    capacity: '1',
    note: '',
  })

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [slots, branches, shifts] = await Promise.all([
        api.shiftOpenSlots.list({ weekStart }),
        api.options.branchOptions(),
        api.options.shiftOptions(),
      ])
      setItems(slots)
      setBranchOptions(branches)
      setShiftOptions(shifts)
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Khong the tai ca mo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setSelectedDay(weekStart)
    void load()
  }, [weekStart])

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(new Date(`${weekStart}T00:00:00`), index)), [weekStart])
  const weekDayKeys = useMemo(() => weekDays.map((day) => toKey(day)), [weekDays])
  const activeItems = useMemo(() => items.filter((slot) => slot.isActive), [items])
  const visibleItems = useMemo(
    () =>
      activeItems.filter((slot) => {
        const matchBranch = branchFilter ? String(slot.branchId) === branchFilter : true
        const matchShift = shiftFilter ? String(slot.shiftId) === shiftFilter : true
        return matchBranch && matchShift
      }),
    [activeItems, branchFilter, shiftFilter],
  )
  const selectedDaySlots = useMemo(() => visibleItems.filter((slot) => slot.slotDate.slice(0, 10) === selectedDay), [selectedDay, visibleItems])
  const groupedByDay = useMemo(() => {
    const map = new Map<string, ShiftOpenSlot[]>()
    for (const slot of visibleItems) {
      const key = slot.slotDate.slice(0, 10)
      const current = map.get(key) ?? []
      current.push(slot)
      map.set(key, current)
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.startTime.localeCompare(b.startTime))
    }
    return map
  }, [visibleItems])

  function openSingleCreate(prefillDate?: string) {
    setEditingId(null)
    setSingleForm({
      branchId: branchFilter || branchOptions[0]?.value || '',
      shiftId: shiftFilter || shiftOptions[0]?.value || '',
      slotDate: prefillDate ?? selectedDay,
      capacity: '1',
      note: '',
    })
    setSingleOpen(true)
    setMessage(null)
  }

  function openEdit(slot: ShiftOpenSlot) {
    setEditingId(slot.id)
    setSingleForm({
      branchId: String(slot.branchId),
      shiftId: String(slot.shiftId),
      slotDate: slot.slotDate.slice(0, 10),
      capacity: String(slot.capacity),
      note: slot.note ?? '',
    })
    setSingleOpen(true)
    setMessage(null)
  }

  function openBulkCreate() {
    setBulkForm({
      branchIds: branchFilter ? [branchFilter] : [],
      shiftIds: shiftFilter ? [shiftFilter] : [],
      slotDates: weekDayKeys,
      capacity: '1',
      note: '',
    })
    setBulkOpen(true)
    setMessage(null)
  }

  async function submitSingle() {
    if (!singleForm.branchId || !singleForm.shiftId || !singleForm.slotDate) {
      setMessage('Vui long nhap du thong tin.')
      return
    }

    const slotDateKey = toDateOnlyPayload(singleForm.slotDate) as string
    const duplicate = items.some(
      (slot) =>
        slot.id !== editingId &&
        String(slot.branchId) === singleForm.branchId &&
        String(slot.shiftId) === singleForm.shiftId &&
        slot.slotDate.slice(0, 10) === slotDateKey,
    )
    if (duplicate) {
      setMessage('Slot nay da ton tai cho chi nhanh va ca da chon.')
      return
    }

    setSaving(true)
    setMessage(null)
    try {
      const payload = {
        branchId: Number(singleForm.branchId),
        shiftId: Number(singleForm.shiftId),
        slotDate: slotDateKey,
        capacity: Number(singleForm.capacity) || 1,
        note: singleForm.note || null,
      }

      if (editingId) {
        await api.shiftOpenSlots.update(editingId, payload)
        setMessage('Da cap nhat ca mo.')
      } else {
        await api.shiftOpenSlots.create(payload)
        setMessage('Da tao ca mo.')
      }

      setSingleOpen(false)
      await load()
    } catch (error_) {
      setMessage(error_ instanceof Error ? error_.message : 'Khong the luu ca mo.')
    } finally {
      setSaving(false)
    }
  }

  async function submitBulk() {
    if (bulkForm.branchIds.length === 0 || bulkForm.shiftIds.length === 0 || bulkForm.slotDates.length === 0) {
      setMessage('Vui long chon it nhat 1 chi nhanh, 1 ca va 1 ngay.')
      return
    }

    setSaving(true)
    setMessage(null)
    try {
      const result = await api.shiftOpenSlots.bulkCreate({
        branchIds: bulkForm.branchIds.map(Number),
        shiftIds: bulkForm.shiftIds.map(Number),
        slotDates: bulkForm.slotDates.map((date) => toDateOnlyPayload(date) as string),
        capacity: Number(bulkForm.capacity) || 1,
        note: bulkForm.note || null,
      })
      setBulkOpen(false)
      setMessage(result.message)
      await load()
    } catch (error_) {
      setMessage(error_ instanceof Error ? error_.message : 'Khong the tao hang loat.')
    } finally {
      setSaving(false)
    }
  }

  async function removeSlot(slot: ShiftOpenSlot) {
    const confirmed = window.confirm(`Xoa/khong kich hoat ca "${slot.shiftName}" ngay ${formatDate(slot.slotDate)}?`)
    if (!confirmed) return

    setSaving(true)
    setMessage(null)
    try {
      await api.shiftOpenSlots.remove(slot.id)
      setMessage('Da xoa ca mo.')
      await load()
    } catch (error_) {
      setMessage(error_ instanceof Error ? error_.message : 'Khong the xoa ca mo.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingView label="Dang tai ca mo..." />
  if (error) return <ErrorView message={error} />

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Ca mo</div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Quan ly slot ca theo tuan</h2>
            <p className="text-sm text-slate-500">Tao le, tao hang loat theo tuan, sua va xoa slot da tao.</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" type="button" onClick={() => setWeekStart(toKey(addDays(new Date(`${weekStart}T00:00:00`), -7)))}>
                <ChevronLeft size={16} />
                Tuan truoc
              </Button>
              <Button variant="secondary" type="button" onClick={() => setWeekStart(toKey(mondayOf(new Date())))}>
                Hom nay
              </Button>
              <Button variant="secondary" type="button" onClick={() => setWeekStart(toKey(addDays(new Date(`${weekStart}T00:00:00`), 7)))}>
                Tuan sau
                <ChevronRight size={16} />
              </Button>
              <Button variant="secondary" type="button" onClick={openBulkCreate}>
                <Store size={16} />
                Tao hang loat
              </Button>
              <Button onClick={() => openSingleCreate(selectedDay)}>
                <Plus size={16} />
                Tao slot
              </Button>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Loc chi nhanh</span>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={branchFilter}
                  onChange={(event) => setBranchFilter(event.target.value)}
                >
                  <option value="">Tat ca chi nhanh</option>
                  {branchOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Loc ca</span>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={shiftFilter}
                  onChange={(event) => setShiftFilter(event.target.value)}
                >
                  <option value="">Tat ca ca</option>
                  {shiftOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setBranchFilter('')
                  setShiftFilter('')
                }}
              >
                Xoa loc
              </Button>
              <Badge tone="info">{visibleItems.length} slot phu hop</Badge>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {weekDays.map((day) => {
            const key = toKey(day)
            return (
              <button
                key={key}
                type="button"
                className={[
                  'rounded-full px-4 py-2 text-sm font-semibold transition',
                  selectedDay === key ? 'bg-coffee-700 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-coffee-50',
                ].join(' ')}
                onClick={() => setSelectedDay(key)}
              >
                {formatDate(key)}
              </button>
            )
          })}
        </div>
        {message ? <div className="mt-4 rounded-2xl bg-coffee-50 px-4 py-3 text-sm text-coffee-800">{message}</div> : null}
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Ngay dang xem</div>
              <h3 className="mt-1 text-xl font-black text-slate-900">{formatDate(selectedDay)}</h3>
            </div>
            <Badge tone="info">{selectedDaySlots.length} slot</Badge>
          </div>
          <div className="mt-4 space-y-3">
            {selectedDaySlots.length > 0 ? (
              selectedDaySlots.map((slot) => (
                <div key={slot.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-base font-black text-slate-900">{slot.shiftName}</div>
                        <Badge tone={slot.isFull ? 'danger' : 'warning'}>{slot.isFull ? 'Day' : 'Con cho'}</Badge>
                      </div>
                      <div className="text-sm text-slate-600">
                        {formatDate(slot.slotDate)} · {formatTimeInput(slot.startTime)} - {formatTimeInput(slot.endTime)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {slot.branchName} · {slot.note ?? 'Khong co ghi chu'}
                      </div>
                    </div>
                    <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 px-3 py-2">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Da chon</div>
                        <div className="mt-1 font-semibold text-slate-900">{slot.selectedCount}/{slot.capacity}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-3 py-2">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Ca</div>
                        <div className="mt-1 font-semibold text-slate-900">{slot.shiftCode}</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="secondary" type="button" onClick={() => openEdit(slot)}>
                      <Pencil size={16} />
                      Sua
                    </Button>
                    <Button variant="danger" type="button" onClick={() => void removeSlot(slot)} disabled={saving}>
                      <Trash2 size={16} />
                      Xoa/Khong kich hoat
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyView message={branchFilter || shiftFilter ? 'Khong co slot phu hop bo loc.' : 'Ngay nay chua co slot mo.'} />
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Store size={18} className="text-coffee-700" />
            <h3 className="text-lg font-bold text-coffee-900">Slot theo tuan</h3>
          </div>
          <div className="mt-4 space-y-3">
            {weekDays.map((day) => {
              const key = toKey(day)
              const slots = groupedByDay.get(key) ?? []
              return (
                <button
                  key={key}
                  type="button"
                  className="flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-coffee-300 hover:bg-coffee-50"
                  onClick={() => setSelectedDay(key)}
                >
                  <div>
                    <div className="font-bold text-slate-900">{formatDate(key)}</div>
                    <div className="text-xs text-slate-500">{slots.length} slot</div>
                  </div>
                  <Badge tone={slots.length === 0 ? 'neutral' : slots.some((slot) => slot.isFull) ? 'warning' : 'success'}>
                    {slots.length === 0 ? 'Trong' : `${slots.filter((slot) => slot.isFull).length}/${slots.length} day`}
                  </Badge>
                </button>
              )
            })}
          </div>
        </Card>
      </div>

      <Modal
        open={singleOpen}
        title={editingId ? 'Sua ca mo' : 'Tao ca mo'}
        onClose={() => {
          setSingleOpen(false)
          setEditingId(null)
        }}
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-coffee-900">Chi nhanh</span>
              <select
                className="mt-1 w-full rounded-xl border border-coffee-200 bg-white/90 px-3 py-2 text-sm"
                value={singleForm.branchId}
                onChange={(event) => setSingleForm((current) => ({ ...current, branchId: event.target.value }))}
              >
                <option value="">Chon chi nhanh</option>
                {branchOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-coffee-900">Ca lam</span>
              <select
                className="mt-1 w-full rounded-xl border border-coffee-200 bg-white/90 px-3 py-2 text-sm"
                value={singleForm.shiftId}
                onChange={(event) => setSingleForm((current) => ({ ...current, shiftId: event.target.value }))}
              >
                <option value="">Chon ca</option>
                {shiftOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-coffee-900">Ngay slot</span>
              <input
                className="mt-1 w-full rounded-xl border border-coffee-200 bg-white/90 px-3 py-2 text-sm"
                type="date"
                value={singleForm.slotDate}
                onChange={(event) => setSingleForm((current) => ({ ...current, slotDate: event.target.value }))}
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-coffee-900">Suc chua</span>
              <input
                className="mt-1 w-full rounded-xl border border-coffee-200 bg-white/90 px-3 py-2 text-sm"
                type="number"
                min={1}
                value={singleForm.capacity}
                onChange={(event) => setSingleForm((current) => ({ ...current, capacity: event.target.value }))}
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-semibold text-coffee-900">Ghi chu</span>
            <textarea
              className="mt-1 w-full rounded-xl border border-coffee-200 bg-white/90 px-3 py-2 text-sm"
              rows={4}
              value={singleForm.note}
              onChange={(event) => setSingleForm((current) => ({ ...current, note: event.target.value }))}
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setSingleOpen(false)
                setEditingId(null)
              }}
            >
              Huy
            </Button>
            <Button disabled={saving} type="button" onClick={() => void submitSingle()}>
              {saving ? 'Dang luu...' : editingId ? 'Cap nhat' : 'Luu slot'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={bulkOpen} title="Tao hang loat ca mo" onClose={() => setBulkOpen(false)}>
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-semibold text-coffee-900">Chi nhanh</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setBulkForm((current) => ({ ...current, branchIds: branchOptions.map((option) => option.value) }))}
                >
                  Chon tat ca
                </Button>
                <Button variant="secondary" type="button" onClick={() => setBulkForm((current) => ({ ...current, branchIds: [] }))}>
                  Bo tat ca
                </Button>
              </div>
              <div className="max-h-56 overflow-auto rounded-2xl border border-slate-200 bg-white p-3">
                <div className="space-y-2">
                  {branchOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={bulkForm.branchIds.includes(option.value)}
                        onChange={() =>
                          setBulkForm((current) => ({
                            ...current,
                            branchIds: toggleValue(current.branchIds, option.value),
                          }))
                        }
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold text-coffee-900">Ca lam</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setBulkForm((current) => ({ ...current, shiftIds: shiftOptions.map((option) => option.value) }))}
                >
                  Chon tat ca
                </Button>
                <Button variant="secondary" type="button" onClick={() => setBulkForm((current) => ({ ...current, shiftIds: [] }))}>
                  Bo tat ca
                </Button>
              </div>
              <div className="max-h-56 overflow-auto rounded-2xl border border-slate-200 bg-white p-3">
                <div className="space-y-2">
                  {shiftOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={bulkForm.shiftIds.includes(option.value)}
                        onChange={() =>
                          setBulkForm((current) => ({
                            ...current,
                            shiftIds: toggleValue(current.shiftIds, option.value),
                          }))
                        }
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-coffee-900">Ngay trong tuan</div>
              <div className="flex gap-2">
                <Button variant="secondary" type="button" onClick={() => setBulkForm((current) => ({ ...current, slotDates: weekDayKeys }))}>
                  Chon ca tuan
                </Button>
                <Button variant="secondary" type="button" onClick={() => setBulkForm((current) => ({ ...current, slotDates: [] }))}>
                  Bo ca tuan
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-7">
              {weekDays.map((day) => {
                const key = toKey(day)
                return (
                  <button
                    key={key}
                    type="button"
                    className={[
                      'rounded-2xl px-3 py-3 text-left text-sm font-semibold transition',
                      bulkForm.slotDates.includes(key) ? 'bg-coffee-700 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-coffee-50',
                    ].join(' ')}
                    onClick={() =>
                      setBulkForm((current) => ({
                        ...current,
                        slotDates: toggleValue(current.slotDates, key),
                      }))
                    }
                  >
                    {day.toLocaleDateString('vi-VN', { weekday: 'short' })}
                    <div className="mt-1 text-lg font-black">{day.getDate()}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-coffee-900">Suc chua moi slot</span>
              <input
                className="mt-1 w-full rounded-xl border border-coffee-200 bg-white/90 px-3 py-2 text-sm"
                type="number"
                min={1}
                value={bulkForm.capacity}
                onChange={(event) => setBulkForm((current) => ({ ...current, capacity: event.target.value }))}
              />
            </label>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
              Se tao <span className="font-bold text-slate-900">{bulkForm.branchIds.length * bulkForm.shiftIds.length * bulkForm.slotDates.length}</span> slot neu khong trung.
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-coffee-900">Ghi chu chung</span>
            <textarea
              className="mt-1 w-full rounded-xl border border-coffee-200 bg-white/90 px-3 py-2 text-sm"
              rows={4}
              value={bulkForm.note}
              onChange={(event) => setBulkForm((current) => ({ ...current, note: event.target.value }))}
            />
          </label>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setBulkOpen(false)}>
              Huy
            </Button>
            <Button disabled={saving} type="button" onClick={() => void submitBulk()}>
              {saving ? 'Dang tao...' : 'Tao hang loat'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
