import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'

// Layouts
import RootLayout from '@/components/layout/RootLayout'

// Pages
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ProfilePage from '@/pages/ProfilePage'
import NotFoundPage from '@/pages/NotFoundPage'

// Phone Pages (standalone with built-in frame and theme)
import {
  PhoneDashboardPage,
  PhoneChatsPage,
  PhoneContactsPage,
  PhoneSettingsPage,
} from '@/pages/phone'

// Auth guard component
import { AuthGuard } from '@/features/auth/components/AuthGuard'

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

      {/* Protected routes - Phone pages have built-in frame */}
      <Route element={<AuthGuard />}>
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path={ROUTES.DASHBOARD} element={<PhoneDashboardPage />} />
        <Route path={ROUTES.CONVERSATIONS} element={<PhoneChatsPage />} />
        <Route path={ROUTES.CHAT} element={<PhoneChatsPage />} />
        <Route path={ROUTES.CONTACTS} element={<PhoneContactsPage />} />
        <Route path={ROUTES.SETTINGS} element={<PhoneSettingsPage />} />
        <Route element={<RootLayout />}>
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
