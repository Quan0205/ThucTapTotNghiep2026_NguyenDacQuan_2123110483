import { Lock } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(120,78,27,0.12),_transparent_30%),linear-gradient(180deg,#fffaf4_0%,#f5efe7_100%)] px-4">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/60 bg-white/80 p-8 text-center shadow-2xl shadow-coffee-900/10 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-coffee-700 text-white">
          <Lock size={22} />
        </div>
        <h1 className="mt-6 text-3xl font-black text-coffee-900">Không có quyền truy cập</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Tài khoản hiện tại chưa được cấp quyền cho màn hình này. Hãy quay về dashboard hoặc liên hệ quản trị viên.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-coffee-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-coffee-800"
            to="/"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}
