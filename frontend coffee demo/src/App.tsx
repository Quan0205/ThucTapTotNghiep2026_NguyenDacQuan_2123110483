import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, RequireAuth, RequirePermission } from './auth/AuthProvider'
import { AppShell } from './components/layout/AppShell'
import { paths } from './config/paths'
import { routes as adminRoutes } from './config/routes'
import { HomePage } from './pages/HomePage'
import { CareersPage } from './pages/CareersPage'
import { ForbiddenPage } from './pages/ForbiddenPage'
import { EmployeePortalPage } from './pages/EmployeePortalPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path={paths.publicHome} element={<HomePage />} />
          <Route path={paths.userLogin} element={<LoginPage mode="user" />} />
          <Route path={paths.adminLogin} element={<LoginPage mode="admin" />} />
          <Route path={paths.recruitment} element={<CareersPage />} />
          <Route
            path={paths.employeePortal}
            element={
              <RequirePermission redirectTo={paths.userLogin} permissions={['self.shift.view']}>
                <EmployeePortalPage />
              </RequirePermission>
            }
          />

          <Route
            path={paths.adminRoot}
            element={
              <RequireAuth redirectTo={paths.adminLogin}>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to={paths.adminDashboard} replace />} />
            {adminRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <RequirePermission redirectTo={paths.adminLogin} permissions={route.permissions as readonly string[] | undefined}>
                    <route.component />
                  </RequirePermission>
                }
              />
            ))}
          </Route>

          {adminRoutes.map((route) => (
            <Route
              key={`legacy-${route.path}`}
              path={route.path}
              element={<Navigate to={`${paths.adminRoot}/${route.path}`} replace />}
            />
          ))}
          <Route path={paths.legacyLogin} element={<Navigate to={paths.userLogin} replace />} />
          <Route path={paths.legacyLoginOld} element={<Navigate to={paths.userLogin} replace />} />
          <Route path={paths.legacyEmployeePortal} element={<Navigate to={paths.employeePortal} replace />} />
          <Route path={paths.legacyRecruitment} element={<Navigate to={paths.recruitment} replace />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
