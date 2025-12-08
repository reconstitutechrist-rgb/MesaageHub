import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/components/providers/AuthProvider'
import { LoadingPage } from '@/components/common/LoadingSpinner'
import { ROUTES } from '@/lib/constants'

export function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingPage />
  }

  if (!isAuthenticated) {
    // Redirect to login, preserving the attempted URL
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return <Outlet />
}
