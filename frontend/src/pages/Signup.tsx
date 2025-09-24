import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useSignUp } from '@/services/react-query/hooks'
import { queryClient } from '@/services/react-query/queryClient'
import { setAuth } from '@/services/auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export default function SignupPage() {
  const navigate = useNavigate()
  const [firstName, setFirstname] = useState('')
  const [lastName, setLastname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { mutateAsync } = useSignUp()

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Store credentials (basic auth token). Backend will verify on first request.

      const { token }: any = await mutateAsync({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      })

      setAuth(token)

      // Invalidate cached user/chats so they re-fetch with new credentials
      queryClient.invalidateQueries()

      // Navigate to home
      navigate({ to: '/' })
    } catch (err) {
      setError('Failed to login')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create an account</CardTitle>
              <CardDescription>
                Enter your email below to create your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-3">
                <div className="flex flex-col gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="firstname">Firstname</Label>
                    <Input
                      className="input"
                      placeholder="Firstname"
                      type="text"
                      name="firstname"
                      value={firstName}
                      onChange={(e) => setFirstname(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="lastname">Lastname</Label>
                    <Input
                      className="input"
                      placeholder="Lastname"
                      type="text"
                      name="lastname"
                      value={lastName}
                      onChange={(e) => setLastname(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      className="input"
                      placeholder="Email"
                      type="text"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <Input
                      className="input"
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-destructive">{error}</div>
                  )}

                  <div className="mt-3 flex items-center justify-end gap-2">
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Signing up...' : 'Sign up'}
                    </Button>
                  </div>
                </div>
                <div className="text-center text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="underline underline-offset-4">
                    Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
