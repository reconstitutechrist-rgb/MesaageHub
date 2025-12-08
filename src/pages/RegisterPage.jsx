import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants'
import { MessageSquare } from 'lucide-react'

export default function RegisterPage() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    toast.success('Account created! Please sign in.')
    navigate(ROUTES.LOGIN)
  }

  const handleError = (error) => {
    toast.error(error)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MessageSquare className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Get started with MessageHub
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm onSuccess={handleSuccess} onError={handleError} />
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
