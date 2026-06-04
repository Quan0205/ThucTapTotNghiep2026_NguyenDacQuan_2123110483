import { useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { navGroups, Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

function findRouteLabel(pathname: string, permissions: string[]) {
  const allItems = navGroups(permissions).flatMap((group) => group.items)
  return allItems.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`))?.label ?? 'CoffeeHRM'
}

export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const auth = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const title = useMemo(() => findRouteLabel(location.pathname, auth.user?.permissions ?? []), [location.pathname, auth.user?.permissions])

  async function handleLogout() {
    await auth.signOut()
    navigate('/admin/dang-nhap', { replace: true })
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[290px_minmax(0,1fr)]">
        <div
          className={`fixed inset-y-0 left-0 z-40 w-[290px] transform transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <Sidebar permissions={auth.user?.permissions ?? []} onNavigate={() => setSidebarOpen(false)} />
        </div>
        {sidebarOpen ? (
          <button
            aria-label="Đóng menu"
            className="fixed inset-0 z-30 bg-slate-950/45 lg:hidden"
            type="button"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <main className="flex min-h-screen flex-col">
          <Topbar
            title={title}
            subtitle="Khu vực quản trị bám backend ASP.NET Web API hiện có"
            username={auth.user?.username}
            roleName={auth.user?.systemRoleName ?? auth.user?.jobRoleName ?? undefined}
            onMenuClick={() => setSidebarOpen((current) => !current)}
            onRefresh={() => window.location.reload()}
            onLogout={() => void handleLogout()}
          />
          <div className="flex-1 px-4 py-5 md:px-6 md:py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
