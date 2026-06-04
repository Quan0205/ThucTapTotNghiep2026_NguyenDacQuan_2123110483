import type { ReactNode } from 'react'

export interface TableColumn<T> {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  className?: string
  render?: (row: T) => ReactNode
}

type Props<T> = {
  columns: Array<TableColumn<T>>
  rows: T[]
  rowKey: (row: T) => string | number
  emptyText?: string
}

export function Table<T>({ columns, rows, rowKey, emptyText = 'Không có dữ liệu' }: Props<T>) {
  return (
    <div className="overflow-auto rounded-[1.5rem] border border-white/60 bg-white/60 shadow-lg shadow-coffee-900/5 scrollbar-thin backdrop-blur-xl">
      <table className="min-w-full divide-y divide-slate-200/60">
        <thead className="bg-white/40">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500 ${column.className ?? ''}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/50 bg-white/40">
          {rows.length === 0 ? (
            <tr>
              <td className="px-5 py-16 text-center text-sm font-medium text-slate-500" colSpan={columns.length}>
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)} className="transition-colors duration-200 hover:bg-white/80">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700 ${column.className ?? ''}`}
                  >
                    {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
