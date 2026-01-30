import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ROUTES } from '@/lib/constants'
import { pageVariants, pageTransition } from '@/lib/animations'
import { Skeleton } from '@/components/common/Skeleton'

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

// Animated page wrapper
function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      style={{ height: '100%' }}
    >
      {children}
    </motion.div>
  )
}

// Loading Component — skeleton layout instead of plain spinner
const PageLoader = () => (
  <div className="flex flex-col min-h-screen bg-background text-foreground">
    {/* Header skeleton */}
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-4 w-32" />
      <div className="ml-auto flex gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
    {/* Content skeleton rows */}
    <div className="flex-1 px-4 py-3 space-y-4">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
    {/* Bottom nav skeleton */}
    <div className="flex items-center justify-around px-4 py-3 border-t border-border">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-6 w-6 rounded" />
      ))}
    </div>
  </div>
)

export function AppRoutes() {
  const location = useLocation()

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route
            path={ROUTES.LOGIN}
            element={
              <AnimatedPage>
                <LoginPage />
              </AnimatedPage>
            }
          />
          <Route
            path={ROUTES.REGISTER}
            element={
              <AnimatedPage>
                <RegisterPage />
              </AnimatedPage>
            }
          />

          {/* Protected routes - Phone pages have built-in frame */}
          <Route element={<AuthGuard />}>
            <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <AnimatedPage>
                  <PhoneDashboardPage />
                </AnimatedPage>
              }
            />
            <Route
              path={ROUTES.CONVERSATIONS}
              element={
                <AnimatedPage>
                  <PhoneChatsPage />
                </AnimatedPage>
              }
            />
            <Route
              path={ROUTES.CHAT}
              element={
                <AnimatedPage>
                  <PhoneChatsPage />
                </AnimatedPage>
              }
            />
            <Route
              path={ROUTES.CONTACTS}
              element={
                <AnimatedPage>
                  <PhoneContactsPage />
                </AnimatedPage>
              }
            />
            <Route
              path={ROUTES.SETTINGS}
              element={
                <AnimatedPage>
                  <PhoneSettingsPage />
                </AnimatedPage>
              }
            />
            <Route
              path={ROUTES.MEDIA_LIBRARY}
              element={
                <AnimatedPage>
                  <MediaLibraryPage />
                </AnimatedPage>
              }
            />
            <Route element={<RootLayout />}>
              <Route
                path={ROUTES.PROFILE}
                element={
                  <AnimatedPage>
                    <ProfilePage />
                  </AnimatedPage>
                }
              />
            </Route>
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <AnimatedPage>
                <NotFoundPage />
              </AnimatedPage>
            }
          />
        </Routes>
      </AnimatePresence>
    </Suspense>
  )
}
