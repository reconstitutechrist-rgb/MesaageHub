import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'

// Layouts
import RootLayout from '@/components/layout/RootLayout'

// Lazy Load Pages
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// Phone Pages
const PhoneDashboardPage = lazy(() =>
  import('@/pages/phone').then((module) => ({ default: module.PhoneDashboardPage }))
)
const PhoneChatsPage = lazy(() =>
  import('@/pages/phone').then((module) => ({ default: module.PhoneChatsPage }))
)
const PhoneContactsPage = lazy(() =>
  import('@/pages/phone').then((module) => ({ default: module.PhoneContactsPage }))
)
const PhoneSettingsPage = lazy(() =>
  import('@/pages/phone').then((module) => ({ default: module.PhoneSettingsPage }))
)
const MediaLibraryPage = lazy(() =>
  import('@/pages/phone').then((module) => ({ default: module.MediaLibraryPage }))
)

// Auth guard component
import { AuthGuard } from '@/features/auth/components/AuthGuard'

// Loading Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
    <div className="animate-pulse space-y-4 text-center">
      <div className="h-12 w-12 rounded-full bg-primary/20 mx-auto mb-4 animate-spin border-t-2 border-primary"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
)

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
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
          <Route path={ROUTES.MEDIA_LIBRARY} element={<MediaLibraryPage />} />
          <Route element={<RootLayout />}>
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
