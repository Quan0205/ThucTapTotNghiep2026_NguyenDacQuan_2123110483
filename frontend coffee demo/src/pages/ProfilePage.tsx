import { useEffect, useState, type FormEvent } from 'react'
import { KeyRound, ShieldCheck, UserCircle2 } from 'lucide-react'
import { api } from '../api/coffeeApi'
import { useAuth } from '../auth/AuthProvider'
import type { AuthProfile } from '../types/models'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { LoadingView, ErrorView } from '../components/ui/StateViews'
import { formatDateTime } from '../utils/format'

export function ProfilePage() {
  const auth = useAuth()
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setProfile(await api.auth.profile())
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Không thể tải hồ sơ tài khoản.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      await api.auth.changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setMessage('Đã đổi mật khẩu thành công. Vui lòng đăng nhập lại trên thiết bị khác nếu cần.')
    } catch (error_) {
      setMessage(error_ instanceof Error ? error_.message : 'Không thể đổi mật khẩu.')
    } finally {
      setSaving(false)
    }
  }

  async function logoutAll() {
    await api.auth.logoutAll()
    await auth.signOut()
  }

  if (loading) return <LoadingView label="Đang tải hồ sơ tài khoản..." />
  if (error) return <ErrorView message={error} />
  if (!profile) return null

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-start gap-4">
          <div className="rounded-3xl bg-coffee-100 p-4 text-coffee-700">
            <UserCircle2 size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-coffee-900">{profile.fullName}</h2>
            <p className="text-sm text-stone-600">{profile.username} • {profile.employeeCode}</p>
            <p className="text-sm text-stone-600">{profile.branchName ?? 'Chưa có chi nhánh'} • {profile.jobRoleName ?? 'Chưa có chức vụ'}</p>
            <p className="text-sm text-stone-600">Lần đăng nhập gần nhất: {formatDateTime(profile.lastLoginAt)}</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2 text-coffee-900">
          <ShieldCheck size={18} />
          <h3 className="text-lg font-bold">Quyền hiện tại</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.permissions.map((permission) => (
            <span key={permission} className="rounded-full bg-coffee-50 px-3 py-1 text-xs font-semibold text-coffee-700">
              {permission}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2 text-coffee-900">
          <KeyRound size={18} />
          <h3 className="text-lg font-bold">Đổi mật khẩu</h3>
        </div>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm" type="password" placeholder="Mật khẩu hiện tại" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            <input className="rounded-2xl border border-coffee-200 bg-white px-3 py-2 text-sm" type="password" placeholder="Mật khẩu mới" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          {message ? <p className="rounded-2xl bg-coffee-50 px-4 py-3 text-sm text-coffee-700">{message}</p> : null}
          <div className="flex gap-2">
            <Button disabled={saving} type="submit">{saving ? 'Đang cập nhật...' : 'Đổi mật khẩu'}</Button>
            <Button variant="secondary" type="button" onClick={() => void logoutAll()}>Đăng xuất tất cả phiên</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
