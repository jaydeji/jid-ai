import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { setAuth } from '@/services/auth'
import { queryClient } from '@/services/react-query/hooks'

export default function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Store credentials (basic auth token). Backend will verify on first request.
      setAuth(username, password)

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
    <div className="flex items-center justify-center h-screen p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-6">
        <h2 className="mb-4 text-xl font-semibold">Sign in</h2>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <label className="grid gap-1 text-sm">
            <span>Username</span>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Password</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <div className="mt-3 flex items-center justify-end gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
