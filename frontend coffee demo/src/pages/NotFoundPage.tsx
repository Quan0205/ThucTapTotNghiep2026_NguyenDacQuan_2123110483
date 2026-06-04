import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel max-w-xl rounded-3xl p-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-coffee-700 text-white">
          404
        </div>
        <h1 className="text-2xl font-extrabold text-coffee-900">Không tìm thấy trang</h1>
        <p className="mt-2 text-sm text-stone-600">
          Đường dẫn hiện tại không tồn tại trong demo frontend CoffeeHRM.
        </p>
        <div className="mt-6">
          <Link
            className="inline-flex items-center justify-center rounded-xl bg-coffee-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-coffee-800"
            to="/"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}
