import { useEffect, useMemo, useState } from 'react'
import { Database, Search } from 'lucide-react'
import { api } from '../api/coffeeApi'
import type { AuditLog, OptionItem } from '../types/models'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Table } from '../components/ui/Table'
import { LoadingView, ErrorView, EmptyView } from '../components/ui/StateViews'
import { formatDateTime } from '../utils/format'

export function AuditLogsPage() {
  const [items, setItems] = useState<AuditLog[]>([])
  const [users, setUsers] = useState<OptionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [userAccountId, setUserAccountId] = useState('')
  const [tableName, setTableName] = useState('')
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [logs, userOptions] = await Promise.all([
        api.auditLogs.list({
          fromDate: fromDate ? new Date(fromDate).toISOString() : null,
          toDate: toDate ? new Date(`${toDate}T23:59:59`).toISOString() : null,
          userAccountId: userAccountId ? Number(userAccountId) : null,
          tableName: tableName || null,
        }),
        api.options.userAccountOptions(),
      ])
      setItems(logs)
      setUsers(userOptions)
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Không thể tải audit logs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !search.trim() ||
        [item.action, item.tableName, item.recordId, item.userAccount?.username ?? '', item.ipAddress ?? '']
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase())
      return matchesSearch
    })
  }, [items, search])

  if (loading) return <LoadingView label="Đang tải audit logs..." />
  if (error) return <ErrorView message={error} />

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-coffee-900">Audit logs</h2>
            <p className="text-sm text-stone-600">Theo dõi thay đổi dữ liệu từ backend.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input
              className="w-full rounded-2xl border border-coffee-200 bg-white/90 py-2.5 pl-10 pr-4 text-sm outline-none"
              value={search}
              placeholder="Tìm kiếm..."
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <input className="rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <input className="rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          <select className="rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm" value={userAccountId} onChange={(e) => setUserAccountId(e.target.value)}>
            <option value="">Tất cả user</option>
            {users.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input className="rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm" placeholder="Tên bảng..." value={tableName} onChange={(e) => setTableName(e.target.value)} />
        </div>
      </Card>

      <button
        className="inline-flex items-center gap-2 rounded-2xl border border-coffee-200 bg-white px-4 py-2 text-sm font-semibold text-coffee-800 transition hover:bg-coffee-50"
        type="button"
        onClick={load}
      >
        <Database size={16} />
        Làm mới bộ lọc
      </button>

      {filtered.length > 0 ? (
        <Table
          columns={[
            { key: 'createdAt', label: 'Thời gian', render: (row) => formatDateTime(row.createdAt) },
            { key: 'user', label: 'Người dùng', render: (row) => row.userAccount?.username ?? '—' },
            { key: 'action', label: 'Hành động', render: (row) => <Badge>{row.action}</Badge> },
            { key: 'tableName', label: 'Bảng' },
            { key: 'recordId', label: 'Bản ghi' },
            { key: 'ipAddress', label: 'IP' },
          ]}
          rowKey={(row) => row.id}
          rows={filtered}
        />
      ) : (
        <EmptyView message="Không có audit log phù hợp." />
      )}
    </div>
  )
}
