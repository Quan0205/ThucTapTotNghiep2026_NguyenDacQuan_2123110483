import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { api } from '../api/coffeeApi'
import { paths } from '../config/paths'
import type { AuthResponse, AuthUser } from '../types/models'
import { clearStoredSession, getAuthRealm, getStoredSession, setStoredSession, type AuthRealm } from './session'

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (username: string, password: string) => Promise<AuthResponse>
  signOut: () => Promise<void>
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: ReadonlyArray<string>) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const activeRealm = getAuthRealm(location.pathname)
  const [sessions, setSessions] = useState<Record<AuthRealm, AuthResponse | null>>({
    admin: null,
    user: null,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function bootstrap() {
      const nextSessions: Record<AuthRealm, AuthResponse | null> = {
        admin: getStoredSession('admin'),
        user: getStoredSession('user'),
      }

      const activeSession = nextSessions[activeRealm]
      if (activeSession) {
        try {
          const refreshed = await api.auth.refresh(activeSession.refreshToken)
          setStoredSession(refreshed, activeRealm)
          nextSessions[activeRealm] = refreshed
        } catch {
          clearStoredSession(activeRealm)
          nextSessions[activeRealm] = null
        }
      }

      const resolvedSession = nextSessions[activeRealm]
      if (resolvedSession) {
        try {
          const currentUser = await api.auth.me()
          const updatedSession = { ...resolvedSession, user: currentUser }
          setStoredSession(updatedSession, activeRealm)
          nextSessions[activeRealm] = updatedSession
        } catch {
          // Keep the existing stored session if the profile refresh fails.
        }
      }

      if (mounted) {
        setSessions(nextSessions)
        setIsLoading(false)
      }
    }

    void bootstrap()

    return () => {
      mounted = false
    }
  }, [activeRealm])

  async function signIn(username: string, password: string) {
    const response = await api.auth.login({ username, password })
    setStoredSession(response, activeRealm)
    setSessions((current) => ({ ...current, [activeRealm]: response }))
    return response
  }

  async function signOut() {
    const currentSession = sessions[activeRealm]
    clearStoredSession(activeRealm)
    setSessions((current) => ({ ...current, [activeRealm]: null }))
    if (currentSession?.refreshToken) {
      try {
        await api.auth.logout(currentSession.refreshToken)
      } catch {
        // Ignore logout network failures; the local session is already gone.
      }
    }
  }

  const session = sessions[activeRealm]

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.accessToken),
      isLoading,
      signIn,
      signOut,
      hasPermission: (permission: string) => Boolean(session?.user.permissions.includes(permission)),
      hasAnyPermission: (permissions: ReadonlyArray<string>) => permissions.some((permission) => Boolean(session?.user.permissions.includes(permission))),
    }),
    [isLoading, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function RequireAuth({ children, redirectTo = paths.userLogin }: { children: ReactNode; redirectTo?: string }) {
  const auth = useAuth()
  const location = useLocation()

  if (auth.isLoading) {
    return <div className="min-h-screen bg-slate-50" />
  }

  if (!auth.isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />
  }

  return <>{children}</>
}

export function RequirePermission({
  permissions,
  children,
  redirectTo = paths.userLogin,
}: {
  permissions?: ReadonlyArray<string>
  children: ReactNode
  redirectTo?: string
}) {
  const auth = useAuth()
  const location = useLocation()

  if (auth.isLoading) {
    return <div className="min-h-screen bg-slate-50" />
  }

  if (!auth.isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />
  }

  if (permissions?.length && !auth.hasAnyPermission(permissions)) {
    return <Navigate to="/forbidden" replace state={{ from: location }} />
  }

  return <>{children}</>
}
