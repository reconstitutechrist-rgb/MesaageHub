import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ROUTES } from '@/lib/constants'
import { MessageSquare } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD

  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleSuccess = () => {
    toast.success('Welcome back!')
    navigate(from, { replace: true })
  }

  const handleError = (error) => {
    toast.error(error)
  }

  const handleForgotPasswordSuccess = (email) => {
    toast.success(`Password reset link sent to ${email}`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <MessageSquare className="h-10 w-10 text-primary" />
          </div>
          {!showForgotPassword && (
            <>
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in to your MessageHub account</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {showForgotPassword ? (
            <ForgotPasswordForm
              onBack={() => setShowForgotPassword(false)}
              onSuccess={handleForgotPasswordSuccess}
            />
          ) : (
            <LoginForm
              onSuccess={handleSuccess}
              onError={handleError}
              onForgotPassword={() => setShowForgotPassword(true)}
            />
          )}
        </CardContent>
        {!showForgotPassword && (
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link to={ROUTES.REGISTER} className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
