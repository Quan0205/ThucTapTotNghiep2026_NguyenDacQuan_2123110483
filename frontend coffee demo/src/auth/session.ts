import type { AuthResponse, AuthUser } from '../types/models'

export type AuthRealm = 'admin' | 'user'

const STORAGE_KEYS: Record<AuthRealm, string> = {
  admin: 'coffeehrm.auth.admin',
  user: 'coffeehrm.auth.user',
}

function getStorageKey(realm: AuthRealm) {
  return STORAGE_KEYS[realm]
}

export function getAuthRealm(pathname = typeof window === 'undefined' ? '/' : window.location.pathname): AuthRealm {
  return pathname.startsWith('/admin') ? 'admin' : 'user'
}

export function getStoredSession(realm: AuthRealm = getAuthRealm()): AuthResponse | null {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(getStorageKey(realm))
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthResponse
  } catch {
    return null
  }
}

export function setStoredSession(session: AuthResponse, realm: AuthRealm = getAuthRealm()) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(getStorageKey(realm), JSON.stringify(session))
}

export function clearStoredSession(realm: AuthRealm = getAuthRealm()) {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(getStorageKey(realm))
}

export function getStoredAccessToken(realm: AuthRealm = getAuthRealm()) {
  return getStoredSession(realm)?.accessToken ?? null
}

export function getStoredRefreshToken(realm: AuthRealm = getAuthRealm()) {
  return getStoredSession(realm)?.refreshToken ?? null
}

export function getStoredUser(realm: AuthRealm = getAuthRealm()): AuthUser | null {
  return getStoredSession(realm)?.user ?? null
}

